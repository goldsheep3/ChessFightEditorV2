# 📚 ChessFight 套组编辑器 (V2) 开发文档

> Text by GitHub Copilot (Gemini 3.1 Pro)

## 一、 项目架构与目录结构
项目采用 Python 包的形式组织核心逻辑，将业务代码与启动脚本、配置、数据及静态资源严格分离。

```text
chessfight-set-editor/
├── run.py                          # 唯一启动脚本
├── requirements.txt                # 依赖清单
├── data/                           # 数据存储目录
│   ├── global_effects.json         # 全局通用效果库
│   ├── global_fixed_terms.json     # 全局通用固词库
│   └── set_xxx.json                # 各个独立套组文件
├── assets/
│   └── image/                      # 图片资源目录
│       ├── global/                 # 通用图片存放处(可选)
│       └── <set_code>/             # 按套组隔离的上传图片
├── logs/                           # 运行日志
└── chessfight_editor/              # 核心 Python 包
    ├── __init__.py
    ├── config.py                   # 路径等全局配置定义
    ├── utils.py                    # 通用工具函数 (文件读写等)
    ├── models.py                   # 核心：Pydantic V2 数据模型
    ├── routes_set.py               # 路由：套组的 CRUD 和上传
    ├── routes_global.py            # 路由：通用库的 CRUD
    ├── app.py                      # Flask 实例工厂与主入口
    ├── static/                     # 前端静态资源 (CSS/JS)
    └── templates/                  # HTML 模板
        ├── index.html              # 首页：套组与通用库导航
        ├── editor.html             # 套组数据编辑器
        ├── global_effects.html     # 通用效果库编辑器
        └── global_fixed_terms.html # 通用固词库编辑器
```

## 二、 核心数据模型设计 (Pydantic V2)
所有数据模型集中在 `chessfight_editor/models.py` 中。

### 1. 通用词库与局部词库的统一
无论是在 `global_effects.json` 还是 `set_xxx.json` 内部，效果和固词的定义结构是完全一致的。
*   **效果 (EffectDefinition)**：包含 `name`、`alignment` (positive/neutral/negative) 和 `note`。
*   **固词 (FixedTermDefinition)**：包含 `name` 和 `note`。

### 2. 卡片实体与统一样式 (Mixin)
所有的卡片（形态阶段、召唤物、建筑、攻击、策略）都统一继承以下特性：
*   **美术与稀有度 (`CardBaseAttributes`)**：强制包含 `rarity` (枚举: R/SR/SSR)，以及支持上传与预览的三个图片字段：`image` (���图)、`icon` (图标)、`brast` (Q版图)。
*   **文本与引用绑定 (`WithTextBindings`)**：包含描述文本 `text`，以及两个列表 `bound_effects` 和 `bound_fixed_terms`。因为是**列表**，所以天然支持**关联多个效果或固词**。

### 3. 命名空间引用规范 (正则表达式校验)
卡片在绑定效果或固词时，`ref` 字段遵循以下严格规范（通过正则 `^([A-Za-z0-9\-_]+\.)?[A-Za-z0-9\-_]+$` 校验）：
*   **通用库引用**：不带前缀，直接写 ID（例如：`burn`, `shield`）。
*   **当前套组引用**：必须带 `self.` 前缀（例如：`self.xg1`, `self.gc1`）。
*   **跨套组引用**：带目标套组的 ID 前缀（例如：`SET_01.xg1`）。

## 三、 前后端工作流

### 1. 页面导航与分离
*   **首页 (`index.html`)**：提供三个入口——进入/创建特定套组编辑器、进入通用效果编辑器、进入通用固词编辑器。
*   **套组编辑器 (`editor.html`)**：加载 `SetSchemaV2`，负责编辑特定套组的所有卡牌和局部词库。
*   **通用库编辑器 (`global_effects.html` 等)**：加载针对字典结构的简化 Schema，专门负责管理全局的 JSON 文件。

### 2. API 与逻辑
所有 API 严格返回 JSON，并使用 HTTP 状态码表示结果。
*   **读取 (`GET`)**：经过 `utils.py` 读取本地 JSON，**不经 Pydantic 校验**直接发给前端渲染（容错，允许旧数据被编辑器加载）。
*   **保存 (`POST`)**：接收前端修改后的数据，**强制通过 Pydantic 校验**，校验失败返回 `400` 及错误详情，校验成功后覆写本地 JSON。
*   **图片上传 (`POST /api/upload/...`)**：所有标记了上传功能的字段在前端触发操作时，文件被发送至该接口，按套组分配目录存储，返回可访问的相对 URL。

---

# 💻 核心代码框架展示

这里展示按最新规范重构后的 `models.py`

```python name=chessfight_editor/models.py
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
    bound_effects: List[BoundEffectRef] = Field(default_factory=list, description="关联的效果引用")
    bound_fixed_terms: List[BoundFixedTermRef] = Field(default_factory=list, description="关联的固词引用")

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
```

最简启动脚本 `run.py` 如下：
```python name=run.py
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

if __name__ == "__main__":
    from chessfight_editor.app import main
    main()
```
