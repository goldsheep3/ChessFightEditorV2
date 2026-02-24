let termsData = null;

async function loadTerms() {
    try {
        const response = await fetch('/api/global/fixed-terms');
        const data = await response.json();
        
        if (data.error) {
            showError(data.error);
            return;
        }
        
        termsData = data;
        renderTerms();
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('editor-content').style.display = 'block';
    } catch (error) {
        console.error('Error loading terms:', error);
        showError('加载全局固词库失败');
    }
}

function renderTerms() {
    const container = document.getElementById('terms-list');
    const terms = termsData.fixed_terms || {};
    
    if (Object.keys(terms).length === 0) {
        container.innerHTML = '<p>暂无全局固词</p>';
        return;
    }
    
    container.innerHTML = Object.entries(terms).map(([id, term]) => `
        <div class="term-item">
            <div class="item-header">
                <h4>${term.name} (${id})</h4>
                <button class="delete-btn" onclick="deleteTerm('${id}')">删除</button>
            </div>
            <div class="form-group">
                <label>名称:</label>
                <input type="text" value="${term.name}" onchange="updateTerm('${id}', 'name', this.value)">
            </div>
            <div class="form-group">
                <label>备注:</label>
                <textarea rows="2" onchange="updateTerm('${id}', 'note', this.value)">${term.note || ''}</textarea>
            </div>
        </div>
    `).join('');
}

function updateTerm(id, field, value) {
    if (!termsData.fixed_terms[id]) return;
    termsData.fixed_terms[id][field] = value;
}

function addTerm() {
    const termId = prompt('请输入固词ID (小写字母、数字、下划线):');
    if (!termId) return;
    
    if (!/^[a-z0-9][a-z0-9\-_]*$/.test(termId)) {
        alert('ID格式无效！');
        return;
    }
    
    if (termsData.fixed_terms[termId]) {
        alert('该ID已存在！');
        return;
    }
    
    const termName = prompt('请输入固词名称:');
    if (!termName) return;
    
    if (!termsData.fixed_terms) termsData.fixed_terms = {};
    
    termsData.fixed_terms[termId] = {
        name: termName,
        note: ""
    };
    
    renderTerms();
}

function deleteTerm(id) {
    if (!confirm('确定要删除此固词吗？')) return;
    delete termsData.fixed_terms[id];
    renderTerms();
}

async function saveTerms() {
    try {
        const response = await fetch('/api/global/fixed-terms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(termsData)
        });
        
        const data = await response.json();
        
        if (data.error) {
            showError('保存失败: ' + (data.details ? JSON.stringify(data.details, null, 2) : data.error));
        } else {
            alert('保存成功！');
        }
    } catch (error) {
        console.error('Error saving terms:', error);
        showError('保存失败');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    document.getElementById('loading').style.display = 'none';
}

loadTerms();
