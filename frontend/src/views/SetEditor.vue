<template>
  <div class="editor-layout">
    <!-- Top Bar: Global Controls -->
    <div class="top-bar">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1 class="page-title">{{ pageTitle }}</h1>
      <button class="save-btn primary" @click="saveSet">💾 保存</button>
    </div>

    <div v-if="loading" class="loading-overlay">加载中...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error && setData" class="main-content">
      <!-- Left Panel: Hierarchical Directory Tree -->
      <div class="left-panel">
        <div class="tree-nav">
          <!-- Basic Info -->
          <div 
            class="tree-item"
            :class="{ active: activeTab === 'basic' }"
            @click="selectItem('basic')"
          >
            <span class="tree-icon">◆</span>
            <span class="tree-text">卡牌基本信息</span>
          </div>

          <!-- Forms Section -->
          <div class="tree-section">
            <div class="tree-section-header">
              <span class="tree-icon">◆</span>
              <span class="tree-text">形态卡</span>
            </div>
            <div class="tree-children">
              <template v-for="(form, index) in setData.forms" :key="form.id">
                <div 
                  class="tree-item child"
                  :class="{ active: activeTab === 'forms' && selectedItem.id === form.id }"
                  @click="selectForm(form.id)"
                >
                  <span class="tree-icon">◆</span>
                  <span class="tree-text">
                    {{ form.name }}
                  </span>
                </div>
              </template>
              <div class="tree-item child add-item" @click="addForm">
                <span class="tree-icon">+</span>
                <span class="tree-text">新建形态卡</span>
              </div>
            </div>
          </div>

          <!-- Attacks Section -->
          <div class="tree-section">
            <div class="tree-section-header">
              <span class="tree-icon">◆</span>
              <span class="tree-text">攻击卡</span>
            </div>
            <div class="tree-children">
              <div 
                v-for="(attack, index) in setData.attacks" 
                :key="attack.id"
                class="tree-item child"
                :class="{ active: activeTab === 'attacks' && selectedItem.id === attack.id }"
                @click="selectItem('attacks', attack.id)"
              >
                <span class="tree-icon">◆</span>
                <span class="tree-text">
                  <span :class="['badge', getRarityBadgeClass(attack.rarity)]">{{ attack.rarity }}</span>
                  {{ attack.name }}
                </span>
              </div>
              <div class="tree-item child add-item" @click="addAttack">
                <span class="tree-icon">+</span>
                <span class="tree-text">新建攻击卡</span>
              </div>
            </div>
          </div>

          <!-- Strategies Section -->
          <div class="tree-section">
            <div class="tree-section-header">
              <span class="tree-icon">◆</span>
              <span class="tree-text">策略卡</span>
            </div>
            <div class="tree-children">
              <div 
                v-for="(strategy, index) in setData.strategies" 
                :key="strategy.id"
                class="tree-item child"
                :class="{ active: activeTab === 'strategies' && selectedItem.id === strategy.id }"
                @click="selectItem('strategies', strategy.id)"
              >
                <span class="tree-icon">◆</span>
                <span class="tree-text">
                  <span :class="['badge', getRarityBadgeClass(strategy.rarity)]">{{ strategy.rarity }}</span>
                  {{ strategy.name }}
                </span>
              </div>
              <div class="tree-item child add-item" @click="addStrategy">
                <span class="tree-icon">+</span>
                <span class="tree-text">新建策略卡</span>
              </div>
            </div>
          </div>

          <!-- Summons Section -->
          <div class="tree-section">
            <div class="tree-section-header">
              <span class="tree-icon">◆</span>
              <span class="tree-text">召唤物卡</span>
            </div>
            <div class="tree-children">
              <div 
                v-for="(summon, index) in setData.summons" 
                :key="summon.id"
                class="tree-item child"
                :class="{ active: activeTab === 'summons' && selectedItem.id === summon.id }"
                @click="selectItem('summons', summon.id)"
              >
                <span class="tree-icon">◆</span>
                <span class="tree-text">
                  <span :class="['badge', getRarityBadgeClass(summon.rarity)]">{{ summon.rarity }}</span>
                  {{ summon.name }}
                </span>
              </div>
              <div class="tree-item child add-item" @click="addSummon">
                <span class="tree-icon">+</span>
                <span class="tree-text">新建召唤物卡</span>
              </div>
            </div>
          </div>

          <!-- Buildings Section -->
          <div class="tree-section">
            <div class="tree-section-header">
              <span class="tree-icon">◆</span>
              <span class="tree-text">建筑物卡</span>
            </div>
            <div class="tree-children">
              <div 
                v-for="(building, index) in setData.buildings" 
                :key="building.id"
                class="tree-item child"
                :class="{ active: activeTab === 'buildings' && selectedItem.id === building.id }"
                @click="selectItem('buildings', building.id)"
              >
                <span class="tree-icon">◆</span>
                <span class="tree-text">
                  <span :class="['badge', getRarityBadgeClass(building.rarity)]">{{ building.rarity }}</span>
                  {{ building.name }}
                </span>
              </div>
              <div class="tree-item child add-item" @click="addBuilding">
                <span class="tree-icon">+</span>
                <span class="tree-text">新建建筑物卡</span>
              </div>
            </div>
          </div>

          <!-- Local Effects Section -->
          <div class="tree-section">
            <div class="tree-section-header">
              <span class="tree-icon">◆</span>
              <span class="tree-text">特定效果</span>
            </div>
            <div class="tree-children">
              <div 
                v-for="(effect, id) in setData.effects" 
                :key="id"
                class="tree-item child"
                :class="{ active: activeTab === 'effects' && selectedItem.id === id }"
                @click="selectItem('effects', id)"
              >
                <span class="tree-icon">◆</span>
                <span class="tree-text">{{ effect.name }}</span>
              </div>
              <div class="tree-item child add-item" @click="addEffect">
                <span class="tree-icon">+</span>
                <span class="tree-text">新建特定效果</span>
              </div>
            </div>
          </div>

          <!-- Local Fixed Terms Section -->
          <div class="tree-section">
            <div class="tree-section-header">
              <span class="tree-icon">◆</span>
              <span class="tree-text">特定固词</span>
            </div>
            <div class="tree-children">
              <div 
                v-for="(term, id) in setData.fixed_terms" 
                :key="id"
                class="tree-item child"
                :class="{ active: activeTab === 'fixed-terms' && selectedItem.id === id }"
                @click="selectItem('fixed-terms', id)"
              >
                <span class="tree-icon">◆</span>
                <span class="tree-text">{{ term.name }}</span>
              </div>
              <div class="tree-item child add-item" @click="addFixedTerm">
                <span class="tree-icon">+</span>
                <span class="tree-text">新建特定固词</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Center Panel: Core Editing Area -->
      <div class="center-panel">
        <!-- Basic Information Tab -->
        <div v-if="activeTab === 'basic'" class="edit-section">
          <h2>基本信息</h2>
          <div class="form-group">
            <label>套组代码:</label>
            <input type="text" v-model="setData.set_code" readonly>
          </div>
          <div class="form-group">
            <label>套组名称:</label>
            <input 
              type="text" 
              v-model="setData.name" 
              placeholder="输入套组名称"
              :class="{ modified: isFieldModified('name', 'name') }"
            >
          </div>
          <div class="form-group">
            <label>描述:</label>
            <textarea 
              v-model="setData.description" 
              rows="3" 
              placeholder="输入描述"
              :class="{ modified: isFieldModified('description', 'description') }"
            ></textarea>
          </div>
          <div class="form-group">
            <label>备注:</label>
            <textarea 
              v-model="setData.notes" 
              rows="3" 
              placeholder="输入备注"
              :class="{ modified: isFieldModified('notes', 'notes') }"
            ></textarea>
          </div>
          
          <h3>设计信息</h3>
          <div class="form-group">
            <label>原型 (多个用逗号分隔):</label>
            <input 
              type="text" 
              v-model="archetypesStr" 
              placeholder="例如: 原型1, 原型2"
              :class="{ modified: isFieldModified('archetypes', 'archetypes') }"
            >
          </div>
          <div class="form-group">
            <label>设计师 (多个用逗号分隔):</label>
            <input 
              type="text" 
              v-model="designersStr" 
              placeholder="例如: 设计师1, 设计师2"
              :class="{ modified: isFieldModified('designers', 'designers') }"
            >
          </div>
        </div>

        <!-- Effects Tab -->
        <div v-if="activeTab === 'effects'" class="edit-section">
          <h2>局部效果库</h2>
          <div class="items-list">
            <p v-if="Object.keys(setData.effects || {}).length === 0" class="empty-hint">暂无局部效果</p>
            <div v-for="(effect, id) in setData.effects" :key="id" class="card-item">
              <div class="card-header">
                <h4>
                  <span :class="['alignment-badge', `alignment-${effect.alignment}`]">
                    {{ alignmentTranslation[effect.alignment] || effect.alignment }}
                  </span>
                  {{ effect.name }} <span class="id-badge">({{ id }})</span>
                </h4>
                <div class="card-actions">
                  <button class="edit-btn" @click="editEffect(id, effect)">✏️ 编辑</button>
                  <button class="delete-btn" @click="deleteEffect(id)">🗑️ 删除</button>
                </div>
              </div>
              <div class="card-content">
                <p v-if="effect.note"><strong>备注:</strong> {{ effect.note }}</p>
              </div>
            </div>
          </div>
          <button class="add-btn" @click="addEffect">➕ 添加效果</button>
        </div>

        <!-- Fixed Terms Tab -->
        <div v-if="activeTab === 'fixed-terms'" class="edit-section">
          <h2>局部固词库</h2>
          <div class="items-list">
            <p v-if="Object.keys(setData.fixed_terms || {}).length === 0" class="empty-hint">暂无局部固词</p>
            <div v-for="(term, id) in setData.fixed_terms" :key="id" class="card-item">
              <div class="card-header">
                <h4>{{ term.name }} <span class="id-badge">({{ id }})</span></h4>
                <div class="card-actions">
                  <button class="edit-btn" @click="editFixedTerm(id, term)">✏️ 编辑</button>
                  <button class="delete-btn" @click="deleteFixedTerm(id)">🗑️ 删除</button>
                </div>
              </div>
              <div class="card-content">
                <p v-if="term.note"><strong>备注:</strong> {{ term.note }}</p>
              </div>
            </div>
          </div>
          <button class="add-btn" @click="addFixedTerm">➕ 添加固词</button>
        </div>

        <!-- Forms Tab -->
        <div v-if="activeTab === 'forms' && selectedItem.id" class="edit-section">
          <template v-for="form in setData.forms" :key="form.id">
            <template v-if="form.id === selectedItem.id">
              <h2>{{ form.name }}</h2>
              
              <!-- Shared basic info (ID and Name shown only once) -->
              <h3>基础信息 (所有阶段共享)</h3>
              <div class="form-group">
                <label>形态ID:</label>
                <input type="text" :value="form.id" readonly>
              </div>
              <div class="form-group">
                <label>形态名称:</label>
                <input 
                  type="text" 
                  v-model="form.name" 
                  placeholder="输入形态名称"
                  :class="{ modified: isFormFieldModified(form.id, 'name') }"
                >
              </div>
              <div class="form-group">
                <label>稀有度:</label>
                <select 
                  v-model="form.rarity"
                  :class="{ modified: isFormFieldModified(form.id, 'rarity') }"
                >
                  <option value="N">N</option>
                  <option value="R">R</option>
                  <option value="SR">SR</option>
                  <option value="SSR">SSR</option>
                </select>
              </div>
              
              <!-- Display all stages (II and III) on the same page -->
              <template v-for="stage in form.stages" :key="`${form.id}-${stage.stage}`">
                <div class="stage-section">
                  <h3>【{{ toRoman(stage.stage) }}】阶属性</h3>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label>消耗:</label>
                      <input 
                        type="number" 
                        v-model.number="stage.cost" 
                        min="0"
                        :class="{ modified: isStageFieldModified(form.id, stage.stage, 'cost') }"
                      >
                    </div>
                    <div class="form-group">
                      <label>移动:</label>
                      <input 
                        type="number" 
                        v-model.number="stage.move" 
                        min="0"
                        :class="{ modified: isStageFieldModified(form.id, stage.stage, 'move') }"
                      >
                    </div>
                    <div class="form-group">
                      <label>攻击:</label>
                      <input 
                        type="number" 
                        v-model.number="stage.atk" 
                        min="0"
                        :class="{ modified: isStageFieldModified(form.id, stage.stage, 'atk') }"
                      >
                    </div>
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label>初始HP:</label>
                      <input 
                        type="number" 
                        v-model.number="stage.hp_init" 
                        min="1"
                        :class="{ modified: isStageFieldModified(form.id, stage.stage, 'hp_init') }"
                      >
                    </div>
                    <div class="form-group">
                      <label>HP上限:</label>
                      <input 
                        type="number" 
                        v-model.number="stage.hp_limit" 
                        min="1"
                        :class="{ modified: isStageFieldModified(form.id, stage.stage, 'hp_limit') }"
                      >
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>图片URL:</label>
                    <input 
                      type="text" 
                      v-model="stage.image" 
                      placeholder="图片地址"
                      :class="{ modified: isStageFieldModified(form.id, stage.stage, 'image') }"
                    >
                  </div>
                  <div class="form-group">
                    <label>图标URL:</label>
                    <input 
                      type="text" 
                      v-model="stage.icon" 
                      placeholder="图标地址"
                      :class="{ modified: isStageFieldModified(form.id, stage.stage, 'icon') }"
                    >
                  </div>
                  <div class="form-group">
                    <label>爆裂值:</label>
                    <input 
                      type="text" 
                      v-model="stage.brast" 
                      placeholder="爆裂值"
                      :class="{ modified: isStageFieldModified(form.id, stage.stage, 'brast') }"
                    >
                  </div>
                  
                  <div class="form-group">
                    <label>描述文本:</label>
                    <textarea 
                      v-model="stage.text" 
                      rows="4" 
                      placeholder="输入卡牌描述"
                      :class="{ modified: isStageFieldModified(form.id, stage.stage, 'text') }"
                    ></textarea>
                  </div>
                  
                  <div class="form-group">
                    <label>绑定效果 (多个用逗号分隔):</label>
                    <div class="input-with-button">
                      <input 
                        type="text" 
                        :value="(stage.bound_effects || []).join(', ')"
                        @input="stage.bound_effects = $event.target.value.split(',').map(s => s.trim()).filter(Boolean)"
                        placeholder="例如: effect1, effect2"
                        :class="{ modified: isStageFieldModified(form.id, stage.stage, 'bound_effects') }"
                      >
                      <button class="refresh-btn" @click="refreshBoundItemsValidation" title="刷新验证">🔄</button>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>绑定固词 (多个用逗号分隔):</label>
                    <div class="input-with-button">
                      <input 
                        type="text" 
                        :value="(stage.bound_fixed_terms || []).join(', ')"
                        @input="stage.bound_fixed_terms = $event.target.value.split(',').map(s => s.trim()).filter(Boolean)"
                        placeholder="例如: term1, term2"
                        :class="{ modified: isStageFieldModified(form.id, stage.stage, 'bound_fixed_terms') }"
                      >
                      <button class="refresh-btn" @click="refreshBoundItemsValidation" title="刷新验证">🔄</button>
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </template>
        </div>

        <!-- Summons Tab -->
        <div v-if="activeTab === 'summons'" class="edit-section">
          <h2>召唤物</h2>
          <div class="items-list">
            <p v-if="!setData.summons || setData.summons.length === 0" class="empty-hint">暂无召唤物</p>
            <div v-for="(summon, index) in setData.summons" :key="index" class="card-item-display">
              <div class="card-header">
                <h4>
                  <span :class="['badge', getRarityBadgeClass(summon.rarity)]">{{ summon.rarity }}</span>
                  {{ summon.name }} <span class="id-badge">({{ summon.id }})</span>
                </h4>
                <button class="edit-btn" @click="openEditSummonModal(index)">✏️ 编辑</button>
              </div>
              <div class="card-info">
                <div class="info-row">
                  <span class="info-label">费用:</span>
                  <span class="info-value">{{ summon.cost }}</span>
                  <span class="info-label">移动:</span>
                  <span class="info-value">{{ summon.move }}</span>
                  <span class="info-label">攻击:</span>
                  <span class="info-value">{{ summon.atk }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">初始HP:</span>
                  <span class="info-value">{{ summon.hp_init }}</span>
                  <span class="info-label">最大HP:</span>
                  <span class="info-value">{{ summon.hp_limit }}</span>
                </div>
                <div v-if="summon.text" class="info-row full">
                  <span class="info-label">描述:</span>
                  <span class="info-value">{{ summon.text }}</span>
                </div>
              </div>
            </div>
          </div>
          <button class="add-btn" @click="addSummon">➕ 添加召唤物</button>
        </div>

        <!-- Buildings Tab -->
        <div v-if="activeTab === 'buildings'" class="edit-section">
          <h2>建筑</h2>
          <div class="items-list">
            <p v-if="!setData.buildings || setData.buildings.length === 0" class="empty-hint">暂无建筑</p>
            <div v-for="(building, index) in setData.buildings" :key="index" class="card-item-display">
              <div class="card-header">
                <h4>
                  <span :class="['badge', getRarityBadgeClass(building.rarity)]">{{ building.rarity }}</span>
                  {{ building.name }} <span class="id-badge">({{ building.id }})</span>
                </h4>
                <button class="edit-btn" @click="openEditBuildingModal(index)">✏️ 编辑</button>
              </div>
              <div class="card-info">
                <div class="info-row">
                  <span class="info-label">费用:</span>
                  <span class="info-value">{{ building.cost }}</span>
                  <span class="info-label">初始HP:</span>
                  <span class="info-value">{{ building.hp_init }}</span>
                  <span class="info-label">最大HP:</span>
                  <span class="info-value">{{ building.hp_limit }}</span>
                </div>
                <div v-if="building.text" class="info-row full">
                  <span class="info-label">描述:</span>
                  <span class="info-value">{{ building.text }}</span>
                </div>
              </div>
            </div>
          </div>
          <button class="add-btn" @click="addBuilding">➕ 添加建筑</button>
        </div>

        <!-- Attacks Tab -->
        <div v-if="activeTab === 'attacks'" class="edit-section">
          <h2>攻击</h2>
          <div class="items-list">
            <p v-if="!setData.attacks || setData.attacks.length === 0" class="empty-hint">暂无攻击</p>
            <div v-for="(attack, index) in setData.attacks" :key="index" class="card-item-display">
              <div class="card-header">
                <h4>
                  <span :class="['badge', getRarityBadgeClass(attack.rarity)]">{{ attack.rarity }}</span>
                  {{ attack.name }} <span class="id-badge">({{ attack.id }})</span>
                </h4>
                <button class="edit-btn" @click="openEditAttackModal(index)">✏️ 编辑</button>
              </div>
              <div class="card-info">
                <div class="info-row">
                  <span class="info-label">费用:</span>
                  <span class="info-value">{{ attack.cost }}</span>
                </div>
                <div v-if="attack.text" class="info-row full">
                  <span class="info-label">描述:</span>
                  <span class="info-value">{{ attack.text }}</span>
                </div>
              </div>
            </div>
          </div>
          <button class="add-btn" @click="addAttack">➕ 添加攻击</button>
        </div>

        <!-- Strategies Tab -->
        <div v-if="activeTab === 'strategies'" class="edit-section">
          <h2>策略</h2>
          <div class="items-list">
            <p v-if="!setData.strategies || setData.strategies.length === 0" class="empty-hint">暂无策略</p>
            <div v-for="(strategy, index) in setData.strategies" :key="index" class="card-item-display">
              <div class="card-header">
                <h4>
                  <span :class="['badge', getRarityBadgeClass(strategy.rarity)]">{{ strategy.rarity }}</span>
                  {{ strategy.name }} <span class="id-badge">({{ strategy.id }})</span>
                </h4>
                <button class="edit-btn" @click="openEditStrategyModal(index)">✏️ 编辑</button>
              </div>
              <div class="card-info">
                <div class="info-row">
                  <span class="info-label">费用:</span>
                  <span class="info-value">{{ strategy.cost }}</span>
                </div>
                <div v-if="strategy.text" class="info-row full">
                  <span class="info-label">描述:</span>
                  <span class="info-value">{{ strategy.text }}</span>
                </div>
              </div>
            </div>
          </div>
          <button class="add-btn" @click="addStrategy">➕ 添加策略</button>
        </div>
      </div>

      <!-- Right Panel: Preview & Effects Display -->
      <div class="right-panel">
        <div class="preview-section">
          <h3>预览区域</h3>
          <div class="preview-placeholder">
            <p>🎴 卡片可视化预览</p>
            <p class="hint">（预览功能待实现）</p>
          </div>
          <div class="preview-actions">
            <button class="btn-icon" title="缩放">🔍</button>
            <button class="btn-icon" title="下载">💾</button>
          </div>
        </div>
        
        <div class="effects-display-section">
          <h3>绑定效果/固词验证</h3>
          <div class="effects-list">
            <div v-if="boundItemsValidation.effects.length === 0 && boundItemsValidation.terms.length === 0" class="hint">
              点击"🔄"按钮验证绑定的效果和固词
            </div>
            
            <!-- Display bound effects -->
            <div v-if="boundItemsValidation.effects.length > 0">
              <h4>绑定效果:</h4>
              <div v-for="item in boundItemsValidation.effects" :key="item.id" class="validation-item" :class="{ 'not-found': !item.exists }">
                <div class="validation-header">
                  <span class="validation-icon">{{ item.exists ? '✅' : '❌' }}</span>
                  <strong>{{ item.id }}</strong>
                  <span v-if="item.isGlobal" class="global-badge">全局</span>
                  <span v-else-if="item.exists" class="local-badge">局部</span>
                </div>
                <div v-if="item.exists" class="validation-body">
                  <p><strong>名称:</strong> {{ item.name }}</p>
                  <p v-if="item.note"><strong>备注:</strong> {{ item.note }}</p>
                </div>
                <div v-else class="validation-error">
                  ⚠️ 效果不存在！请检查ID是否正确。
                </div>
              </div>
            </div>
            
            <!-- Display bound terms -->
            <div v-if="boundItemsValidation.terms.length > 0" style="margin-top: 15px;">
              <h4>绑定固词:</h4>
              <div v-for="item in boundItemsValidation.terms" :key="item.id" class="validation-item" :class="{ 'not-found': !item.exists }">
                <div class="validation-header">
                  <span class="validation-icon">{{ item.exists ? '✅' : '❌' }}</span>
                  <strong>{{ item.id }}</strong>
                  <span v-if="item.isGlobal" class="global-badge">全局</span>
                  <span v-else-if="item.exists" class="local-badge">局部</span>
                </div>
                <div v-if="item.exists" class="validation-body">
                  <p><strong>名称:</strong> {{ item.name }}</p>
                  <p v-if="item.note"><strong>备注:</strong> {{ item.note }}</p>
                </div>
                <div v-else class="validation-error">
                  ⚠️ 固词不存在！请检查ID是否正确。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Effect Edit/Add Modal -->
    <ModalDialog 
      v-model="showEffectModal" 
      :title="isEditingEffect ? '✏️ 编辑局部效果' : '➕ 添加局部效果'"
      size="medium"
      :show-footer="true"
      :show-confirm="true"
      :show-cancel="true"
      @confirm="handleSaveEffect"
    >
      <div class="form-group">
        <label>效果ID <span class="required">*</span></label>
        <input 
          v-model="editingEffect.id" 
          type="text" 
          placeholder="小写字母、数字、下划线"
          :disabled="isEditingEffect"
          @keyup.enter="handleSaveEffect"
        >
        <small v-if="!isEditingEffect" class="form-hint">ID创建后不可修改</small>
      </div>
      <div class="form-group">
        <label>名称 <span class="required">*</span></label>
        <input 
          v-model="editingEffect.name" 
          type="text" 
          placeholder="效果名称"
          @keyup.enter="handleSaveEffect"
        >
      </div>
      <div class="form-group">
        <label>性质</label>
        <select v-model="editingEffect.alignment">
          <option value="positive">正面 (positive)</option>
          <option value="neutral">中性 (neutral)</option>
          <option value="negative">负面 (negative)</option>
        </select>
      </div>
      <div class="form-group">
        <label>备注</label>
        <textarea 
          v-model="editingEffect.note" 
          rows="3" 
          placeholder="效果备注（可选）"
        ></textarea>
      </div>
      <template #footer>
        <button v-if="isEditingEffect" class="btn btn-danger" @click="handleDeleteEffect">🗑️ 删除</button>
        <div style="flex: 1"></div>
        <button class="btn btn-secondary" @click="showEffectModal = false">取消</button>
        <button class="btn btn-primary" @click="handleSaveEffect">确定</button>
      </template>
    </ModalDialog>

    <!-- Fixed Term Edit/Add Modal -->
    <ModalDialog 
      v-model="showTermModal" 
      :title="isEditingTerm ? '✏️ 编辑局部固词' : '➕ 添加局部固词'"
      size="medium"
      :show-footer="true"
      :show-confirm="true"
      :show-cancel="true"
      @confirm="handleSaveTerm"
    >
      <div class="form-group">
        <label>固词ID <span class="required">*</span></label>
        <input 
          v-model="editingTerm.id" 
          type="text" 
          placeholder="小写字母、数字、下划线"
          :disabled="isEditingTerm"
          @keyup.enter="handleSaveTerm"
        >
        <small v-if="!isEditingTerm" class="form-hint">ID创建后不可修改</small>
      </div>
      <div class="form-group">
        <label>名称 <span class="required">*</span></label>
        <input 
          v-model="editingTerm.name" 
          type="text" 
          placeholder="固词名称"
          @keyup.enter="handleSaveTerm"
        >
      </div>
      <div class="form-group">
        <label>备注</label>
        <textarea 
          v-model="editingTerm.note" 
          rows="3" 
          placeholder="固词备注（可选）"
        ></textarea>
      </div>
      <template #footer>
        <button v-if="isEditingTerm" class="btn btn-danger" @click="handleDeleteTerm">🗑️ 删除</button>
        <div style="flex: 1"></div>
        <button class="btn btn-secondary" @click="showTermModal = false">取消</button>
        <button class="btn btn-primary" @click="handleSaveTerm">确定</button>
      </template>
    </ModalDialog>

    <!-- Attack Edit/Add Modal -->
    <ModalDialog 
      v-model="showAttackModal" 
      :title="isEditingAttack ? '✏️ 编辑攻击卡' : '➕ 添加攻击卡'"
      size="medium"
      :show-footer="true"
      :show-confirm="true"
      :show-cancel="true"
      @confirm="handleSaveAttack"
    >
      <div class="form-group">
        <label>卡牌ID <span class="required">*</span></label>
        <input 
          v-model="editingAttack.id" 
          type="text" 
          placeholder="小写字母、数字、下划线"
          :disabled="isEditingAttack"
          @keyup.enter="handleSaveAttack"
        >
        <small v-if="!isEditingAttack" class="form-hint">ID创建后不可修改</small>
      </div>
      <div class="form-group">
        <label>名称 <span class="required">*</span></label>
        <input 
          v-model="editingAttack.name" 
          type="text" 
          placeholder="卡牌名称"
          @keyup.enter="handleSaveAttack"
        >
      </div>
      <div class="form-group">
        <label>费用</label>
        <input 
          v-model.number="editingAttack.cost" 
          type="number" 
          min="0"
          placeholder="费用"
        >
      </div>
      <div class="form-group">
        <label>稀有度</label>
        <select v-model="editingAttack.rarity">
          <option value="N">N (灰色)</option>
          <option value="R">R (蓝色)</option>
          <option value="SR">SR (紫色)</option>
          <option value="SSR">SSR (金色)</option>
        </select>
      </div>
      <div class="form-group">
        <label>描述</label>
        <textarea 
          v-model="editingAttack.text" 
          rows="3" 
          placeholder="卡牌描述"
        ></textarea>
      </div>
      <template #footer>
        <button v-if="isEditingAttack" class="btn btn-danger" @click="handleDeleteAttack">🗑️ 删除</button>
        <div style="flex: 1"></div>
        <button class="btn btn-secondary" @click="showAttackModal = false">取消</button>
        <button class="btn btn-primary" @click="handleSaveAttack">确定</button>
      </template>
    </ModalDialog>

    <!-- Strategy Edit/Add Modal -->
    <ModalDialog 
      v-model="showStrategyModal" 
      :title="isEditingStrategy ? '✏️ 编辑策略卡' : '➕ 添加策略卡'"
      size="medium"
      :show-footer="true"
      :show-confirm="true"
      :show-cancel="true"
      @confirm="handleSaveStrategy"
    >
      <div class="form-group">
        <label>卡牌ID <span class="required">*</span></label>
        <input 
          v-model="editingStrategy.id" 
          type="text" 
          placeholder="小写字母、数字、下划线"
          :disabled="isEditingStrategy"
          @keyup.enter="handleSaveStrategy"
        >
        <small v-if="!isEditingStrategy" class="form-hint">ID创建后不可修改</small>
      </div>
      <div class="form-group">
        <label>名称 <span class="required">*</span></label>
        <input 
          v-model="editingStrategy.name" 
          type="text" 
          placeholder="卡牌名称"
          @keyup.enter="handleSaveStrategy"
        >
      </div>
      <div class="form-group">
        <label>费用</label>
        <input 
          v-model.number="editingStrategy.cost" 
          type="number" 
          min="0"
          placeholder="费用"
        >
      </div>
      <div class="form-group">
        <label>稀有度</label>
        <select v-model="editingStrategy.rarity">
          <option value="N">N (灰色)</option>
          <option value="R">R (蓝色)</option>
          <option value="SR">SR (紫色)</option>
          <option value="SSR">SSR (金色)</option>
        </select>
      </div>
      <div class="form-group">
        <label>描述</label>
        <textarea 
          v-model="editingStrategy.text" 
          rows="3" 
          placeholder="卡牌描述"
        ></textarea>
      </div>
      <template #footer>
        <button v-if="isEditingStrategy" class="btn btn-danger" @click="handleDeleteStrategy">🗑️ 删除</button>
        <div style="flex: 1"></div>
        <button class="btn btn-secondary" @click="showStrategyModal = false">取消</button>
        <button class="btn btn-primary" @click="handleSaveStrategy">确定</button>
      </template>
    </ModalDialog>

    <!-- Summon Edit/Add Modal -->
    <ModalDialog 
      v-model="showSummonModal" 
      :title="isEditingSummon ? '✏️ 编辑召唤物卡' : '➕ 添加召唤物卡'"
      size="medium"
      :show-footer="true"
      :show-confirm="true"
      :show-cancel="true"
      @confirm="handleSaveSummon"
    >
      <div class="form-group">
        <label>卡牌ID <span class="required">*</span></label>
        <input 
          v-model="editingSummon.id" 
          type="text" 
          placeholder="小写字母、数字、下划线"
          :disabled="isEditingSummon"
          @keyup.enter="handleSaveSummon"
        >
        <small v-if="!isEditingSummon" class="form-hint">ID创建后不可修改</small>
      </div>
      <div class="form-group">
        <label>名称 <span class="required">*</span></label>
        <input 
          v-model="editingSummon.name" 
          type="text" 
          placeholder="卡牌名称"
          @keyup.enter="handleSaveSummon"
        >
      </div>
      <div class="form-group">
        <label>费用</label>
        <input 
          v-model.number="editingSummon.cost" 
          type="number" 
          min="0"
          placeholder="费用"
        >
      </div>
      <div class="form-group">
        <label>移动</label>
        <input 
          v-model.number="editingSummon.move" 
          type="number" 
          min="0"
          placeholder="移动"
        >
      </div>
      <div class="form-group">
        <label>攻击</label>
        <input 
          v-model.number="editingSummon.atk" 
          type="number" 
          min="0"
          placeholder="攻击"
        >
      </div>
      <div class="form-group">
        <label>初始HP</label>
        <input 
          v-model.number="editingSummon.hp_init" 
          type="number" 
          min="1"
          placeholder="初始HP"
        >
      </div>
      <div class="form-group">
        <label>最大HP</label>
        <input 
          v-model.number="editingSummon.hp_limit" 
          type="number" 
          min="1"
          placeholder="最大HP"
        >
      </div>
      <div class="form-group">
        <label>稀有度</label>
        <select v-model="editingSummon.rarity">
          <option value="N">N (灰色)</option>
          <option value="R">R (蓝色)</option>
          <option value="SR">SR (紫色)</option>
          <option value="SSR">SSR (金色)</option>
        </select>
      </div>
      <div class="form-group">
        <label>描述</label>
        <textarea 
          v-model="editingSummon.text" 
          rows="3" 
          placeholder="卡牌描述"
        ></textarea>
      </div>
      <template #footer>
        <button v-if="isEditingSummon" class="btn btn-danger" @click="handleDeleteSummon">🗑️ 删除</button>
        <div style="flex: 1"></div>
        <button class="btn btn-secondary" @click="showSummonModal = false">取消</button>
        <button class="btn btn-primary" @click="handleSaveSummon">确定</button>
      </template>
    </ModalDialog>

    <!-- Building Edit/Add Modal -->
    <ModalDialog 
      v-model="showBuildingModal" 
      :title="isEditingBuilding ? '✏️ 编辑建筑物卡' : '➕ 添加建筑物卡'"
      size="medium"
      :show-footer="true"
      :show-confirm="true"
      :show-cancel="true"
      @confirm="handleSaveBuilding"
    >
      <div class="form-group">
        <label>卡牌ID <span class="required">*</span></label>
        <input 
          v-model="editingBuilding.id" 
          type="text" 
          placeholder="小写字母、数字、下划线"
          :disabled="isEditingBuilding"
          @keyup.enter="handleSaveBuilding"
        >
        <small v-if="!isEditingBuilding" class="form-hint">ID创建后不可修改</small>
      </div>
      <div class="form-group">
        <label>名称 <span class="required">*</span></label>
        <input 
          v-model="editingBuilding.name" 
          type="text" 
          placeholder="卡牌名称"
          @keyup.enter="handleSaveBuilding"
        >
      </div>
      <div class="form-group">
        <label>费用</label>
        <input 
          v-model.number="editingBuilding.cost" 
          type="number" 
          min="0"
          placeholder="费用"
        >
      </div>
      <div class="form-group">
        <label>初始HP</label>
        <input 
          v-model.number="editingBuilding.hp_init" 
          type="number" 
          min="1"
          placeholder="初始HP"
        >
      </div>
      <div class="form-group">
        <label>最大HP</label>
        <input 
          v-model.number="editingBuilding.hp_limit" 
          type="number" 
          min="1"
          placeholder="最大HP"
        >
      </div>
      <div class="form-group">
        <label>稀有度</label>
        <select v-model="editingBuilding.rarity">
          <option value="N">N (灰色)</option>
          <option value="R">R (蓝色)</option>
          <option value="SR">SR (紫色)</option>
          <option value="SSR">SSR (金色)</option>
        </select>
      </div>
      <div class="form-group">
        <label>描述</label>
        <textarea 
          v-model="editingBuilding.text" 
          rows="3" 
          placeholder="卡牌描述"
        ></textarea>
      </div>
      <template #footer>
        <button v-if="isEditingBuilding" class="btn btn-danger" @click="handleDeleteBuilding">🗑️ 删除</button>
        <div style="flex: 1"></div>
        <button class="btn btn-secondary" @click="showBuildingModal = false">取消</button>
        <button class="btn btn-primary" @click="handleSaveBuilding">确定</button>
      </template>
    </ModalDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { setAPI, globalAPI } from '@/utils/api'
import { validateId, ALIGNMENT_OPTIONS, ALIGNMENT_TRANSLATION, generateRandomId } from '@/utils/validation'
import { useNotification } from '@/utils/notification'
import ModalDialog from '@/components/ModalDialog.vue'

const props = defineProps({
  setCode: {
    type: String,
    required: true
  }
})

const router = useRouter()
const notification = useNotification()
const loading = ref(true)
const error = ref(null)
const setData = ref(null)
const originalData = ref(null) // Store original data for change detection
const activeTab = ref('basic')
const selectedItem = ref({ type: 'basic', id: null, stage: null }) // Track selected item in tree
const hasUnsavedChanges = ref(false)
const boundItemsValidation = ref({ effects: [], terms: [] }) // Store validation results for bound items
const globalEffects = ref({}) // Global effects library
const globalFixedTerms = ref({}) // Global fixed terms library

// Modal state for local effects
const showEffectModal = ref(false)
const isEditingEffect = ref(false)
const editingEffect = ref({ id: '', name: '', alignment: 'neutral', note: '' })
const originalEffectId = ref('')

// Modal state for local fixed terms
const showTermModal = ref(false)
const isEditingTerm = ref(false)
const editingTerm = ref({ id: '', name: '', note: '' })
const originalTermId = ref('')

// Modal state for attack cards
const showAttackModal = ref(false)
const isEditingAttack = ref(false)
const editingAttack = ref({ id: '', name: '', cost: 0, rarity: 'R', image: '', icon: '', brast: '', text: '', bound_effects: [], bound_fixed_terms: [] })
const editingAttackIndex = ref(-1)

// Modal state for strategy cards
const showStrategyModal = ref(false)
const isEditingStrategy = ref(false)
const editingStrategy = ref({ id: '', name: '', cost: 0, rarity: 'R', image: '', icon: '', brast: '', text: '', bound_effects: [], bound_fixed_terms: [] })
const editingStrategyIndex = ref(-1)

// Modal state for summon cards
const showSummonModal = ref(false)
const isEditingSummon = ref(false)
const editingSummon = ref({ id: '', name: '', cost: 0, move: 0, atk: 0, hp_init: 1, hp_limit: 1, rarity: 'R', image: '', icon: '', brast: '', text: '', bound_effects: [], bound_fixed_terms: [] })
const editingSummonIndex = ref(-1)

// Modal state for building cards
const showBuildingModal = ref(false)
const isEditingBuilding = ref(false)
const editingBuilding = ref({ id: '', name: '', cost: 0, hp_init: 1, hp_limit: 1, rarity: 'R', image: '', icon: '', brast: '', text: '', bound_effects: [], bound_fixed_terms: [] })
const editingBuildingIndex = ref(-1)

const alignmentTranslation = ALIGNMENT_TRANSLATION

const pageTitle = computed(() => {
  return `套组编辑器 - ${setData.value?.name || props.setCode}`
})

// Computed properties for array to string conversion
const archetypesStr = computed({
  get: () => (setData.value?.archetypes || []).join(', '),
  set: (val) => {
    if (setData.value) {
      setData.value.archetypes = val.split(',').map(s => s.trim()).filter(Boolean)
    }
  }
})

const designersStr = computed({
  get: () => (setData.value?.designers || []).join(', '),
  set: (val) => {
    if (setData.value) {
      setData.value.designers = val.split(',').map(s => s.trim()).filter(Boolean)
    }
  }
})

async function loadSet() {
  try {
    const data = await setAPI.get(props.setCode)
    setData.value = data
    // Deep copy original data for change detection
    originalData.value = JSON.parse(JSON.stringify(data))
    hasUnsavedChanges.value = false
    loading.value = false
  } catch (err) {
    console.error('Error loading set:', err)
    error.value = '加载套组失败'
    loading.value = false
  }
}

async function loadGlobalLibraries() {
  try {
    const [effectsData, termsData] = await Promise.all([
      globalAPI.getEffects(),
      globalAPI.getFixedTerms()
    ])
    globalEffects.value = effectsData.effects || {}
    globalFixedTerms.value = termsData.fixed_terms || {}
  } catch (err) {
    console.error('Error loading global libraries:', err)
  }
}

// Validate bound effects and terms for current stage
function validateBoundItems(boundEffects, boundTerms) {
  const results = { effects: [], terms: [] }
  
  // Validate effects
  if (boundEffects && boundEffects.length > 0) {
    boundEffects.forEach(effectId => {
      const exists = globalEffects.value[effectId] || setData.value?.effects?.[effectId]
      results.effects.push({
        id: effectId,
        exists,
        name: exists ? (globalEffects.value[effectId]?.name || setData.value?.effects?.[effectId]?.name) : null,
        isGlobal: !!globalEffects.value[effectId],
        note: exists ? (globalEffects.value[effectId]?.note || setData.value?.effects?.[effectId]?.note) : null
      })
    })
  }
  
  // Validate terms
  if (boundTerms && boundTerms.length > 0) {
    boundTerms.forEach(termId => {
      const exists = globalFixedTerms.value[termId] || setData.value?.fixed_terms?.[termId]
      results.terms.push({
        id: termId,
        exists,
        name: exists ? (globalFixedTerms.value[termId]?.name || setData.value?.fixed_terms?.[termId]?.name) : null,
        isGlobal: !!globalFixedTerms.value[termId],
        note: exists ? (globalFixedTerms.value[termId]?.note || setData.value?.fixed_terms?.[termId]?.note) : null
      })
    })
  }
  
  boundItemsValidation.value = results
  return results
}

// Get current stage data for validation
function getCurrentStageBoundItems() {
  if (activeTab.value !== 'forms' || !selectedItem.value.id) {
    return { effects: [], terms: [] }
  }
  
  const form = setData.value?.forms?.find(f => f.id === selectedItem.value.id)
  if (!form) return { effects: [], terms: [] }
  
  // Collect all bound items from all stages
  const allEffects = []
  const allTerms = []
  
  form.stages?.forEach(stage => {
    if (stage.bound_effects) {
      allEffects.push(...stage.bound_effects)
    }
    if (stage.bound_fixed_terms) {
      allTerms.push(...stage.bound_fixed_terms)
    }
  })
  
  return {
    effects: [...new Set(allEffects)], // Remove duplicates
    terms: [...new Set(allTerms)]
  }
}

// Refresh validation for current form
function refreshBoundItemsValidation() {
  const { effects, terms } = getCurrentStageBoundItems()
  validateBoundItems(effects, terms)
}

function goBack() {
  if (hasUnsavedChanges.value) {
    const choice = confirm('当前页面有未保存的更改。是否保存？\n\n点击"确定"保存更改\n点击"取消"放弃更改')
    if (choice) {
      saveSet().then(() => {
        router.push('/')
      })
      return
    } else {
      // User chose to discard changes
      hasUnsavedChanges.value = false
    }
  }
  router.push('/')
}

// Helper function to check if a field is modified
function isFieldModified(currentPath, originalPath) {
  if (!originalData.value) return false
  
  // Get nested property using path string
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => {
      // Handle array indices
      const arrayMatch = part.match(/^(.+)\[(\d+)\]$/)
      if (arrayMatch) {
        return acc?.[arrayMatch[1]]?.[parseInt(arrayMatch[2])]
      }
      return acc?.[part]
    }, obj)
  }
  
  const currentValue = getNestedValue(setData.value, currentPath)
  const originalValue = getNestedValue(originalData.value, originalPath)
  
  return JSON.stringify(currentValue) !== JSON.stringify(originalValue)
}

