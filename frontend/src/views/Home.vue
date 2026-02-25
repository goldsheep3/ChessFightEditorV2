<template>
  <div class="home-layout">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="logo">🎮</div>
      <h1 class="page-title">ChessFight 套组编辑器 V2</h1>
      <div class="spacer"></div>
    </div>

    <div class="main-content">
      <!-- Left Panel: Navigation -->
      <div class="left-panel">
        <div class="nav-section">
          <h3>🏠 主菜单</h3>
          <div class="nav-item active">
            <span class="nav-icon">📦</span>
            <span>套组管理</span>
          </div>
          <div class="nav-item" @click="$router.push('/global/effects')">
            <span class="nav-icon">✨</span>
            <span>全局效果库</span>
          </div>
          <div class="nav-item" @click="$router.push('/global/fixed-terms')">
            <span class="nav-icon">📌</span>
            <span>全局固词库</span>
          </div>
          <div class="nav-item" @click="$router.push('/images')">
            <span class="nav-icon">🖼️</span>
            <span>图片管理器</span>
          </div>
        </div>
      </div>

      <!-- Center Panel: Main Content -->
      <div class="center-panel">
        <div class="content-section">
          <div class="section-header">
            <h2>📦 套组管理</h2>
            <button class="primary-btn" @click="showCreateSetModal = true">➕ 创建新套组</button>
          </div>

          <div v-if="sets.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <p>暂无套组，请创建一个新套组</p>
          </div>

          <div class="sets-grid">
            <div v-for="set in sets" :key="set.set_code" class="set-card">
              <div class="set-card-header">
                <h3>{{ set.name }}</h3>
                <span class="set-code-badge">{{ set.set_code }}</span>
              </div>
              <div class="set-card-content">
                <p class="set-description">{{ set.description || '无描述' }}</p>
              </div>
              <div class="set-card-actions">
                <button class="edit-btn" @click="$router.push(`/editor/${set.set_code}`)">
                  ✏️ 编辑
                </button>
                <button class="delete-btn" @click="deleteSet(set.set_code)">
                  🗑️ 删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Info & Stats -->
      <div class="right-panel">
        <div class="info-section">
          <h3>📊 统计信息</h3>
          <div class="stat-card">
            <div class="stat-value">{{ sets.length }}</div>
            <div class="stat-label">套组总数</div>
          </div>
        </div>

        <div class="quick-actions">
          <h3>⚡ 快速操作</h3>
          <button class="action-btn" @click="showCreateSetModal = true">
            <span class="action-icon">➕</span>
            <span>快捷创建套组</span>
          </button>
          <button class="action-btn" @click="showAddEffectModal = true">
            <span class="action-icon">✨</span>
            <span>添加全局效果</span>
          </button>
          <button class="action-btn" @click="showAddTermModal = true">
            <span class="action-icon">📌</span>
            <span>添加全局固词</span>
          </button>
          <button class="action-btn" @click="showImageUploadModal = true">
            <span class="action-icon">🖼️</span>
            <span>上传图片</span>
          </button>
        </div>

        <div class="help-section">
          <h3>💡 帮助</h3>
          <div class="help-content">
            <p><strong>快速开始：</strong></p>
            <ol>
              <li>点击"创建新套组"</li>
              <li>输入套组代码</li>
              <li>开始编辑卡片</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create Set Modal -->
    <ModalDialog 
      v-model="showCreateSetModal" 
      title="➕ 创建新套组"
      size="medium"
      :show-footer="true"
      :show-confirm="true"
      :show-cancel="true"
      @confirm="handleCreateSet"
    >
      <div class="form-group">
        <label>套组代码 <span class="required">*</span></label>
        <input 
          v-model="newSet.setCode" 
          type="text" 
          placeholder="英文、数字、下划线"
          @keyup.enter="handleCreateSet"
        >
        <small class="form-hint">用于标识套组的唯一代码</small>
      </div>
      <div class="form-group">
        <label>套组名称 <span class="required">*</span></label>
        <input 
          v-model="newSet.name" 
          type="text" 
          placeholder="套组显示名称"
          @keyup.enter="handleCreateSet"
        >
      </div>
      <div class="form-group">
        <label>描述</label>
        <textarea 
          v-model="newSet.description" 
          rows="3" 
          placeholder="套组的简要描述（可选）"
        ></textarea>
      </div>
      <div class="form-group">
        <label>备注</label>
        <textarea 
          v-model="newSet.notes" 
          rows="2" 
          placeholder="开发备注（可选）"
        ></textarea>
      </div>
    </ModalDialog>

    <!-- Add Global Effect Modal -->
    <ModalDialog 
      v-model="showAddEffectModal" 
      title="✨ 添加全局效果"
      size="medium"
      :show-footer="true"
      :show-confirm="true"
      :show-cancel="true"
      @confirm="handleAddEffect"
    >
      <div class="form-group">
        <label>效果ID <span class="required">*</span></label>
        <input 
          v-model="newEffect.id" 
          type="text" 
          placeholder="小写字母、数字、下划线"
          @keyup.enter="handleAddEffect"
        >
      </div>
      <div class="form-group">
        <label>名称 <span class="required">*</span></label>
        <input 
          v-model="newEffect.name" 
          type="text" 
          placeholder="效果名称"
          @keyup.enter="handleAddEffect"
        >
      </div>
      <div class="form-group">
        <label>性质</label>
        <select v-model="newEffect.alignment">
          <option value="positive">正面 (positive)</option>
          <option value="neutral">中性 (neutral)</option>
          <option value="negative">负面 (negative)</option>
        </select>
      </div>
      <div class="form-group">
        <label>备注</label>
        <textarea 
          v-model="newEffect.note" 
          rows="2" 
          placeholder="效果备注（可选）"
        ></textarea>
      </div>
    </ModalDialog>

    <!-- Add Global Fixed Term Modal -->
    <ModalDialog 
      v-model="showAddTermModal" 
      title="📌 添加全局固词"
      size="medium"
      :show-footer="true"
      :show-confirm="true"
      :show-cancel="true"
      @confirm="handleAddTerm"
    >
      <div class="form-group">
        <label>固词ID <span class="required">*</span></label>
        <input 
          v-model="newTerm.id" 
          type="text" 
          placeholder="小写字母、数字、下划线"
          @keyup.enter="handleAddTerm"
        >
      </div>
      <div class="form-group">
        <label>名称 <span class="required">*</span></label>
        <input 
          v-model="newTerm.name" 
          type="text" 
          placeholder="固词名称"
          @keyup.enter="handleAddTerm"
        >
      </div>
      <div class="form-group">
        <label>备注</label>
        <textarea 
          v-model="newTerm.note" 
          rows="2" 
          placeholder="固词备注（可选）"
        ></textarea>
      </div>
    </ModalDialog>

    <!-- Image Upload Modal -->
    <ModalDialog 
      v-model="showImageUploadModal" 
      title="🖼️ 上传图片"
      size="large"
    >
      <div class="form-group">
        <label>归档文件夹</label>
        <input 
          v-model="imageFolder" 
          type="text" 
          placeholder="输入文件夹名（0-9a-z-_），留空则存于根目录"
          pattern="[0-9a-z_-]*"
        >
        <small class="form-hint">仅支持小写字母、数字、下划线和连字符</small>
      </div>
      <div class="form-group">
        <label>选择图片文件</label>
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          @change="handleFileSelect" 
          ref="fileInput"
        >
      </div>
      <div v-if="selectedFiles.length > 0" class="selected-files">
        <p><strong>已选择 {{ selectedFiles.length }} 个文件：</strong></p>
        <ul>
          <li v-for="(file, i) in selectedFiles" :key="i">{{ file.name }}</li>
        </ul>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="showImageUploadModal = false">取消</button>
        <button 
          class="btn btn-primary" 
          @click="uploadImages" 
          :disabled="selectedFiles.length === 0"
        >
          ⬆️ 上传 {{ selectedFiles.length > 0 ? `(${selectedFiles.length}个文件)` : '' }}
        </button>
      </template>
    </ModalDialog>

    <!-- Image Gallery Modal (View Only) -->
    <ModalDialog 
      v-model="showImageGallery" 
      title="🖼️ 图片库"
      size="full"
    >
      <div class="gallery-actions">
        <button class="primary-btn" @click="openImageUpload">➕ 上传图片</button>
      </div>
      
      <div class="image-grid">
        <div v-if="loadingImages" class="loading-text">加载中...</div>
        <div v-else-if="images.length === 0" class="empty-text">暂无图片</div>
        <div v-for="(img, index) in images" :key="index" class="image-item">
          <img :src="img.url" :alt="img.name" @click="copyImagePath(img.url)">
          <div class="image-name" :title="img.name">{{ img.name }}</div>
          <div class="image-path" :title="img.url">{{ img.url }}</div>
        </div>
      </div>
    </ModalDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { setAPI, globalAPI } from '@/utils/api'
