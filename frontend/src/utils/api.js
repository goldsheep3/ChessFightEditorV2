// API utilities for making requests to the backend

export async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`)
    }
    
    return data
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

// Set management APIs
export const setAPI = {
  list: () => apiRequest('/api/set/list'),
  
  get: (setCode) => apiRequest(`/api/set/${setCode}`),
  
  save: (setCode, data) => apiRequest(`/api/set/${setCode}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  delete: (setCode) => apiRequest(`/api/set/${setCode}`, {
    method: 'DELETE'
  }),
  
  upload: async (setCode, fieldName, file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`/api/set/upload/${setCode}/${fieldName}`, {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed')
    }
    
    return data
  }
}

// Global library APIs
export const globalAPI = {
  getEffects: () => apiRequest('/api/global/effects'),
  
  saveEffects: (data) => apiRequest('/api/global/effects', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  getFixedTerms: () => apiRequest('/api/global/fixed-terms'),
  
  saveFixedTerms: (data) => apiRequest('/api/global/fixed-terms', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// Gallery image APIs
export const galleryAPI = {
  getAllImages: () => apiRequest('/api/global/images/all'),
  
  uploadImage: async (folder, file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`/api/global/images/upload/${folder}`, {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed')
    }
    
    return data
  }
}
