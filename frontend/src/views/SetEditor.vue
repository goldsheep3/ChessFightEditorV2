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
                  <span v-if="attack.rarity === 'SSR'" class="badge decision-badge">决策</span>
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
                <span class="tree-text">{{ strategy.name }}</span>
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
                <span class="tree-text">{{ summon.name }}</span>
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
                <span class="tree-text">{{ building.name }}</span>
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
            <input type="text" v-model="setData.name" placeholder="输入套组名称">
          </div>
          <div class="form-group">
            <label>描述:</label>
            <textarea v-model="setData.description" rows="3" placeholder="输入描述"></textarea>
          </div>
          <div class="form-group">
            <label>备注:</label>
            <textarea v-model="setData.notes" rows="3" placeholder="输入备注"></textarea>
          </div>
          
          <h3>设计信息</h3>
          <div class="form-group">
            <label>原型 (多个用逗号分隔):</label>
            <input type="text" v-model="archetypesStr" placeholder="例如: 原型1, 原型2">
          </div>
          <div class="form-group">
            <label>设计师 (多个用逗号分隔):</label>
            <input type="text" v-model="designersStr" placeholder="例如: 设计师1, 设计师2">
          </div>
        </div>

        <!-- Effects Tab -->
        <div v-if="activeTab === 'effects'" class="edit-section">
          <h2>局部效果库</h2>
          <div class="items-list">
            <p v-if="Object.keys(setData.effects || {}).length === 0" class="empty-hint">暂无局部效果</p>
            <div v-for="(effect, id) in setData.effects" :key="id" class="card-item">
              <div class="card-header">
                <h4>{{ effect.name }} <span class="id-badge">({{ id }})</span></h4>
                <button class="delete-btn" @click="deleteEffect(id)">🗑️ 删除</button>
              </div>
              <div class="card-content">
                <p><strong>性质:</strong> {{ alignmentTranslation[effect.alignment] || effect.alignment }}</p>
                <p><strong>备注:</strong> {{ effect.note || '无' }}</p>
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
                <button class="delete-btn" @click="deleteFixedTerm(id)">🗑️ 删除</button>
              </div>
              <div class="card-content">
                <p><strong>备注:</strong> {{ term.note || '无' }}</p>
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
                <input type="text" v-model="form.name" placeholder="输入形态名称">
              </div>
              
              <!-- Display all stages (II and III) on the same page -->
              <template v-for="stage in form.stages" :key="`${form.id}-${stage.stage}`">
                <div class="stage-section">
                  <h3>【{{ toRoman(stage.stage) }}】阶属性</h3>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label>消耗:</label>
                      <input type="number" v-model.number="stage.cost" min="0">
                    </div>
                    <div class="form-group">
                      <label>移动:</label>
                      <input type="number" v-model.number="stage.move" min="0">
                    </div>
                    <div class="form-group">
                      <label>攻击:</label>
                      <input type="number" v-model.number="stage.atk" min="0">
                    </div>
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label>初始HP:</label>
                      <input type="number" v-model.number="stage.hp_init" min="1">
                    </div>
                    <div class="form-group">
                      <label>HP上限:</label>
                      <input type="number" v-model.number="stage.hp_limit" min="1">
                    </div>
                    <div class="form-group">
                      <label>稀有度:</label>
                      <select v-model="stage.rarity">
                        <option value="N">N</option>
                        <option value="R">R</option>
                        <option value="SR">SR</option>
                        <option value="SSR">SSR</option>
                      </select>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>图片URL:</label>
                    <input type="text" v-model="stage.image" placeholder="图片地址">
                  </div>
                  <div class="form-group">
                    <label>图标URL:</label>
                    <input type="text" v-model="stage.icon" placeholder="图标地址">
                  </div>
                  <div class="form-group">
                    <label>爆裂值:</label>
                    <input type="text" v-model="stage.brast" placeholder="爆裂值">
                  </div>
                  
                  <div class="form-group">
                    <label>描述文本:</label>
                    <textarea v-model="stage.text" rows="4" placeholder="输入卡牌描述"></textarea>
                  </div>
                  
                  <div class="form-group">
                    <label>绑定效果 (多个用逗号分隔):</label>
                    <input 
                      type="text" 
                      :value="(stage.bound_effects || []).join(', ')"
                      @input="stage.bound_effects = $event.target.value.split(',').map(s => s.trim()).filter(Boolean)"
                      placeholder="例如: effect1, effect2"
                    >
                  </div>
                  
                  <div class="form-group">
                    <label>绑定固词 (多个用逗号分隔):</label>
                    <input 
                      type="text" 
                      :value="(stage.bound_fixed_terms || []).join(', ')"
                      @input="stage.bound_fixed_terms = $event.target.value.split(',').map(s => s.trim()).filter(Boolean)"
                      placeholder="例如: term1, term2"
                    >
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
            <div v-for="(summon, index) in setData.summons" :key="index" class="card-item">
              <div class="card-header">
                <h4>{{ summon.name }} <span class="id-badge">({{ summon.id }})</span></h4>
                <button class="delete-btn" @click="deleteSummon(index)">🗑️ 删除</button>
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
            <div v-for="(building, index) in setData.buildings" :key="index" class="card-item">
              <div class="card-header">
                <h4>{{ building.name }} <span class="id-badge">({{ building.id }})</span></h4>
                <button class="delete-btn" @click="deleteBuilding(index)">🗑️ 删除</button>
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
            <div v-for="(attack, index) in setData.attacks" :key="index" class="card-item">
              <div class="card-header">
                <h4>{{ attack.name }} <span class="id-badge">({{ attack.id }})</span></h4>
                <button class="delete-btn" @click="deleteAttack(index)">🗑️ 删除</button>
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
            <div v-for="(strategy, index) in setData.strategies" :key="index" class="card-item">
              <div class="card-header">
                <h4>{{ strategy.name }} <span class="id-badge">({{ strategy.id }})</span></h4>
                <button class="delete-btn" @click="deleteStrategy(index)">🗑️ 删除</button>
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
          <h3>绑定效果/固词</h3>
          <div class="effects-list">
            <p class="hint">当前页面处理的效果和固词描述将显示在这里</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { setAPI } from '@/utils/api'