import { validateSetCode, validateId } from '@/utils/validation'
import { useNotification } from '@/utils/notification'
import ModalDialog from '@/components/ModalDialog.vue'

const router = useRouter()
const notification = useNotification()
const sets = ref([])

// Modal states
const showCreateSetModal = ref(false)
const showAddEffectModal = ref(false)
const showAddTermModal = ref(false)
const showImageUploadModal = ref(false)
const showImageGallery = ref(false)

// Form data
const newSet = ref({
  setCode: '',
  name: '',
  description: '',
  notes: ''
})

const newEffect = ref({
  id: '',
  name: '',
  alignment: 'neutral',
  note: ''
})

const newTerm = ref({
  id: '',
  name: '',
  note: ''
})

// Image upload
const imageFolder = ref('')
const selectedFiles = ref([])
const fileInput = ref(null)
const images = ref([])
const loadingImages = ref(false)

async function loadSets() {
  try {
    const data = await setAPI.list()
    sets.value = data.sets
  } catch (error) {
    console.error('Error loading sets:', error)
    notification.error('加载套组列表失败')
  }
}

function resetNewSetForm() {
  newSet.value = {
    setCode: '',
    name: '',
    description: '',
    notes: ''
  }
}

async function handleCreateSet() {
  const { setCode, name, description, notes } = newSet.value
  
  if (!setCode || !name) {
    notification.error('请填写必填项：套组代码和名称')
    return
  }
  
  // Validate set code
  try {
    validateSetCode(setCode)
  } catch (error) {
    notification.error(error.message)
    return
  }
  
  // Create a minimal valid set
  const newSetData = {
    schema_version: 2,
    name: name,
    set_code: setCode,
    description: description || '',
    notes: notes || '',
    archetypes: [],
    designers: [],
    effects: {},
    fixed_terms: {},
    forms: [
      {
        id: "default",
        name: "默认形态",
        rarity: "R",
        stages: [
          {
            stage: 1,
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
      }
    ],
    summons: [],
    buildings: [],
    attacks: [],
    strategies: []
  }
  
  try {
    await setAPI.save(setCode, newSetData)
    notification.success('套组创建成功！')
    showCreateSetModal.value = false
    resetNewSetForm()
    router.push(`/editor/${setCode}`)
  } catch (error) {
    notification.error('创建失败: ' + (error.message || '未知错误'))
  }
}

async function deleteSet(setCode) {
  // Use a custom confirm modal would be better, but for now use the browser confirm
  if (!confirm(`确定要删除套组 ${setCode} 吗？此操作无法撤销！`)) {
    return
  }
  
  try {
    await setAPI.delete(setCode)
    notification.success('套组已删除')
    loadSets()
  } catch (error) {
    console.error('Error deleting set:', error)
    notification.error('删除套组失败: ' + error.message)
  }
}

// Global Effect functions
function resetNewEffectForm() {
  newEffect.value = {
    id: '',
    name: '',
    alignment: 'neutral',
    note: ''
  }
}

async function handleAddEffect() {
  const { id, name, alignment, note } = newEffect.value
  
  if (!id || !name) {
    notification.error('请填写必填项：效果ID和名称')
    return
  }
  
  try {
    validateId(id, '效果ID')
  } catch (error) {
    notification.error(error.message)
    return
  }
  
  try {
    const data = await globalAPI.getEffects()
    const effects = data.effects || {}
    
    if (effects[id]) {
      notification.error('该效果ID已存在！')
      return
    }
    
    effects[id] = {
      name,
      alignment,
      note: note || ''
    }
    
    await globalAPI.saveEffects({ effects })
    notification.success('全局效果添加成功！')
    showAddEffectModal.value = false
    resetNewEffectForm()
  } catch (error) {
    notification.error('添加失败: ' + (error.message || '未知错误'))
  }
}

// Global Fixed Term functions
function resetNewTermForm() {
  newTerm.value = {
    id: '',
    name: '',
    note: ''
  }
}

async function handleAddTerm() {
  const { id, name, note } = newTerm.value
  
  if (!id || !name) {
    notification.error('请填写必填项：固词ID和名称')
    return
  }
  
  try {
    validateId(id, '固词ID')
  } catch (error) {
    notification.error(error.message)
    return
  }
  
  try {
    const data = await globalAPI.getFixedTerms()
    const fixed_terms = data.fixed_terms || {}
    
    if (fixed_terms[id]) {
      notification.error('该固词ID已存在！')
      return
    }
    
    fixed_terms[id] = {
      name,
      note: note || ''
    }
    
    await globalAPI.saveFixedTerms({ fixed_terms })
    notification.success('全局固词添加成功！')
    showAddTermModal.value = false
    resetNewTermForm()
  } catch (error) {
    notification.error('添加失败: ' + (error.message || '未知错误'))
  }
}

// Image functions
function handleFileSelect(event) {
  selectedFiles.value = Array.from(event.target.files)
}

function openImageUpload() {
  showImageGallery.value = false
  showImageUploadModal.value = true
}

async function uploadImages() {
  if (selectedFiles.value.length === 0) {
    notification.error('请先选择要上传的文件')
    return
  }
  
  // Validate folder name if provided
  if (imageFolder.value && !/^[0-9a-z_-]*$/.test(imageFolder.value)) {
    notification.error('文件夹名只能包含小写字母、数字、下划线和连字符')
    return
  }
  
  const folder = imageFolder.value || 'root'
  let successCount = 0
  let failCount = 0
  
  for (const file of selectedFiles.value) {
    try {
      // Upload to folder-based structure instead of set-based
      await setAPI.upload(folder, 'gallery', file)
      successCount++
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
      failCount++
    }
  }
  
  notification.success(`上传完成！成功: ${successCount}，失败: ${failCount}`)
  
  // Clear selection
  selectedFiles.value = []
  imageFolder.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  
  showImageUploadModal.value = false
  
  // Load all images
  loadAllImages()
}

async function loadAllImages() {
  loadingImages.value = true
  images.value = []
  
  try {
    const response = await fetch(`/api/images/all`)
    if (!response.ok) {
      throw new Error('Failed to load images')
    }
    const data = await response.json()
    images.value = data.images || []
  } catch (error) {
    console.error('Error loading images:', error)
    notification.error('加载图片列表失败: ' + error.message)
  } finally {
    loadingImages.value = false
  }
}

function copyImagePath(url) {
  navigator.clipboard.writeText(url).then(() => {
    notification.success(`已复制图片路径: ${url}`)
  }).catch(err => {
    console.error('Failed to copy:', err)
    notification.error('复制失败，请手动复制')
  })
}

onMounted(() => {
  loadSets()
})
</script>

<style scoped>
.home-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

/* Top Bar */
.top-bar {
  display: flex;
  align-items: center;
  padding: 15px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.logo {
  font-size: 28px;
  margin-right: 15px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.spacer {
  flex-grow: 1;
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

/* Center Panel */
.center-panel {
  background: white;
  padding: 30px;
  overflow-y: auto;
}

.content-section {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 24px;
}

.primary-btn {
  padding: 12px 24px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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

.empty-state p {
  font-size: 18px;
  font-style: italic;
}

.sets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.set-card {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.set-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.set-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.set-card-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.set-code-badge {
  background: #667eea;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.set-card-content {
  margin-bottom: 20px;
}

.set-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  min-height: 40px;
}

.set-card-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.edit-btn {
  background: #667eea;
  color: white;
}

.edit-btn:hover {
  background: #5568d3;
}

.delete-btn {
  background: #e74c3c;
  color: white;
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

.info-section,
.quick-actions,
.help-section {
  margin-bottom: 30px;
}

.info-section h3,
.quick-actions h3,
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

.action-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 10px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #667eea;
  transform: translateX(5px);
}

.action-icon {
  margin-right: 10px;
  font-size: 18px;
}

.help-content {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #666;
}

.help-content ol {
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

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 90%;
  max-height: 90%;
  width: 1000px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 22px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
}

.upload-section {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
}

.upload-section h3,
.gallery-section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 18px;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.upload-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-form label {
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.upload-form select,
.upload-form input[type="file"] {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.set-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.set-tab {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.set-tab:hover {
  border-color: #667eea;
  background: #f5f5f5;
}

.set-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  min-height: 200px;
}

.loading-text,
.empty-text {
  grid-column: 1 / -1;
  text-align: center;
  color: #999;
  padding: 40px;
  font-style: italic;
}

.image-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}

.image-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.image-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.image-name {
  padding: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-path {
  padding: 0 8px 8px;
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Form styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #555;
  font-size: 14px;
  margin-bottom: 8px;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input[type="file"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-hint {
  display: block;
  margin-top: 5px;
  color: #999;
  font-size: 12px;
  font-style: italic;
}

.required {
  color: #e74c3c;
}

.selected-files {
  margin-top: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
}

.selected-files ul {
  margin: 10px 0 0 20px;
  padding: 0;
}

.selected-files li {
  margin-bottom: 5px;
  color: #666;
  font-size: 13px;
}

.gallery-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