// Helper to check if a form field is modified
function isFormFieldModified(formId, field) {
  if (!originalData.value || !setData.value) return false
  
  const formIndex = setData.value.forms?.findIndex(f => f.id === formId)
  const originalFormIndex = originalData.value.forms?.findIndex(f => f.id === formId)
  
  if (formIndex === -1 || originalFormIndex === -1) return false
  
  const currentValue = setData.value.forms[formIndex][field]
  const originalValue = originalData.value.forms[originalFormIndex][field]
  
  return JSON.stringify(currentValue) !== JSON.stringify(originalValue)
}

// Helper to check if a stage field is modified
function isStageFieldModified(formId, stageNum, field) {
  if (!originalData.value || !setData.value) return false
  
  const formIndex = setData.value.forms?.findIndex(f => f.id === formId)
  const originalFormIndex = originalData.value.forms?.findIndex(f => f.id === formId)
  
  if (formIndex === -1 || originalFormIndex === -1) return false
  
  const stage = setData.value.forms[formIndex].stages?.find(s => s.stage === stageNum)
  const originalStage = originalData.value.forms[originalFormIndex].stages?.find(s => s.stage === stageNum)
  
  if (!stage || !originalStage) return false
  
  return JSON.stringify(stage[field]) !== JSON.stringify(originalStage[field])
}