import { validateId, ALIGNMENT_OPTIONS, ALIGNMENT_TRANSLATION, generateRandomId } from '@/utils/validation'

const props = defineProps({
  setCode: {
    type: String,
    required: true
  }
})

const router = useRouter()
const loading = ref(true)
const error = ref(null)
const setData = ref(null)
const originalData = ref(null) // Store original data for change detection
const activeTab = ref('basic')
const selectedItem = ref({ type: 'basic', id: null, stage: null }) // Track selected item in tree
const hasUnsavedChanges = ref(false)

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

// Effects management
function addEffect() {
  const effectId = prompt('请输入效果ID (小写字母、数字、下划线):')
  if (!effectId) return
  
  try {
    validateId(effectId, '效果ID')
  } catch (err) {
    alert(err.message)
    return
  }
  
  if (!setData.value.effects) setData.value.effects = {}
  if (setData.value.effects[effectId]) {
    alert('该ID已存在！')
    return
  }
  
  const effectName = prompt('请输入效果名称:')
  if (!effectName) return
  
  const alignment = prompt('请输入性质 (positive/neutral/negative):')
  if (!ALIGNMENT_OPTIONS.includes(alignment)) {
    alert('性质必须是 positive、neutral 或 negative')
    return
  }
  
  setData.value.effects[effectId] = {
    name: effectName,
    alignment: alignment,
    note: ""
  }
}

function deleteEffect(id) {
  if (!confirm('确定要删除此效果吗？')) return
  delete setData.value.effects[id]
}

