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
        </div>
      </div>

      <!-- Center Panel: Main Content -->
      <div class="center-panel">
        <div class="content-section">
          <div class="section-header">
            <h2>📦 套组管理</h2>
            <button class="primary-btn" @click="createNewSet">➕ 创建新套组</button>
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
          <button class="action-btn" @click="$router.push('/global/effects')">
            <span class="action-icon">✨</span>
            <span>编辑全局效果库</span>
          </button>
          <button class="action-btn" @click="$router.push('/global/fixed-terms')">
            <span class="action-icon">📌</span>
            <span>编辑全局固词库</span>
          </button>
          <button class="action-btn" @click="showImageGallery = true">
            <span class="action-icon">🖼️</span>
            <span>图片资源管理</span>
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
    
    <!-- Image Gallery Modal -->
    <div v-if="showImageGallery" class="modal-overlay" @click="showImageGallery = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>🖼️ 图片资源管理</h2>
          <button class="close-btn" @click="showImageGallery = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="upload-section">
            <h3>上传新图片</h3>
            <div class="upload-form">
              <div class="form-group">
                <label>选择套组:</label>
                <select v-model="selectedSetForUpload">
                  <option value="global">全局图片</option>
                  <option v-for="set in sets" :key="set.set_code" :value="set.set_code">
                    {{ set.name }} ({{ set.set_code }})
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>选择图片文件:</label>
                <input type="file" accept="image/*" multiple @change="handleFileSelect" ref="fileInput">
              </div>
              <button class="primary-btn" @click="uploadImages" :disabled="!selectedFiles.length">
                ⬆️ 上传 {{ selectedFiles.length > 0 ? `(${selectedFiles.length}个文件)` : '' }}
              </button>
            </div>
          </div>
          
          <div class="gallery-section">
            <h3>已上传的图片</h3>
            <div class="set-selector">
              <button 
                v-for="set in ['global', ...sets.map(s => s.set_code)]" 
                :key="set"
                :class="['set-tab', { active: selectedSetForView === set }]"
                @click="selectedSetForView = set; loadImages(set)"
              >
                {{ set === 'global' ? '全局' : sets.find(s => s.set_code === set)?.name || set }}
              </button>
            </div>
            <div class="image-grid">
              <div v-if="loadingImages" class="loading-text">加载中...</div>
              <div v-else-if="images.length === 0" class="empty-text">该目录下暂无图片</div>
              <div v-for="(img, index) in images" :key="index" class="image-item">
                <img :src="img.url" :alt="img.name" @click="copyImagePath(img.url)">
                <div class="image-name" :title="img.name">{{ img.name }}</div>
                <div class="image-path" :title="img.url">{{ img.url }}</div>
              </div>
            </div>
          </div>
        </div>
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
const showImageGallery = ref(false)
const selectedSetForUpload = ref('global')
const selectedSetForView = ref('global')
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

// Image gallery functions
function handleFileSelect(event) {
  selectedFiles.value = Array.from(event.target.files)
}

async function uploadImages() {
  if (selectedFiles.value.length === 0) {
    alert('请先选择要上传的文件')
    return
  }
  
  const setCode = selectedSetForUpload.value
  let successCount = 0
  let failCount = 0
  
  for (const file of selectedFiles.value) {
    try {
      // Use a generic field name for gallery uploads
      await setAPI.upload(setCode, 'gallery', file)
      successCount++
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
      failCount++
    }
  }
  
  alert(`上传完成！成功: ${successCount}，失败: ${failCount}`)
  
  // Clear selection and reload images
  selectedFiles.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  
  // Reload images for current set
  if (selectedSetForView.value === setCode) {
    loadImages(setCode)
  }
}

async function loadImages(setCode) {
  loadingImages.value = true
  images.value = []
  
  try {
    const response = await fetch(`/api/set/images/${setCode}`)
    if (!response.ok) {
      throw new Error('Failed to load images')
    }
    const data = await response.json()
    images.value = data.images || []
  } catch (error) {
    console.error('Error loading images:', error)
    alert('加载图片列表失败: ' + error.message)
  } finally {
    loadingImages.value = false
  }
}

function copyImagePath(url) {
  navigator.clipboard.writeText(url).then(() => {
    alert(`已复制图片路径: ${url}`)
  }).catch(err => {
    console.error('Failed to copy:', err)
    alert('复制失败，请手动复制')
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
</style>