// Tree navigation helpers
function selectItem(type, id = null, stage = null) {
  // Check if there are unsaved changes
  if (hasUnsavedChanges.value) {
    const choice = confirm('当前页面有未保存的更改。是否保存？\n\n点击"确定"保存更改\n点击"取消"放弃更改')
    if (choice) {
      saveSet().then(() => {
        activeTab.value = type
        selectedItem.value = { type, id, stage }
      })
      return
    } else {
      // Discard changes - reload original data
      setData.value = JSON.parse(JSON.stringify(originalData.value))
      hasUnsavedChanges.value = false
    }
  }
  
  activeTab.value = type
  selectedItem.value = { type, id, stage }
}

function selectForm(formId) {
  selectItem('forms', formId)
}

function selectFormStage(formId, stage) {
  // Legacy function kept for compatibility
  selectForm(formId)
}

function toRoman(num) {
  const lookup = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' }
  return lookup[num] || num
}

// Helper function to get rarity badge class
function getRarityBadgeClass(rarity) {
  const rarityMap = {
    'SSR': 'rarity-ssr',
    'SR': 'rarity-sr',
    'R': 'rarity-r',
    'N': 'rarity-n'
  }
  return rarityMap[rarity] || 'rarity-r'
}

// Effects management
function addEffect() {
  isEditingEffect.value = false
  editingEffect.value = {
    id: '',
    name: '',
    alignment: 'neutral',
    note: ''
  }
  originalEffectId.value = ''
  showEffectModal.value = true
}

