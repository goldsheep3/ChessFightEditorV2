<template>
  <div class="container">
    <div class="header">
      <h1>全局效果库编辑器</h1>
      <router-link to="/" class="button">返回首页</router-link>
    </div>
    
    <div v-if="loading" id="loading">加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="!loading && !error" id="editor-content">
      <div class="section">
        <h2>全局效果</h2>
        <div id="effects-list">
          <p v-if="Object.keys(effects).length === 0">暂无全局效果</p>
          <div v-for="(effect, id) in effects" :key="id" class="effect-item">
            <div class="item-header">
              <h4>{{ effect.name }} ({{ id }})</h4>
              <button class="delete-btn" @click="deleteEffect(id)">删除</button>
            </div>
            <div class="form-group">
              <label>名称:</label>
              <input type="text" v-model="effect.name">
            </div>
            <div class="form-group">
              <label>性质:</label>
              <select v-model="effect.alignment">
                <option value="positive">正面 (positive)</option>
                <option value="neutral">中性 (neutral)</option>
                <option value="negative">负面 (negative)</option>
              </select>
            </div>
            <div class="form-group">
              <label>备注:</label>
              <textarea rows="2" v-model="effect.note"></textarea>
            </div>
          </div>
        </div>
        <button @click="addEffect">添加效果</button>
      </div>
      
      <div class="action-buttons">
        <button @click="saveEffects" class="primary">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { globalAPI } from '@/utils/api'
import { validateId, ALIGNMENT_OPTIONS } from '@/utils/validation'

const loading = ref(true)
const error = ref(null)
const effects = ref({})

async function loadEffects() {
  try {
    const data = await globalAPI.getEffects()
    effects.value = data.effects || {}
    loading.value = false
  } catch (err) {
    console.error('Error loading effects:', err)
    error.value = '加载全局效果库失败'
    loading.value = false
  }
}

function addEffect() {
  const effectId = prompt('请输入效果ID (小写字母、数字、下划线):')
  if (!effectId) return
  
  try {
    validateId(effectId, '效果ID')
  } catch (err) {
    alert(err.message)
    return
  }
  
  if (effects.value[effectId]) {
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
  
  effects.value[effectId] = {
    name: effectName,
    alignment: alignment,
    note: ""
  }
}

function deleteEffect(id) {
  if (!confirm('确定要删除此效果吗？')) return
  delete effects.value[id]
}

async function saveEffects() {
  try {
    await globalAPI.saveEffects({ effects: effects.value })
    alert('保存成功！')
  } catch (err) {
    console.error('Error saving effects:', err)
    error.value = '保存失败: ' + err.message
  }
}

onMounted(() => {
  loadEffects()
})
</script>
