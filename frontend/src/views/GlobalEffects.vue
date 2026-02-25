<template>
  <div class="editor-layout">
    <!-- Top Bar -->
    <div class="top-bar">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1 class="page-title">全局效果库编辑器</h1>
      <button class="save-btn primary" @click="saveEffects">💾 保存</button>
    </div>

    <div v-if="loading" class="loading-overlay">加载中...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error" class="main-content">
      <!-- Left Panel: Table of Contents -->
      <div class="left-panel">
        <div class="nav-section">
          <h3>📑 目录</h3>
          <div v-if="Object.keys(effects).length === 0" class="empty-hint">
            暂无效果
          </div>
          <div v-for="(effect, id) in effects" :key="id" class="toc-item" @click="scrollToEffect(id)">
            <span class="toc-icon">✨</span>
            <span class="toc-text">{{ effect.name }}</span>
          </div>
        </div>
        <div class="nav-section" style="margin-top: 20px;">
          <h3>🗂️ 库管理</h3>
          <div class="nav-item" @click="$router.push('/global/fixed-terms')">
            <span class="nav-icon">📌</span>
            <span>全局固词库</span>
          </div>
          <div class="nav-item" @click="$router.push('/')">
            <span class="nav-icon">🏠</span>
            <span>返回首页</span>
          </div>
        </div>
      </div>

      <!-- Center Panel: Effects List -->
      <div class="center-panel">
        <div class="content-header">
          <h2>✨ 全局效果列表</h2>
          <button class="add-btn" @click="openAddModal">➕ 添加效果</button>
        </div>

        <div v-if="Object.keys(effects).length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>暂无全局效果</p>
        </div>

        <div class="effects-list">
          <div v-for="(effect, id) in effects" :key="id" :id="`effect-${id}`" class="effect-card">
            <div class="card-header">
              <h4>{{ effect.name }} <span class="id-badge">({{ id }})</span></h4>
              <button class="edit-btn" @click="openEditModal(id, effect)">✏️ 编辑</button>
            </div>
            <div class="effect-details">
              <div class="detail-item">
                <span class="detail-label">性质:</span>
                <span class="detail-value">{{ getAlignmentLabel(effect.alignment) }}</span>
              </div>
              <div v-if="effect.note" class="detail-item">
                <span class="detail-label">备注:</span>
                <span class="detail-value">{{ effect.note }}</span>
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
            <div class="stat-value">{{ Object.keys(effects).length }}</div>
            <div class="stat-label">效果总数</div>
          </div>
        </div>

        <div class="help-section">
          <h3>💡 说明</h3>
          <div class="help-content">
            <p><strong>全局效果库</strong>用于存储可在多个套组间共享的效果定义。</p>
            <p><strong>性质分类：</strong></p>
            <ul>
              <li><strong>正面：</strong>对玩家有利的效果</li>
              <li><strong>中性：</strong>中性效果</li>
              <li><strong>负面：</strong>对玩家不利的效果</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit/Add Effect Modal -->
    <ModalDialog 
      v-model="showEditModal" 
      :title="isEditMode ? '✏️ 编辑效果' : '➕ 添加效果'"
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
          :disabled="isEditMode"
          @keyup.enter="handleSaveEffect"
        >
        <small v-if="!isEditMode" class="form-hint">ID创建后不可修改</small>
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
      <div v-if="isEditMode" class="modal-actions">
        <button class="btn-danger" @click="handleDeleteEffect">🗑️ 删除此效果</button>
      </div>
    </ModalDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { globalAPI } from '@/utils/api'
import { validateId, ALIGNMENT_OPTIONS } from '@/utils/validation'
import { useNotification } from '@/utils/notification'
import ModalDialog from '@/components/ModalDialog.vue'

const router = useRouter()
const notification = useNotification()
const loading = ref(true)
const error = ref(null)
const effects = ref({})

// Modal state
const showEditModal = ref(false)
const isEditMode = ref(false)
const editingEffect = ref({
  id: '',
  name: '',
  alignment: 'neutral',
  note: ''
})
const originalId = ref('')

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

function goBack() {
  router.push('/')
}

function scrollToEffect(id) {
  const element = document.getElementById(`effect-${id}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Briefly highlight the element
    element.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.5)'
    setTimeout(() => {
      element.style.boxShadow = ''
    }, 1000)
  }
}

function getAlignmentLabel(alignment) {
  const labels = {
    positive: '正面',
    neutral: '中性',
    negative: '负面'
  }
  return labels[alignment] || alignment
}

function openAddModal() {
  isEditMode.value = false
  editingEffect.value = {
    id: '',
    name: '',
    alignment: 'neutral',
    note: ''
  }
  originalId.value = ''
  showEditModal.value = true
}

function openEditModal(id, effect) {
  isEditMode.value = true
  editingEffect.value = {
    id: id,
    name: effect.name,
    alignment: effect.alignment,
    note: effect.note || ''
  }
  originalId.value = id
  showEditModal.value = true
}

async function handleSaveEffect() {
  const { id, name, alignment, note } = editingEffect.value
  
  if (!id || !name) {
    notification.error('请填写必填项：效果ID和名称')
    return
  }
  
  // Validate ID for new effects
  if (!isEditMode.value) {
    try {
      validateId(id, '效果ID')
    } catch (err) {
      notification.error(err.message)
      return
    }
    
    if (effects.value[id]) {
      notification.error('该效果ID已存在！')
      return
    }
  }
  
  effects.value[id] = {
    name,
    alignment,
    note: note || ''
  }
  
  try {
    await globalAPI.saveEffects({ effects: effects.value })
    notification.success(isEditMode.value ? '效果已更新！' : '效果已添加！')
    showEditModal.value = false
  } catch (err) {
    console.error('Error saving effects:', err)
    notification.error('保存失败: ' + err.message)
  }
}

async function handleDeleteEffect() {
  if (!confirm('确定要删除此效果吗？此操作无法撤销！')) {
    return
  }
  
  const id = originalId.value
  delete effects.value[id]
  
  try {
    await globalAPI.saveEffects({ effects: effects.value })
    notification.success('效果已删除！')
    showEditModal.value = false
  } catch (err) {
    console.error('Error deleting effect:', err)
    notification.error('删除失败: ' + err.message)
  }
}

async function saveEffects() {
  try {
    await globalAPI.saveEffects({ effects: effects.value })
    notification.success('保存成功！')
  } catch (err) {
    console.error('Error saving effects:', err)
    notification.error('保存失败: ' + err.message)
  }
}

onMounted(() => {
  loadEffects()
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

.effects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.effect-card {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

.effect-card:hover {
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
.form-group select,
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
.form-group select:focus,
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
  
  .effects-list {
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

.effect-details {
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