function editEffect(id, effect) {
  isEditingEffect.value = true
  editingEffect.value = {
    id: id,
    name: effect.name,
    alignment: effect.alignment,
    note: effect.note || ''
  }
  originalEffectId.value = id
  showEffectModal.value = true
}

function handleSaveEffect() {
  const { id, name, alignment, note } = editingEffect.value
  
  if (!id || !name) {
    notification.error('请填写必填项：效果ID和名称')
    return
  }
  
  // Validate ID for new effects
  if (!isEditingEffect.value) {
    try {
      validateId(id, '效果ID')
    } catch (err) {
      notification.error(err.message)
      return
    }
    
    if (!setData.value.effects) setData.value.effects = {}
    if (setData.value.effects[id]) {
      notification.error('该效果ID已存在！')
      return
    }
  }
  
  if (!ALIGNMENT_OPTIONS.includes(alignment)) {
    notification.error('性质必须是 positive、neutral 或 negative')
    return
  }
  
  setData.value.effects[id] = {
    name,
    alignment,
    note: note || ''
  }
  
  notification.success(isEditingEffect.value ? '效果已更新！' : '效果已添加！')
  showEffectModal.value = false
}

function deleteEffect(id) {
  if (!confirm('确定要删除此效果吗？此操作无法撤销！')) return
  delete setData.value.effects[id]
  notification.success('效果已删除！')
}

