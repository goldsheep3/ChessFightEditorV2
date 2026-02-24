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
      <!-- Left Panel: Navigation & Directory -->
      <div class="left-panel">
        <div class="nav-tabs">
          <button
            class="nav-tab"
            :class="{ active: activeTab === 'basic' }"
            @click="activeTab = 'basic'"
          >
            📋 基础信息
          </button>
          <button
            class="nav-tab"
            :class="{ active: activeTab === 'effects' }"
            @click="activeTab = 'effects'"
          >
            ✨ 局部效果库
          </button>
          <button
            class="nav-tab"
            :class="{ active: activeTab === 'fixed-terms' }"
            @click="activeTab = 'fixed-terms'"
          >
            📌 局部固词库
          </button>
          <button
            class="nav-tab"
            :class="{ active: activeTab === 'forms' }"
            @click="activeTab = 'forms'"
          >
            👤 形态
          </button>
          <button
            class="nav-tab"
            :class="{ active: activeTab === 'summons' }"
            @click="activeTab = 'summons'"
          >
            🐾 召唤物
          </button>
          <button
            class="nav-tab"
            :class="{ active: activeTab === 'buildings' }"
            @click="activeTab = 'buildings'"
          >
            🏰 建筑
          </button>
          <button
            class="nav-tab"
            :class="{ active: activeTab === 'attacks' }"
            @click="activeTab = 'attacks'"
          >
            ⚔️ 攻击
          </button>
          <button
            class="nav-tab"
            :class="{ active: activeTab === 'strategies' }"
            @click="activeTab = 'strategies'"
          >
            🎯 策略
          </button>
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
        <div v-if="activeTab === 'forms'" class="edit-section">
          <h2>形态</h2>
          <div class="items-list">
            <p v-if="!setData.forms || setData.forms.length === 0" class="empty-hint">暂无形态</p>
            <div v-for="(form, index) in setData.forms" :key="index" class="card-item">
              <div class="card-header">
                <h4>{{ form.name }} <span class="id-badge">({{ form.id }})</span></h4>
                <button v-if="form.id !== 'default'" class="delete-btn" @click="deleteForm(index)">🗑️ 删除</button>
              </div>
              <div class="card-content">
                <p><strong>阶段数:</strong> {{ form.stages.length }}</p>
              </div>
            </div>
          </div>
          <button class="add-btn" @click="addForm">➕ 添加形态</button>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { setAPI } from '@/utils/api'
import { validateId, ALIGNMENT_OPTIONS, ALIGNMENT_TRANSLATION } from '@/utils/validation'

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
const activeTab = ref('basic')

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
    loading.value = false
  } catch (err) {
    console.error('Error loading set:', err)
    error.value = '加载套组失败'
    loading.value = false
  }
}

function goBack() {
  router.push('/')
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
  const formId = prompt('请输入形态ID (小写字母、数字、下划线):')
  if (!formId) return
  
  try {
    validateId(formId, '形态ID')
  } catch (err) {
    alert(err.message)
    return
  }
  
  const formName = prompt('请输入形态名称:')
  if (!formName) return
  
  if (!setData.value.forms) setData.value.forms = []
  
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
  const id = prompt('请输入召唤物ID:')
  if (!id) return
  try {
    validateId(id, '召唤物ID')
  } catch (err) {
    alert(err.message)
    return
  }
  const name = prompt('请输入召唤物名称:')
  if (!name) return
  
  if (!setData.value.summons) setData.value.summons = []
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
  const id = prompt('请输入建筑ID:')
  if (!id) return
  try {
    validateId(id, '建筑ID')
  } catch (err) {
    alert(err.message)
    return
  }
  const name = prompt('请输入建筑名称:')
  if (!name) return
  
  if (!setData.value.buildings) setData.value.buildings = []
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
  const id = prompt('请输入攻击ID:')
  if (!id) return
  try {
    validateId(id, '攻击ID')
  } catch (err) {
    alert(err.message)
    return
  }
  const name = prompt('请输入攻击名称:')
  if (!name) return
  
  if (!setData.value.attacks) setData.value.attacks = []
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
  const id = prompt('请输入策略ID:')
  if (!id) return
  try {
    validateId(id, '策略ID')
  } catch (err) {
    alert(err.message)
    return
  }
  const name = prompt('请输入策略名称:')
  if (!name) return
  
  if (!setData.value.strategies) setData.value.strategies = []
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
    alert('保存成功！')
  } catch (err) {
    console.error('Error saving set:', err)
    alert('保存失败: ' + err.message)
  }
}

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

.nav-tabs {
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.nav-tab {
  padding: 12px 15px;
  margin-bottom: 5px;
  border: none;
  background: #f5f5f5;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.nav-tab:hover {
  background: #e8e8e8;
}

.nav-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
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
