from __future__ import annotations
from typing import Dict, List, Literal, Union
from pydantic import BaseModel, Field, field_validator, model_validator

# ============================================================
# 基础定义：效果与固词
# ============================================================
Alignment = Literal["positive", "neutral", "negative"]

class EffectDefinition(BaseModel):
    name: str = Field(min_length=1, description="效果名")
    alignment: Alignment = Field(description="性质：positive(正面) neutral(中性) negative(负面)")
    note: str = Field(default="", description="效果说明/备注")

class FixedTermDefinition(BaseModel):
    name: str = Field(min_length=1, description="固词名")
    note: str = Field(default="", description="固词说明/备注")

# ============================================================
# 混入 (Mixins)：解耦卡片通用属性
# ============================================================
class BoundEffectRef(BaseModel):
    id: str = Field(min_length=1, pattern=r"^[a-z0-9][a-z0-9\-_]*$", description="绑定记录 id")
    effect_ref: str = Field(
        min_length=1, 
        pattern=r"^([A-Za-z0-9\-_]+\.)?[A-Za-z0-9\-_]+$", 
        description="效果引用 (通用: burn, 内部: self.xg1, 外部: SET.xg1)"
    )

class BoundFixedTermRef(BaseModel):
    id: str = Field(min_length=1, pattern=r"^[a-z0-9][a-z0-9\-_]*$", description="绑定记录 id")
    term_ref: str = Field(
        min_length=1, 
        pattern=r"^([A-Za-z0-9\-_]+\.)?[A-Za-z0-9\-_]+$", 
        description="固词引用 (通用: shield, 内部: self.gc1, 外部: SET.gc1)"
    )

class WithTextBindings(BaseModel):
    text: str = Field(default="", description="说明文本")
    # 采用 List 结构，天然支持一张卡片引用多个效果或固词
    # 简化版本：直接使用字符串列表而非复杂对象结构
    bound_effects: List[str] = Field(default_factory=list, description="关联的效果引用")
    bound_fixed_terms: List[str] = Field(default_factory=list, description="关联的固词引用")

class CardBaseAttributes(BaseModel):
    """所有卡片实体共用的美术与稀有度属性"""
    rarity: Literal["R", "SR", "SSR"] = Field(default="R", description="稀有度")
    image: str = Field(
        default="", description="卡面图像（大图）", 
        json_schema_extra={"format": "url", "options": {"upload": True}}
    )
    icon: str = Field(
        default="", description="卡图标", 
        json_schema_extra={"format": "url", "options": {"upload": True}}
    )
    brast: str = Field(
        default="", description="2D Q版小图 (Brast)", 
        json_schema_extra={"format": "url", "options": {"upload": True}}
    )

class HpStats(BaseModel):
    hp_init: int = Field(ge=0, description="当前生命值（INIT）")
    hp_limit: int = Field(ge=0, description="最大生命值（LIMIT）")

    @model_validator(mode="after")
    def validate_hp(self) -> "HpStats":
        if self.hp_init > self.hp_limit:
            raise ValueError("hp_init must be <= hp_limit")
        return self

# ============================================================
# 卡片实体定义 (全部继承 CardBaseAttributes 与 WithTextBindings)
# ============================================================
class UnitStage(WithTextBindings, HpStats, CardBaseAttributes):
    stage: Literal[1, 2, 3] = Field(description="阶段编号")
    cost: int = Field(ge=0, description="消耗")
    move: int = Field(ge=0, description="移步力")
    atk: int = Field(description="攻击力")

class Form(BaseModel):
    id: str = Field(min_length=1, pattern=r"^[a-z0-9][a-z0-9\-_]*$", description="形态 id")
    name: str = Field(min_length=1, description="形态名")
    stages: List[UnitStage] = Field(min_length=1, description="阶段列表")

    @model_validator(mode="after")
    def validate_stages(self) -> "Form":
        stage_values = [s.stage for s in self.stages]
        if self.id == "default":
            if set(stage_values) != {1}: raise ValueError("default 必须仅含 stage=1")
        else:
            if 2 not in stage_values or 3 not in stage_values: raise ValueError("非 default 必须含 stage 2 和 3")
        return self

