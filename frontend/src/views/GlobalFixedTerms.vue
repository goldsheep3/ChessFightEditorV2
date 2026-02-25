<template>
  <div class="editor-layout">
    <!-- Top Bar -->
    <div class="top-bar">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1 class="page-title">全局固词库编辑器</h1>
      <button class="save-btn primary" @click="saveTerms">💾 保存</button>
    </div>

    <div v-if="loading" class="loading-overlay">加载中...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error" class="main-content">
      <!-- Left Panel: Table of Contents -->
      <div class="left-panel">
        <div class="nav-section">
          <h3>📑 目录</h3>
          <div v-if="Object.keys(terms).length === 0" class="empty-hint">
            暂无固词
          </div>
          <div v-for="(term, id) in terms" :key="id" class="toc-item" @click="scrollToTerm(id)">
            <span class="toc-icon">📌</span>
            <span class="toc-text">{{ term.name }}</span>
          </div>
        </div>
        <div class="nav-section" style="margin-top: 20px;">
          <h3>🗂️ 库管理</h3>
          <div class="nav-item" @click="$router.push('/global/effects')">
            <span class="nav-icon">✨</span>
            <span>全局效果库</span>
          </div>
          <div class="nav-item" @click="$router.push('/')">
            <span class="nav-icon">🏠</span>
            <span>返回首页</span>
          </div>
        </div>
      </div>

      <!-- Center Panel: Fixed Terms List -->
      <div class="center-panel">
        <div class="content-header">
          <h2>📌 全局固词列表</h2>
          <button class="add-btn" @click="openAddModal">➕ 添加固词</button>
        </div>

        <div v-if="Object.keys(terms).length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>暂无全局固词</p>
        </div>

        <div class="terms-list">
          <div v-for="(term, id) in terms" :key="id" :id="`term-${id}`" class="term-card">
            <div class="card-header">
              <h4>{{ term.name }} <span class="id-badge">({{ id }})</span></h4>
              <button class="edit-btn" @click="openEditModal(id, term)">✏️ 编辑</button>
            </div>
            <div class="term-details">
              <div v-if="term.note" class="detail-item">
                <span class="detail-label">备注:</span>
                <span class="detail-value">{{ term.note }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Info -->
      <div class="right-panel">
        <div class="info-section">
          <h3>📊 统计信息</h3>
          <div class="stat-card">
            <div class="stat-value">{{ Object.keys(terms).length }}</div>
            <div class="stat-label">固词总数</div>
          </div>
        </div>

        <div class="help-section">
          <h3>💡 说明</h3>
          <div class="help-content">
            <p><strong>全局固词库</strong>用于存储可在多个套组间共享的固定词汇定义。</p>
            <p><strong>使用场景：</strong></p>
            <ul>
              <li>游戏机制关键词</li>
              <li>状态效果名称</li>
              <li>通用术语定义</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit/Add Term Modal -->
    <ModalDialog 
      v-model="showEditModal" 
      :title="isEditMode ? '✏️ 编辑固词' : '➕ 添加固词'"
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
          :disabled="isEditMode"
          @keyup.enter="handleSaveTerm"
        >
        <small v-if="!isEditMode" class="form-hint">ID创建后不可修改</small>
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
      <div v-if="isEditMode" class="modal-actions">
        <button class="btn-danger" @click="handleDeleteTerm">🗑️ 删除此固词</button>
      </div>
    </ModalDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { globalAPI } from '@/utils/api'
import { validateId } from '@/utils/validation'
import { useNotification } from '@/utils/notification'
import ModalDialog from '@/components/ModalDialog.vue'

const router = useRouter()
const notification = useNotification()
const loading = ref(true)
const error = ref(null)
const terms = ref({})

// Modal state
const showEditModal = ref(false)
const isEditMode = ref(false)
const editingTerm = ref({
  id: '',
  name: '',
  note: ''
})
const originalId = ref('')

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

function goBack() {
  router.push('/')
}

function scrollToTerm(id) {
  const element = document.getElementById(`term-${id}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Briefly highlight the element
    element.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.5)'
    setTimeout(() => {
      element.style.boxShadow = ''
    }, 1000)
  }
}

function openAddModal() {
  isEditMode.value = false
  editingTerm.value = {
    id: '',
    name: '',
    note: ''
  }
  originalId.value = ''
  showEditModal.value = true
}

function openEditModal(id, term) {
  isEditMode.value = true
  editingTerm.value = {
    id: id,
    name: term.name,
    note: term.note || ''
  }
  originalId.value = id
  showEditModal.value = true
}

async function handleSaveTerm() {
  const { id, name, note } = editingTerm.value
  
  if (!id || !name) {
    notification.error('请填写必填项：固词ID和名称')
    return
  }
  
  // Validate ID for new terms
  if (!isEditMode.value) {
    try {
      validateId(id, '固词ID')
    } catch (err) {
      notification.error(err.message)
      return
    }
    
    if (terms.value[id]) {
      notification.error('该固词ID已存在！')
      return
    }
  }
  
  terms.value[id] = {
    name,
    note: note || ''
  }
  
  try {
    await globalAPI.saveFixedTerms({ fixed_terms: terms.value })
    notification.success(isEditMode.value ? '固词已更新！' : '固词已添加！')
    showEditModal.value = false
  } catch (err) {
    console.error('Error saving terms:', err)
    notification.error('保存失败: ' + err.message)
  }
}

async function handleDeleteTerm() {
  if (!confirm('确定要删除此固词吗？此操作无法撤销！')) {
    return
  }
  
  const id = originalId.value
  delete terms.value[id]
  
  try {
    await globalAPI.saveFixedTerms({ fixed_terms: terms.value })
    notification.success('固词已删除！')
    showEditModal.value = false
  } catch (err) {
    console.error('Error deleting term:', err)
    notification.error('删除失败: ' + err.message)
  }
}

async function saveTerms() {
  try {
    await globalAPI.saveFixedTerms({ fixed_terms: terms.value })
    notification.success('保存成功！')
  } catch (err) {
    console.error('Error saving terms:', err)
    notification.error('保存失败: ' + err.message)
  }
}

onMounted(() => {
  loadTerms()
})
</script>

<style scoped>
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
  grid-template-columns: 250px 1fr 300px;
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
  padding: 20px;
}

.nav-section h3 {
  color: #2c3e50;
  font-size: 14px;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 5px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.nav-item:hover {
  background: #f5f5f5;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.nav-icon {
  margin-right: 10px;
  font-size: 18px;
}

.nav-icon {
  margin-right: 10px;
  font-size: 18px;
}

/* TOC Items */
.toc-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 5px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  color: #555;
}

.toc-item:hover {
  background: #f5f5f5;
  color: #667eea;
}

.toc-icon {
  margin-right: 8px;
  font-size: 14px;
}

.toc-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-hint {
  padding: 20px 10px;
  text-align: center;
  color: #999;
  font-size: 13px;
  font-style: italic;
}

/* Center Panel */
.center-panel {
  background: white;
  padding: 30px;
  overflow-y: auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.content-header h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 24px;
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
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: #667eea;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.terms-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.term-card {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

.term-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
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

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
  font-size: 13px;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Right Panel */
.right-panel {
  background: white;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 20px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
}

.info-section,
.help-section {
  margin-bottom: 30px;
}

.info-section h3,
.help-section h3 {
  color: #2c3e50;
  font-size: 16px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
}

.stat-value {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.help-content {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.8;
  color: #666;
}

.help-content p {
  margin: 0 0 10px;
}

.help-content ul {
  margin: 10px 0 0 20px;
  padding: 0;
}

.help-content li {
  margin-bottom: 5px;
}

/* Responsive */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 200px 1fr 250px;
  }
  
  .terms-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 992px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .left-panel,
  .right-panel {
    display: none;
  }
}

/* Additional styles for display-only mode */
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

.term-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  gap: 10px;
}

.detail-label {
  font-weight: 600;
  color: #666;
  min-width: 60px;
}

.detail-value {
  color: #333;
  flex: 1;
}

/* Modal specific styles */
.modal-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e0e0e0;
}

.btn-danger {
  padding: 10px 20px;
  border: none;
  background: #e74c3c;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-danger:hover {
  background: #c0392b;
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
</style>