function handleDeleteEffect() {
  const id = originalEffectId.value
  delete setData.value.effects[id]
  notification.success('效果已删除！')
  showEffectModal.value = false
}

// Fixed terms management
function addFixedTerm() {
  isEditingTerm.value = false
  editingTerm.value = {
    id: '',
    name: '',
    note: ''
  }
  originalTermId.value = ''
  showTermModal.value = true
}

function editFixedTerm(id, term) {
  isEditingTerm.value = true
  editingTerm.value = {
    id: id,
    name: term.name,
    note: term.note || ''
  }
  originalTermId.value = id
  showTermModal.value = true
}

function handleSaveTerm() {
  const { id, name, note } = editingTerm.value
  
  if (!id || !name) {
    notification.error('请填写必填项：固词ID和名称')
    return
  }
  
  // Validate ID for new terms
  if (!isEditingTerm.value) {
    try {
      validateId(id, '固词ID')
    } catch (err) {
      notification.error(err.message)
      return
    }
    
    if (!setData.value.fixed_terms) setData.value.fixed_terms = {}
    if (setData.value.fixed_terms[id]) {
      notification.error('该固词ID已存在！')
      return
    }
  }
  
  setData.value.fixed_terms[id] = {
    name,
    note: note || ''
  }
  
  notification.success(isEditingTerm.value ? '固词已更新！' : '固词已添加！')
  showTermModal.value = false
}