class SummonCard(WithTextBindings, HpStats, CardBaseAttributes):
    id: str = Field(min_length=1, pattern=r"^[a-z0-9][a-z0-9\-_]*$")
    name: str = Field(min_length=1)
    cost: int = Field(ge=0)
    move: int = Field(ge=0)
    atk: int = Field()

class BuildingCard(WithTextBindings, HpStats, CardBaseAttributes):
    id: str = Field(min_length=1, pattern=r"^[a-z0-9][a-z0-9\-_]*$")
    name: str = Field(min_length=1)
    cost: int = Field(ge=0)
    width: int = Field(ge=1)
    height: int = Field(ge=1)
    atk: int = Field()

class ActionCardBase(WithTextBindings, CardBaseAttributes):
    id: str = Field(min_length=1, pattern=r"^[a-z0-9][a-z0-9\-_]*$")
    name: str = Field(min_length=1)
    cost: int = Field(ge=0)

class AttackCard(ActionCardBase):
    card_type: Literal["attack"] = Field(default="attack")
    atk_delta: int = Field()
    is_decision: Literal[False] = Field(default=False)

class AttackDecisionCard(ActionCardBase):
    card_type: Literal["attack"] = Field(default="attack")
    atk_delta: int = Field()
    is_decision: Literal[True] = Field(default=True)
    decision_free_condition: str = Field(min_length=1)

AttackEntry = Union[AttackCard, AttackDecisionCard]

class StrategyCard(ActionCardBase):
    card_type: Literal["strategy"] = Field(default="strategy")
    is_decision: Literal[False] = Field(default=False)

class StrategyDecisionCard(ActionCardBase):
    card_type: Literal["strategy"] = Field(default="strategy")
    is_decision: Literal[True] = Field(default=True)
    decision_free_condition: str = Field(min_length=1)

StrategyEntry = Union[StrategyCard, StrategyDecisionCard]

# ============================================================
# 顶层 Schema：套组 (Set) 与 全局库 (Global Library)
# ============================================================

# 1. 用于验证 data/global_effects.json 等全局文件的顶层模型
class GlobalEffectsSchema(BaseModel):
    effects: Dict[str, EffectDefinition] = Field(default_factory=dict, description="全局效果库")

class GlobalFixedTermsSchema(BaseModel):
    fixed_terms: Dict[str, FixedTermDefinition] = Field(default_factory=dict, description="全局固词库")

# 2. 用于验证 data/set_xxx.json 的套组模型
class SetSchemaV2(BaseModel):
    schema_version: Literal[2] = Field(default=2)
    name: str = Field(min_length=1)
    set_code: str = Field(min_length=1, pattern=r"^[A-Za-z0-9][A-Za-z0-9\-_]*$")
    description: str = Field(default="")
    notes: str = Field(default="")
    archetypes: List[str] = Field(default_factory=list)
    designers: List[str] = Field(default_factory=list)
    
    # 套组局部的词典
    effects: Dict[str, EffectDefinition] = Field(default_factory=dict)
    fixed_terms: Dict[str, FixedTermDefinition] = Field(default_factory=dict)
    
    forms: List[Form] = Field(min_length=1)
    summons: List[SummonCard] = Field(default_factory=list)
    buildings: List[BuildingCard] = Field(default_factory=list)
    attacks: List[AttackEntry] = Field(default_factory=list)
    strategies: List[StrategyEntry] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_default_form_exists(self) -> "SetSchemaV2":
        if not any(f.id == "default" for f in self.forms):
            raise ValueError("forms must include a form with id='default'")
        return self

    @field_validator("archetypes", "designers")
    @classmethod
    def validate_str0_items(cls, v: List[str]) -> List[str]:
        for item in v:
            if not isinstance(item, str) or not item.strip():
                raise ValueError("str0 items must be non-empty strings")
        return v
