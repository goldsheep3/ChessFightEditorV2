<template>
  <div class="editor-layout">
    <!-- Top Bar -->
    <div class="top-bar">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1 class="page-title">图片管理器</h1>
      <button class="save-btn primary" @click="openUploadModal">➕ 上传图片</button>
    </div>

    <div v-if="loading" class="loading-overlay">加载中...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error" class="main-content">
      <!-- Left Panel: Navigation -->
      <div class="left-panel">
        <div class="nav-section">
          <h3>🗂️ 库管理</h3>
          <div class="nav-item" @click="$router.push('/global/effects')">
            <span class="nav-icon">✨</span>
            <span>全局效果库</span>
          </div>
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

      <!-- Center Panel: Images Gallery -->
      <div class="center-panel">
        <div class="content-header">
          <h2>🖼️ 图片列表</h2>
        </div>

        <div v-if="images.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>暂无图片</p>
        </div>

        <div class="image-grid">
          <div v-for="(img, index) in images" :key="index" class="image-item">
            <img :src="img.url" :alt="img.name" @click="copyImagePath(img.url)">
            <div class="image-name" :title="img.name">{{ img.name }}</div>
            <div class="image-path" :title="img.url">{{ img.url }}</div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Info -->
      <div class="right-panel">
        <div class="info-section">
          <h3>📊 统计信息</h3>
          <div class="stat-card">
            <div class="stat-value">{{ images.length }}</div>
            <div class="stat-label">图片总数</div>
          </div>
        </div>

        <div class="help-section">
          <h3>💡 说明</h3>
          <div class="help-content">
            <p><strong>图片管理器</strong>用于管理所有图片资源。</p>
            <p>点击图片可复制其路径。</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Upload Modal -->
    <ModalDialog 
      v-model="showUploadModal" 
      title="🖼️ 上传图片"
      size="medium"
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
        <div class="file-input-wrapper">
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            @change="handleFileSelect" 
            ref="fileInput"
            id="fileInput"
            class="file-input-hidden"
          >
          <label for="fileInput" class="file-input-label">
            <span class="file-input-icon">📁</span>
            <span class="file-input-text">{{ selectedFiles.length > 0 ? `已选择 ${selectedFiles.length} 个文件` : '点击选择文件' }}</span>
          </label>
        </div>
      </div>
      <div v-if="selectedFiles.length > 0" class="selected-files">
        <div class="selected-files-header">
          <span class="selected-files-icon">📝</span>
          <strong>文件重命名</strong>
        </div>
        <div class="file-rename-list">
          <div v-for="(item, i) in fileList" :key="i" class="file-rename-item" :class="{ 'has-error': item.error }">
            <span class="file-index">{{ i + 1 }}</span>
            <div class="file-rename-input-group">
              <input 
                v-model="item.newName" 
                type="text" 
                class="file-rename-input"
                :placeholder="item.originalName"
                @input="validateFileName(i)"
              >
              <span class="file-extension">.{{ item.extension }}</span>
            </div>
            <span v-if="item.error" class="file-error">
              <span class="error-icon">⚠️</span>
              {{ item.error }}
            </span>
          </div>
        </div>
        <div class="form-hint-box">
          <span class="hint-icon">💡</span>
          <small class="form-hint">可以修改文件名，仅支持字母、数字、下划线和连字符</small>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-secondary btn-enhanced" @click="showUploadModal = false">
          <span class="btn-icon">✕</span>
          取消
        </button>
        <button 
          class="btn btn-primary btn-enhanced btn-upload" 
          @click="uploadImages" 
          :disabled="selectedFiles.length === 0"
        >
          <span class="btn-icon">⬆️</span>
          上传{{ selectedFiles.length > 0 ? ` (${selectedFiles.length}个文件)` : '' }}
        </button>
      </template>
    </ModalDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { galleryAPI } from '@/utils/api'
import { useNotification } from '@/utils/notification'
import ModalDialog from '@/components/ModalDialog.vue'

const router = useRouter()
const notification = useNotification()
const loading = ref(true)
const error = ref(null)
const images = ref([])
const showUploadModal = ref(false)
const imageFolder = ref('')
const selectedFiles = ref([])
const fileList = ref([])
const fileInput = ref(null)

async function loadAllImages() {
  loading.value = true
  images.value = []
  
  try {
    const data = await galleryAPI.getAllImages()
    images.value = data.images || []
    loading.value = false
  } catch (err) {
    console.error('Error loading images:', err)
    error.value = '加载图片列表失败'
    loading.value = false
  }
}

function goBack() {
  router.push('/')
}

