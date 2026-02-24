<template>
  <div class="container">
    <h1>ChessFight 套组编辑器 V2</h1>
    
    <div class="section">
      <h2>套组管理</h2>
      <div id="sets-list">
        <p v-if="sets.length === 0">暂无套组，请创建一个新套组</p>
        <div v-for="set in sets" :key="set.set_code" class="set-item">
          <div>
            <h3>{{ set.name }}</h3>
            <p>{{ set.description || '无描述' }}</p>
            <p><strong>代码:</strong> {{ set.set_code }}</p>
          </div>
          <div class="action-buttons">
            <router-link :to="`/editor/${set.set_code}`" class="button">编辑</router-link>
            <button class="danger" @click="deleteSet(set.set_code)">删除</button>
          </div>
        </div>
      </div>
      <div class="action-buttons">
        <button @click="createNewSet">创建新套组</button>
      </div>
    </div>
    
    <div class="section">
      <h2>通用库管理</h2>
      <div class="action-buttons">
        <router-link to="/global/effects" class="button">编辑全局效果库</router-link>
        <router-link to="/global/fixed-terms" class="button">编辑全局固词库</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { setAPI } from '@/utils/api'
import { validateSetCode } from '@/utils/validation'

const router = useRouter()
const sets = ref([])

async function loadSets() {
  try {
    const data = await setAPI.list()
    sets.value = data.sets
  } catch (error) {
    console.error('Error loading sets:', error)
    alert('加载套组列表失败')
  }
}

function createNewSet() {
  const setCode = prompt('请输入新套组的代码 (英文、数字、下划线):')
  
  if (!setCode) return
  
  // Validate set code
  try {
    validateSetCode(setCode)
  } catch (error) {
    alert(error.message)
    return
  }
  
  // Create a minimal valid set
  const newSet = {
    schema_version: 2,
    name: setCode,
    set_code: setCode,
    description: "",
    notes: "",
    archetypes: [],
    designers: [],
    effects: {},
    fixed_terms: {},
    forms: [
      {
        id: "default",
        name: "默认形态",
        stages: [
          {
            stage: 1,
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
      }
    ],
    summons: [],
    buildings: [],
    attacks: [],
    strategies: []
  }
  
  // Save the new set
  setAPI.save(setCode, newSet)
    .then(() => {
      alert('套组创建成功！')
      router.push(`/editor/${setCode}`)
    })
    .catch(error => {
      alert('创建失败: ' + (error.message || '未知错误'))
    })
}

async function deleteSet(setCode) {
  if (!confirm(`确定要删除套组 ${setCode} 吗？此操作无法撤销！`)) {
    return
  }
  
  try {
    await setAPI.delete(setCode)
    alert('套组已删除')
    loadSets()
  } catch (error) {
    console.error('Error deleting set:', error)
    alert('删除套组失败: ' + error.message)
  }
}

onMounted(() => {
  loadSets()
})
</script>