// Fixed terms management
function addFixedTerm() {
  const termId = prompt('请输入固词ID (小写字母、数字、下划线):')
  if (!termId) return
  
  try {
    validateId(termId, '固词ID')
  } catch (err) {
    alert(err.message)
    return
  }
  
  if (!setData.value.fixed_terms) setData.value.fixed_terms = {}
  if (setData.value.fixed_terms[termId]) {
    alert('该ID已存在！')
    return
  }
  
  const termName = prompt('请输入固词名称:')
  if (!termName) return
  
  setData.value.fixed_terms[termId] = {
    name: termName,
    note: ""
  }
}

function deleteFixedTerm(id) {
  if (!confirm('确定要删除此固词吗？')) return
  delete setData.value.fixed_terms[id]
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
    stages: [
      {
        stage: 2,
        cost: 0,
        move: 0,
        atk: 0,
        hp_init: 1,
        hp_limit: 1,
        rarity: "R",
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
        rarity: "R",
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
  // Generate random 8-character ID automatically
  let id = generateRandomId(8)
  if (!setData.value.summons) setData.value.summons = []
  
  // Ensure the ID is unique
  while (setData.value.summons.some(s => s.id === id)) {
    id = generateRandomId(8)
  }
  
  // Use default name "新建卡牌"
  const name = "新建卡牌"
  
  setData.value.summons.push({
    id, name,
    cost: 0, move: 0, atk: 0, hp_init: 1, hp_limit: 1,
    rarity: "R", image: "", icon: "", brast: "", text: "",
    bound_effects: [], bound_fixed_terms: []
  })
}

function deleteSummon(index) {
  if (!confirm('确定要删除此召唤物吗？')) return
  setData.value.summons.splice(index, 1)
}

function addBuilding() {
  // Generate random 8-character ID automatically
  let id = generateRandomId(8)
  if (!setData.value.buildings) setData.value.buildings = []
  
  // Ensure the ID is unique
  while (setData.value.buildings.some(b => b.id === id)) {
    id = generateRandomId(8)
  }
  
  // Use default name "新建卡牌"
  const name = "新建卡牌"
  
  setData.value.buildings.push({
    id, name,
    cost: 0, hp_init: 1, hp_limit: 1,
    rarity: "R", image: "", icon: "", brast: "", text: "",
    bound_effects: [], bound_fixed_terms: []
  })
}

function deleteBuilding(index) {
  if (!confirm('确定要删除此建筑吗？')) return
  setData.value.buildings.splice(index, 1)
}

function addAttack() {
  // Generate random 8-character ID automatically
  let id = generateRandomId(8)
  if (!setData.value.attacks) setData.value.attacks = []
  
  // Ensure the ID is unique
  while (setData.value.attacks.some(a => a.id === id)) {
    id = generateRandomId(8)
  }
  
  // Use default name "新建卡牌"
  const name = "新建卡牌"
  
  setData.value.attacks.push({
    id, name,
    cost: 0,
    rarity: "R", image: "", icon: "", brast: "", text: "",
    bound_effects: [], bound_fixed_terms: []
  })
}

function deleteAttack(index) {
  if (!confirm('确定要删除此攻击吗？')) return
  setData.value.attacks.splice(index, 1)
}

function addStrategy() {
  // Generate random 8-character ID automatically
  let id = generateRandomId(8)
  if (!setData.value.strategies) setData.value.strategies = []
  
  // Ensure the ID is unique
  while (setData.value.strategies.some(s => s.id === id)) {
    id = generateRandomId(8)
  }
  
  // Use default name "新建卡牌"
  const name = "新建卡牌"
  
  setData.value.strategies.push({
    id, name,
    cost: 0,
    rarity: "R", image: "", icon: "", brast: "", text: "",
    bound_effects: [], bound_fixed_terms: []
  })
}

function deleteStrategy(index) {
  if (!confirm('确定要删除此策略吗？')) return
  setData.value.strategies.splice(index, 1)
}

async function saveSet() {
  try {
    await setAPI.save(props.setCode, setData.value)
    // Update original data after successful save
    originalData.value = JSON.parse(JSON.stringify(setData.value))
    hasUnsavedChanges.value = false
    alert('保存成功！')
  } catch (err) {
    console.error('Error saving set:', err)
    alert('保存失败: ' + err.message)
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
</style>