function deleteFixedTerm(id) {
  if (!confirm('确定要删除此固词吗？此操作无法撤销！')) return
  delete setData.value.fixed_terms[id]
  notification.success('固词已删除！')
}

function handleDeleteTerm() {
  const id = originalTermId.value
  delete setData.value.fixed_terms[id]
  notification.success('固词已删除！')
  showTermModal.value = false
}

// Forms management
function addForm() {
  // Generate random 8-character ID automatically
  let formId = generateRandomId(8)
  
  // Ensure the ID is unique
  if (!setData.value.forms) setData.value.forms = []
  while (setData.value.forms.some(f => f.id === formId)) {
    formId = generateRandomId(8)
  }
  
  // Use default name "新建卡牌"
  const formName = "新建卡牌"
  
  setData.value.forms.push({
    id: formId,
    name: formName,
    rarity: "R",
    stages: [
      {
        stage: 2,
        cost: 0,
        move: 0,
        atk: 0,
        hp_init: 1,
        hp_limit: 1,
        image: "",
        icon: "",
        brast: "",
        text: "",
        bound_effects: [],
        bound_fixed_terms: []
      },
      {
        stage: 3,
        cost: 0,
        move: 0,
        atk: 0,
        hp_init: 1,
        hp_limit: 1,
        image: "",
        icon: "",
        brast: "",
        text: "",
        bound_effects: [],
        bound_fixed_terms: []
      }
    ]
  })
}

function deleteForm(index) {
  if (!confirm('确定要删除此形态吗？')) return
  setData.value.forms.splice(index, 1)
}

// Simplified add functions for other entities
function addSummon() {
  isEditingSummon.value = false
  editingSummonIndex.value = -1
  editingSummon.value = {
    id: '',
    name: '',
    cost: 0,
    move: 0,
    atk: 0,
    hp_init: 1,
    hp_limit: 1,
    rarity: 'R',
    image: '',
    icon: '',
    brast: '',
    text: '',
    bound_effects: [],
    bound_fixed_terms: []
  }
  showSummonModal.value = true
}

function deleteSummon(index) {
  if (!confirm('确定要删除此召唤物吗？')) return
  setData.value.summons.splice(index, 1)
}

function addBuilding() {
  isEditingBuilding.value = false
  editingBuildingIndex.value = -1
  editingBuilding.value = {
    id: '',
    name: '',
    cost: 0,
    hp_init: 1,
    hp_limit: 1,
    rarity: 'R',
    image: '',
    icon: '',
    brast: '',
    text: '',
    bound_effects: [],
    bound_fixed_terms: []
  }
  showBuildingModal.value = true
}

