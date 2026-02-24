<template>
  <div class="container">
    <div class="header">
      <h1>全局固词库编辑器</h1>
      <router-link to="/" class="button">返回首页</router-link>
    </div>
    
    <div v-if="loading" id="loading">加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="!loading && !error" id="editor-content">
      <div class="section">
        <h2>全局固词</h2>
        <div id="terms-list">
          <p v-if="Object.keys(terms).length === 0">暂无全局固词</p>
          <div v-for="(term, id) in terms" :key="id" class="term-item">
            <div class="item-header">
              <h4>{{ term.name }} ({{ id }})</h4>
              <button class="delete-btn" @click="deleteTerm(id)">删除</button>
            </div>
            <div class="form-group">
              <label>名称:</label>
              <input type="text" v-model="term.name">
            </div>
            <div class="form-group">
              <label>备注:</label>
              <textarea rows="2" v-model="term.note"></textarea>
            </div>
          </div>
        </div>
        <button @click="addTerm">添加固词</button>
      </div>
      
      <div class="action-buttons">
        <button @click="saveTerms" class="primary">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { globalAPI } from '@/utils/api'
import { validateId } from '@/utils/validation'

const loading = ref(true)
const error = ref(null)
const terms = ref({})

async function loadTerms() {
  try {
    const data = await globalAPI.getFixedTerms()
    terms.value = data.fixed_terms || {}
    loading.value = false
  } catch (err) {
    console.error('Error loading terms:', err)
    error.value = '加载全局固词库失败'
    loading.value = false
  }
}

function addTerm() {
  const termId = prompt('请输入固词ID (小写字母、数字、下划线):')
  if (!termId) return
  
  try {
    validateId(termId, '固词ID')
  } catch (err) {
    alert(err.message)
    return
  }
  
  if (terms.value[termId]) {
    alert('该ID已存在！')
    return
  }
  
  const termName = prompt('请输入固词名称:')
  if (!termName) return
  
  terms.value[termId] = {
    name: termName,
    note: ""
  }
}

function deleteTerm(id) {
  if (!confirm('确定要删除此固词吗？')) return
  delete terms.value[id]
}

async function saveTerms() {
  try {
    await globalAPI.saveFixedTerms({ fixed_terms: terms.value })
    alert('保存成功！')
  } catch (err) {
    console.error('Error saving terms:', err)
    error.value = '保存失败: ' + err.message
  }
}

onMounted(() => {
  loadTerms()
})
</script>