function openUploadModal() {
  showUploadModal.value = true
}

function handleFileSelect(event) {
  selectedFiles.value = Array.from(event.target.files)
  
  // Create file list with rename capabilities
  fileList.value = selectedFiles.value.map(file => {
    const lastDotIndex = file.name.lastIndexOf('.')
    const nameWithoutExt = lastDotIndex > 0 ? file.name.substring(0, lastDotIndex) : file.name
    const extension = lastDotIndex > 0 ? file.name.substring(lastDotIndex + 1) : ''
    
    return {
      originalName: file.name,
      newName: nameWithoutExt,
      extension: extension,
      file: file,
      error: null
    }
  })
}

function validateFileName(index) {
  const item = fileList.value[index]
  const fileName = item.newName.trim()
  
  if (!fileName) {
    item.error = '文件名不能为空'
    return false
  }
  
  if (!/^[0-9a-zA-Z_-]+$/.test(fileName)) {
    item.error = '仅支持字母、数字、下划线和连字符'
    return false
  }
  
  item.error = null
  return true
}

async function uploadImages() {
  if (selectedFiles.value.length === 0) {
    notification.error('请先选择要上传的文件')
    return
  }
  
  // Validate all file names
  let hasError = false
  for (let i = 0; i < fileList.value.length; i++) {
    if (!validateFileName(i)) {
      hasError = true
    }
  }
  
  if (hasError) {
    notification.error('请修正文件名错误')
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
  
  for (const item of fileList.value) {
    try {
      // Create a new File object with the renamed filename
      const renamedFile = new File(
        [item.file], 
        `${item.newName}.${item.extension}`,
        { type: item.file.type }
      )
      await galleryAPI.uploadImage(folder, renamedFile)
      successCount++
    } catch (error) {
      console.error(`Failed to upload ${item.newName}.${item.extension}:`, error)
      failCount++
    }
  }
  
  notification.success(`上传完成！成功: ${successCount}，失败: ${failCount}`)
  
  // Clear selection
  selectedFiles.value = []
  fileList.value = []
  imageFolder.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  
  showUploadModal.value = false
  
  // Reload images
  loadAllImages()
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
  loadAllImages()
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
}

.page-title {
  flex: 1;
  text-align: center;
  margin: 0;
  font-size: 20px;
}

.loading-overlay,
.error-message {
  padding: 40px;
  text-align: center;
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
  padding: 20px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
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

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
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
  line-height: 1.6;
  color: #666;
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

.form-group input[type="text"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-group input[type="text"]:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Custom file input */
.file-input-wrapper {
  position: relative;
}

.file-input-hidden {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.file-input-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
}

.file-input-label:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.file-input-label:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.file-input-icon {
  font-size: 20px;
}

.file-input-text {
  font-size: 14px;
}

.form-hint {
  display: block;
  margin-top: 5px;
  color: #999;
  font-size: 12px;
  font-style: italic;
}

.form-hint-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  background: #fff3cd;
  border-left: 3px solid #ffc107;
  border-radius: 4px;
}

.hint-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.selected-files {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 10px;
  border: 1px solid #e0e6ed;
}

.selected-files-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
  font-size: 15px;
  color: #333;
}

.selected-files-icon {
  font-size: 18px;
}

.file-rename-list {
  margin-top: 15px;
}

.file-rename-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 10px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.file-rename-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.file-rename-item.has-error {
  border: 1px solid #e74c3c;
  background: #fff5f5;
}

.file-index {
  color: #667eea;
  font-size: 13px;
  font-weight: 600;
  min-width: 25px;
  padding-top: 10px;
}

.file-rename-input-group {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 4px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 6px;
  padding: 2px;
  transition: all 0.3s ease;
}

.file-rename-input-group:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.file-rename-item.has-error .file-rename-input-group {
  border-color: #e74c3c;
}

.file-rename-input {
  flex: 1;
  padding: 8px 12px;
  border: none;
  font-size: 14px;
  font-family: inherit;
  background: transparent;
}

.file-rename-input:focus {
  outline: none;
}

.file-extension {
  color: #667eea;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
  background: #f0f3ff;
  border-radius: 4px;
}

.file-error {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e74c3c;
  font-size: 12px;
  padding-top: 10px;
  flex-shrink: 0;
}

.error-icon {
  font-size: 14px;
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

/* Enhanced button styles */
.btn-enhanced {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-enhanced:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-enhanced:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 16px;
}

.btn-upload {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-upload:hover:not(:disabled) {
  background: linear-gradient(135deg, #5568d3 0%, #66378e 100%);
}

.btn-upload:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
</style>
