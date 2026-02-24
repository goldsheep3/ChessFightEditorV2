<template>
  <div class="container">
    <div class="header">
      <h1>套组编辑器</h1>
      <router-link to="/" class="button">返回首页</router-link>
    </div>
    
    <div v-if="loading" id="loading">加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="!loading && !error && setData" id="editor-content">
      <!-- Basic Information -->
      <div class="section">
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
      </div>
      
      <!-- Design Information -->
      <div class="section">
        <h2>设计信息</h2>
        <div class="form-group">
          <label>原型 (多个用逗号分隔):</label>
          <input type="text" v-model="archetypesStr" placeholder="例如: 原型1, 原型2">
        </div>
        <div class="form-group">
          <label>设计师 (多个用逗号分隔):</label>
          <input type="text" v-model="designersStr" placeholder="例如: 设计师1, 设计师2">
        </div>
      </div>
      
      <!-- Local Effects Library -->
      <div class="section">
        <h2>局部效果库</h2>
        <div id="effects-editor">
          <p v-if="Object.keys(setData.effects || {}).length === 0">暂无局部效果</p>
          <div v-for="(effect, id) in setData.effects" :key="id" class="effect-item">
            <div class="item-header">
              <h4>{{ effect.name }} ({{ id }})</h4>
              <button class="delete-btn" @click="deleteEffect(id)">删除</button>
            </div>
            <p>性质: {{ alignmentTranslation[effect.alignment] || effect.alignment }}</p>
            <p>备注: {{ effect.note || '无' }}</p>
          </div>
        </div>
        <button @click="addEffect">添加效果</button>
      </div>
      
      <!-- Local Fixed Terms Library -->
      <div class="section">
        <h2>局部固词库</h2>
        <div id="fixed-terms-editor">
          <p v-if="Object.keys(setData.fixed_terms || {}).length === 0">暂无局部固词</p>
          <div v-for="(term, id) in setData.fixed_terms" :key="id" class="term-item">
            <div class="item-header">
              <h4>{{ term.name }} ({{ id }})</h4>
              <button class="delete-btn" @click="deleteFixedTerm(id)">删除</button>
            </div>
            <p>备注: {{ term.note || '无' }}</p>
          </div>
        </div>
        <button @click="addFixedTerm">添加固词</button>
      </div>
      
      <!-- Forms -->
      <div class="section">
        <h2>形态</h2>
        <div id="forms-editor">
          <p v-if="!setData.forms || setData.forms.length === 0">暂无形态</p>
          <div v-for="(form, index) in setData.forms" :key="index" class="form-item">
            <div class="item-header">
              <h4>形态: {{ form.name }} ({{ form.id }})</h4>
              <button v-if="form.id !== 'default'" class="delete-btn" @click="deleteForm(index)">删除</button>
            </div>
            <p>阶段数: {{ form.stages.length }}</p>
          </div>
        </div>
        <button @click="addForm">添加形态</button>
      </div>
      
      <!-- Summons -->
      <div class="section">
        <h2>召唤物</h2>
        <div id="summons-editor">
          <p v-if="!setData.summons || setData.summons.length === 0">暂无召唤物</p>
          <div v-for="(summon, index) in setData.summons" :key="index" class="summon-item">
            <div class="item-header">
              <h4>{{ summon.name }} ({{ summon.id }})</h4>
              <button class="delete-btn" @click="deleteSummon(index)">删除</button>
            </div>
          </div>
        </div>
        <button @click="addSummon">添加召唤物</button>
      </div>
      
      <!-- Buildings -->
      <div class="section">
        <h2>建筑</h2>
        <div id="buildings-editor">
          <p v-if="!setData.buildings || setData.buildings.length === 0">暂无建筑</p>
          <div v-for="(building, index) in setData.buildings" :key="index" class="building-item">
            <div class="item-header">
              <h4>{{ building.name }} ({{ building.id }})</h4>
              <button class="delete-btn" @click="deleteBuilding(index)">删除</button>
            </div>
          </div>
        </div>
        <button @click="addBuilding">添加建筑</button>
      </div>
      
      <!-- Attacks -->
      <div class="section">
        <h2>攻击</h2>
        <div id="attacks-editor">
          <p v-if="!setData.attacks || setData.attacks.length === 0">暂无攻击</p>
          <div v-for="(attack, index) in setData.attacks" :key="index" class="attack-item">
            <div class="item-header">
              <h4>{{ attack.name }} ({{ attack.id }})</h4>
              <button class="delete-btn" @click="deleteAttack(index)">删除</button>
            </div>
          </div>
        </div>
        <button @click="addAttack">添加攻击</button>
      </div>
      
      <!-- Strategies -->
      <div class="section">
        <h2>策略</h2>
        <div id="strategies-editor">
          <p v-if="!setData.strategies || setData.strategies.length === 0">暂无策略</p>
          <div v-for="(strategy, index) in setData.strategies" :key="index" class="strategy-item">
            <div class="item-header">
              <h4>{{ strategy.name }} ({{ strategy.id }})</h4>
              <button class="delete-btn" @click="deleteStrategy(index)">删除</button>
            </div>
          </div>
        </div>
        <button @click="addStrategy">添加策略</button>
      </div>
      
      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="saveSet" class="primary">保存</button>
        <button @click="deleteCurrentSet" class="danger">删除套组</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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

const alignmentTranslation = ALIGNMENT_TRANSLATION

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

async function deleteCurrentSet() {
  if (!confirm(`确定要删除套组 ${props.setCode} 吗？此操作无法撤销！`)) {
    return
  }
  
  try {
    await setAPI.delete(props.setCode)
    alert('套组已删除')
    router.push('/')
  } catch (err) {
    console.error('Error deleting set:', err)
    alert('删除套组失败: ' + err.message)
  }
}

onMounted(() => {
  loadSet()
})
</script>