function deleteBuilding(index) {
  if (!confirm('确定要删除此建筑吗？')) return
  setData.value.buildings.splice(index, 1)
}

function addAttack() {
  isEditingAttack.value = false
  editingAttackIndex.value = -1
  editingAttack.value = {
    id: '',
    name: '',
    cost: 0,
    rarity: 'R',
    image: '',
    icon: '',
    brast: '',
    text: '',
    bound_effects: [],
    bound_fixed_terms: []
  }
  showAttackModal.value = true
}

function deleteAttack(index) {
  if (!confirm('确定要删除此攻击吗？')) return
  setData.value.attacks.splice(index, 1)
}

function addStrategy() {
  isEditingStrategy.value = false
  editingStrategyIndex.value = -1
  editingStrategy.value = {
    id: '',
    name: '',
    cost: 0,
    rarity: 'R',
    image: '',
    icon: '',
    brast: '',
    text: '',
    bound_effects: [],
    bound_fixed_terms: []
  }
  showStrategyModal.value = true
}

function deleteStrategy(index) {
  if (!confirm('确定要删除此策略吗？')) return
  setData.value.strategies.splice(index, 1)
}

// Placeholder edit functions for items - these open the item for editing
// For now, they just navigate to the item, but can be enhanced with modals later
function openEditSummonModal(index) {
  const summon = setData.value.summons[index]
  isEditingSummon.value = true
  editingSummonIndex.value = index
  editingSummon.value = { ...summon, bound_effects: [...(summon.bound_effects || [])], bound_fixed_terms: [...(summon.bound_fixed_terms || [])] }
  showSummonModal.value = true
}

function openEditBuildingModal(index) {
  const building = setData.value.buildings[index]
  isEditingBuilding.value = true
  editingBuildingIndex.value = index
  editingBuilding.value = { ...building, bound_effects: [...(building.bound_effects || [])], bound_fixed_terms: [...(building.bound_fixed_terms || [])] }
  showBuildingModal.value = true
}

function openEditAttackModal(index) {
  const attack = setData.value.attacks[index]
  isEditingAttack.value = true
  editingAttackIndex.value = index
  editingAttack.value = { ...attack, bound_effects: [...(attack.bound_effects || [])], bound_fixed_terms: [...(attack.bound_fixed_terms || [])] }
  showAttackModal.value = true
}

function openEditStrategyModal(index) {
  const strategy = setData.value.strategies[index]
  isEditingStrategy.value = true
  editingStrategyIndex.value = index
  editingStrategy.value = { ...strategy, bound_effects: [...(strategy.bound_effects || [])], bound_fixed_terms: [...(strategy.bound_fixed_terms || [])] }
  showStrategyModal.value = true
}

// Handler functions for saving attacks
function handleSaveAttack() {
  const { id, name, cost, rarity, image, icon, brast, text, bound_effects, bound_fixed_terms } = editingAttack.value
  
  if (!id || !name) {
    notification.error('请填写必填项：卡牌ID和名称')
    return
  }
  
  // Validate ID for new attacks
  if (!isEditingAttack.value) {
    try {
      validateId(id, '攻击ID')
    } catch (err) {
      notification.error(err.message)
      return
    }
    
    if (!setData.value.attacks) setData.value.attacks = []
    if (setData.value.attacks.some(a => a.id === id)) {
      notification.error('该攻击ID已存在！')
      return
    }
    
    // Add new attack
    setData.value.attacks.push({
      id, name, cost: Number(cost), rarity, image, icon, brast, text,
      bound_effects: [...bound_effects],
      bound_fixed_terms: [...bound_fixed_terms]
    })
  } else {
    // Update existing attack
    const index = editingAttackIndex.value
    setData.value.attacks[index] = {
      id, name, cost: Number(cost), rarity, image, icon, brast, text,
      bound_effects: [...bound_effects],
      bound_fixed_terms: [...bound_fixed_terms]
    }
  }
  
  notification.success(isEditingAttack.value ? '攻击已更新！' : '攻击已添加！')
  showAttackModal.value = false
}

function handleDeleteAttack() {
  const index = editingAttackIndex.value
  setData.value.attacks.splice(index, 1)
  notification.success('攻击已删除！')
  showAttackModal.value = false
}

// Handler functions for saving strategies
function handleSaveStrategy() {
  const { id, name, cost, rarity, image, icon, brast, text, bound_effects, bound_fixed_terms } = editingStrategy.value
  
  if (!id || !name) {
    notification.error('请填写必填项：卡牌ID和名称')
    return
  }
  
  // Validate ID for new strategies
  if (!isEditingStrategy.value) {
    try {
      validateId(id, '策略ID')
    } catch (err) {
      notification.error(err.message)
      return
    }
    
    if (!setData.value.strategies) setData.value.strategies = []
    if (setData.value.strategies.some(s => s.id === id)) {
      notification.error('该策略ID已存在！')
      return
    }
    
    // Add new strategy
    setData.value.strategies.push({
      id, name, cost: Number(cost), rarity, image, icon, brast, text,
      bound_effects: [...bound_effects],
      bound_fixed_terms: [...bound_fixed_terms]
    })
  } else {
    // Update existing strategy
    const index = editingStrategyIndex.value
    setData.value.strategies[index] = {
      id, name, cost: Number(cost), rarity, image, icon, brast, text,
      bound_effects: [...bound_effects],
      bound_fixed_terms: [...bound_fixed_terms]
    }
  }
  
  notification.success(isEditingStrategy.value ? '策略已更新！' : '策略已添加！')
  showStrategyModal.value = false
}

function handleDeleteStrategy() {
  const index = editingStrategyIndex.value
  setData.value.strategies.splice(index, 1)
  notification.success('策略已删除！')
  showStrategyModal.value = false
}

// Handler functions for saving summons
function handleSaveSummon() {
  const { id, name, cost, move, atk, hp_init, hp_limit, rarity, image, icon, brast, text, bound_effects, bound_fixed_terms } = editingSummon.value
  
  if (!id || !name) {
    notification.error('请填写必填项：卡牌ID和名称')
    return
  }
  
  // Validate ID for new summons
  if (!isEditingSummon.value) {
    try {
      validateId(id, '召唤物ID')
    } catch (err) {
      notification.error(err.message)
      return
    }
    
    if (!setData.value.summons) setData.value.summons = []
    if (setData.value.summons.some(s => s.id === id)) {
      notification.error('该召唤物ID已存在！')
      return
    }
    
    // Add new summon
    setData.value.summons.push({
      id, name, cost: Number(cost), move: Number(move), atk: Number(atk),
      hp_init: Number(hp_init), hp_limit: Number(hp_limit),
      rarity, image, icon, brast, text,
      bound_effects: [...bound_effects],
      bound_fixed_terms: [...bound_fixed_terms]
    })
  } else {
    // Update existing summon
    const index = editingSummonIndex.value
    setData.value.summons[index] = {
      id, name, cost: Number(cost), move: Number(move), atk: Number(atk),
      hp_init: Number(hp_init), hp_limit: Number(hp_limit),
      rarity, image, icon, brast, text,
      bound_effects: [...bound_effects],
      bound_fixed_terms: [...bound_fixed_terms]
    }
  }
  
  notification.success(isEditingSummon.value ? '召唤物已更新！' : '召唤物已添加！')
  showSummonModal.value = false
}

function handleDeleteSummon() {
  const index = editingSummonIndex.value
  setData.value.summons.splice(index, 1)
  notification.success('召唤物已删除！')
  showSummonModal.value = false
}

// Handler functions for saving buildings
function handleSaveBuilding() {
  const { id, name, cost, hp_init, hp_limit, rarity, image, icon, brast, text, bound_effects, bound_fixed_terms } = editingBuilding.value
  
  if (!id || !name) {
    notification.error('请填写必填项：卡牌ID和名称')
    return
  }
  
  // Validate ID for new buildings
  if (!isEditingBuilding.value) {
    try {
      validateId(id, '建筑物ID')
    } catch (err) {
      notification.error(err.message)
      return
    }
    
    if (!setData.value.buildings) setData.value.buildings = []
    if (setData.value.buildings.some(b => b.id === id)) {
      notification.error('该建筑物ID已存在！')
      return
    }
    
    // Add new building
    setData.value.buildings.push({
      id, name, cost: Number(cost), hp_init: Number(hp_init), hp_limit: Number(hp_limit),
      rarity, image, icon, brast, text,
      bound_effects: [...bound_effects],
      bound_fixed_terms: [...bound_fixed_terms]
    })
  } else {
    // Update existing building
    const index = editingBuildingIndex.value
    setData.value.buildings[index] = {
      id, name, cost: Number(cost), hp_init: Number(hp_init), hp_limit: Number(hp_limit),
      rarity, image, icon, brast, text,
      bound_effects: [...bound_effects],
      bound_fixed_terms: [...bound_fixed_terms]
    }
  }
  
  notification.success(isEditingBuilding.value ? '建筑物已更新！' : '建筑物已添加！')
  showBuildingModal.value = false
}

function handleDeleteBuilding() {
  const index = editingBuildingIndex.value
  setData.value.buildings.splice(index, 1)
  notification.success('建筑物已删除！')
  showBuildingModal.value = false
}

async function saveSet() {
  try {
    await setAPI.save(props.setCode, setData.value)
    // Update original data after successful save
    originalData.value = JSON.parse(JSON.stringify(setData.value))
    hasUnsavedChanges.value = false
    notification.success('保存成功！')
  } catch (err) {
    console.error('Error saving set:', err)
    notification.error('保存失败: ' + err.message)
  }
}

// Watch for changes in setData
watch(
  () => setData.value,
  (newVal) => {
    if (!originalData.value || !newVal) return
    // Compare current data with original to detect changes
    hasUnsavedChanges.value = JSON.stringify(newVal) !== JSON.stringify(originalData.value)
  },
  { deep: true }
)

onMounted(() => {
  loadSet()
  loadGlobalLibraries()
})
</script>

<style scoped>
.editor-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

/* Top Bar */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.back-btn, .save-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.save-btn {
  background: #4caf50;
  color: white;
}

.save-btn:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  flex-grow: 1;
  text-align: center;
}

/* Loading & Error */
.loading-overlay, .error-message {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error-message {
  color: #e74c3c;
}

/* Main Content */
.main-content {
  display: grid;
  grid-template-columns: 250px 1fr 350px;
  gap: 0;
  height: calc(100vh - 70px);
  overflow: hidden;
}

/* Left Panel */
.left-panel {
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

/* Left Panel */
.left-panel {
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  padding: 10px;
}

/* Tree Navigation */
.tree-nav {
  padding: 5px;
}

.tree-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 3px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  color: #333;
}

.tree-item:hover {
  background: #f5f5f5;
}

.tree-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.tree-item.child {
  padding-left: 35px;
  font-size: 12px;
}

.tree-item.add-item {
  color: #667eea;
  font-style: italic;
}

.tree-item.add-item:hover {
  background: #f0f0ff;
}

.tree-icon {
  margin-right: 8px;
  font-size: 14px;
  flex-shrink: 0;
}

.tree-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.stage-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.decision-badge {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(245, 87, 108, 0.3);
}

/* Rarity badge styles */
.rarity-ssr {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #996515;
  box-shadow: 0 2px 4px rgba(255, 215, 0, 0.4);
  font-weight: 700;
}

.rarity-sr {
  background: linear-gradient(135deg, #9b59b6 0%, #c084fc 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(155, 89, 182, 0.4);
  font-weight: 700;
}

.rarity-r {
  background: linear-gradient(135deg, #3498db 0%, #60a5fa 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.4);
  font-weight: 700;
}

.rarity-n {
  background: linear-gradient(135deg, #95a5a6 0%, #bdc3c7 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(149, 165, 166, 0.4);
  font-weight: 700;
}


.tree-section {
  margin-bottom: 5px;
}

.tree-section-header {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  font-weight: 600;
  font-size: 13px;
  color: #555;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 3px;
}

.tree-children {
  margin-left: 0;
}

/* Center Panel */
.center-panel {
  background: white;
  padding: 30px;
  overflow-y: auto;
}

.edit-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.edit-section h3 {
  color: #34495e;
  margin: 30px 0 15px;
  font-size: 18px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input[readonly] {
  background-color: #f0f0f0;
  cursor: not-allowed;
}

/* Highlight modified fields in yellow */
.form-group input.modified,
.form-group textarea.modified,
.form-group select.modified {
  background-color: #fffbea;
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.1);
}

.form-group input.modified:focus,
.form-group textarea.modified:focus,
.form-group select.modified:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

/* Form Row - for horizontal layout */
.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

/* Hint text */
.hint-text {
  font-size: 13px;
  color: #888;
  margin-top: 5px;
  font-style: italic;
}

/* Readonly section */
.readonly-section {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.readonly-section .hint-text {
  margin-bottom: 15px;
  padding: 10px;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
}

.readonly-section input:disabled,
.readonly-section select:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Number and select inputs */
.form-group input[type="number"],
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input[type="number"]:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Stage Section - for displaying multiple stages */
.stage-section {
  background: #f9f9f9;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
}

.stage-section h3 {
  color: #667eea;
  border-bottom: 2px solid #667eea;
  padding-bottom: 8px;
  margin-bottom: 15px;
  font-size: 18px;
}

/* Items List */
.items-list {
  margin-bottom: 20px;
}

.card-item {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  transition: all 0.2s ease;
}

.card-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
}

.id-badge {
  color: #667eea;
  font-weight: normal;
  font-size: 14px;
}

.card-content p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.empty-hint {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-style: italic;
}

.add-btn {
  padding: 12px 24px;
  border: 2px dashed #667eea;
  background: white;
  color: #667eea;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: #667eea;
  color: white;
}

.delete-btn {
  padding: 6px 12px;
  border: none;
  background: #e74c3c;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #c0392b;
}

/* Input with Button */
.input-with-button {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.input-with-button input {
  flex: 1;
}

.refresh-btn {
  padding: 8px 16px;
  border: 1px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.refresh-btn:hover {
  background: #667eea;
  color: white;
  transform: rotate(90deg);
}

.refresh-btn:active {
  transform: rotate(180deg) scale(0.95);
}

/* Right Panel */
.right-panel {
  background: white;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 20px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
}

.preview-section {
  margin-bottom: 30px;
}

.preview-section h3,
.effects-display-section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.preview-placeholder {
  background: #f9f9f9;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 60px 20px;
  text-align: center;
  color: #999;
  margin-bottom: 15px;
}

.preview-placeholder p {
  margin: 5px 0;
}

.preview-placeholder .hint {
  font-size: 12px;
  font-style: italic;
}

.preview-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-icon {
  padding: 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: #f5f5f5;
  border-color: #667eea;
}

.effects-display-section {
  margin-top: 30px;
}

.effects-list {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  min-height: 200px;
}

.effects-list .hint {
  color: #999;
  text-align: center;
  font-style: italic;
  font-size: 14px;
}

.effects-list h4 {
  color: #2c3e50;
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 10px;
  font-weight: 600;
}

.validation-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  transition: all 0.2s ease;
}

.validation-item.not-found {
  border-color: #f59e0b;
  background: #fffbea;
}

.validation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.validation-icon {
  font-size: 16px;
}

.global-badge, .local-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  margin-left: auto;
}

.global-badge {
  background: #667eea;
  color: white;
}

.local-badge {
  background: #10b981;
  color: white;
}

.validation-body {
  font-size: 13px;
  color: #666;
  padding-left: 24px;
}

.validation-body p {
  margin: 4px 0;
}

.validation-error {
  font-size: 13px;
  color: #f59e0b;
  padding-left: 24px;
  font-weight: 500;
}

/* Styles for display-only cards */
.card-item-display {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  transition: all 0.2s ease;
}

.card-item-display:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-item-display .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-item-display .edit-btn {
  padding: 6px 12px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.card-item-display .edit-btn:hover {
  background: #5568d3;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.info-row.full {
  flex-direction: column;
  gap: 5px;
}

.info-label {
  font-weight: 600;
  color: #666;
  min-width: 60px;
}

.info-value {
  color: #333;
}

/* Responsive */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 200px 1fr 300px;
  }
}

@media (max-width: 992px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .left-panel {
    display: none;
  }
  
  .right-panel {
    display: none;
  }
}

/* Alignment badge styles */
.alignment-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
}

.alignment-positive {
  background: #d4edda;
  color: #155724;
}

.alignment-neutral {
  background: #fff3cd;
  color: #856404;
}

.alignment-negative {
  background: #f8d7da;
  color: #721c24;
}

/* Card actions container */
.card-actions {
  display: flex;
  gap: 8px;
}

.edit-btn {
  padding: 6px 12px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: #5568d3;
}

/* Modal form styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.form-group input[type="text"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.required {
  color: #e74c3c;
}

.form-hint {
  display: block;
  margin-top: 5px;
  color: #999;
  font-size: 12px;
  font-style: italic;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #e0e0e0;
  color: #555;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}
</style>
