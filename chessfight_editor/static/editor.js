let setData = null;

// Load set data
async function loadSet() {
    try {
        const response = await fetch(`/api/set/${SET_CODE}`);
        const data = await response.json();
        
        if (data.error) {
            showError(data.error);
            return;
        }
        
        setData = data;
        populateEditor();
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('editor-content').style.display = 'block';
    } catch (error) {
        console.error('Error loading set:', error);
        showError('加载套组失败');
    }
}

function populateEditor() {
    document.getElementById('set_code').value = setData.set_code || '';
    document.getElementById('name').value = setData.name || '';
    document.getElementById('description').value = setData.description || '';
    document.getElementById('notes').value = setData.notes || '';
    
    renderForms();
    renderEffects();
    renderFixedTerms();
}

function renderForms() {
    const container = document.getElementById('forms-editor');
    if (!setData.forms || setData.forms.length === 0) {
        container.innerHTML = '<p>暂无形态</p>';
        return;
    }
    
    container.innerHTML = setData.forms.map((form, index) => `
        <div class="form-item">
            <div class="item-header">
                <h4>形态: ${form.name} (${form.id})</h4>
                ${form.id !== 'default' ? `<button class="delete-btn" onclick="deleteForm(${index})">删除</button>` : ''}
            </div>
            <p>阶段数: ${form.stages.length}</p>
        </div>
    `).join('');
}

function renderEffects() {
    const container = document.getElementById('effects-editor');
    const effects = setData.effects || {};
    
    if (Object.keys(effects).length === 0) {
        container.innerHTML = '<p>暂无局部效果</p>';
        return;
    }
    
    container.innerHTML = Object.entries(effects).map(([id, effect]) => `
        <div class="effect-item">
            <div class="item-header">
                <h4>${effect.name} (${id})</h4>
                <button class="delete-btn" onclick="deleteEffect('${id}')">删除</button>
            </div>
            <p>性质: ${effect.alignment}</p>
            <p>备注: ${effect.note || '无'}</p>
        </div>
    `).join('');
}

function renderFixedTerms() {
    const container = document.getElementById('fixed-terms-editor');
    const terms = setData.fixed_terms || {};
    
    if (Object.keys(terms).length === 0) {
        container.innerHTML = '<p>暂无局部固词</p>';
        return;
    }
    
    container.innerHTML = Object.entries(terms).map(([id, term]) => `
        <div class="term-item">
            <div class="item-header">
                <h4>${term.name} (${id})</h4>
                <button class="delete-btn" onclick="deleteFixedTerm('${id}')">删除</button>
            </div>
            <p>备注: ${term.note || '无'}</p>
        </div>
    `).join('');
}

function addForm() {
    const formId = prompt('请输入形态ID (小写字母、数字、下划线):');
    if (!formId) return;
    
    if (!/^[a-z0-9][a-z0-9\-_]*$/.test(formId)) {
        alert('ID格式无效！');
        return;
    }
    
    const formName = prompt('请输入形态名称:');
    if (!formName) return;
    
    if (!setData.forms) setData.forms = [];
    
    setData.forms.push({
        id: formId,
        name: formName,
        stages: [
            {
                stage: 2,
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
            },
            {
                stage: 3,
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
    });
    
    renderForms();
}

function deleteForm(index) {
    if (!confirm('确定要删除此形态吗？')) return;
    setData.forms.splice(index, 1);
    renderForms();
}

function addEffect() {
    const effectId = prompt('请输入效果ID (小写字母、数字、下划线):');
    if (!effectId) return;
    
    if (!/^[a-z0-9][a-z0-9\-_]*$/.test(effectId)) {
        alert('ID格式无效！');
        return;
    }
    
    const effectName = prompt('请输入效果名称:');
    if (!effectName) return;
    
    const alignment = prompt('请输入性质 (positive/neutral/negative):');
    if (!['positive', 'neutral', 'negative'].includes(alignment)) {
        alert('性质必须是 positive、neutral 或 negative');
        return;
    }
    
    if (!setData.effects) setData.effects = {};
    
    setData.effects[effectId] = {
        name: effectName,
        alignment: alignment,
        note: ""
    };
    
    renderEffects();
}

function deleteEffect(id) {
    if (!confirm('确定要删除此效果吗？')) return;
    delete setData.effects[id];
    renderEffects();
}

function addFixedTerm() {
    const termId = prompt('请输入固词ID (小写字母、数字、下划线):');
    if (!termId) return;
    
    if (!/^[a-z0-9][a-z0-9\-_]*$/.test(termId)) {
        alert('ID格式无效！');
        return;
    }
    
    const termName = prompt('请输入固词名称:');
    if (!termName) return;
    
    if (!setData.fixed_terms) setData.fixed_terms = {};
    
    setData.fixed_terms[termId] = {
        name: termName,
        note: ""
    };
    
    renderFixedTerms();
}

function deleteFixedTerm(id) {
    if (!confirm('确定要删除此固词吗？')) return;
    delete setData.fixed_terms[id];
    renderFixedTerms();
}

async function saveSet() {
    // Update basic info from form
    setData.name = document.getElementById('name').value;
    setData.description = document.getElementById('description').value;
    setData.notes = document.getElementById('notes').value;
    
    try {
        const response = await fetch(`/api/set/${SET_CODE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(setData)
        });
        
        const data = await response.json();
        
        if (data.error) {
            showError('保存失败: ' + (data.details ? JSON.stringify(data.details, null, 2) : data.error));
        } else {
            alert('保存成功！');
        }
    } catch (error) {
        console.error('Error saving set:', error);
        showError('保存失败');
    }
}

async function deleteSet() {
    if (!confirm('确定要删除此套组吗？此操作无法撤销！')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/set/${SET_CODE}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.error) {
            showError('删除失败: ' + data.error);
        } else {
            alert('套组已删除');
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error deleting set:', error);
        showError('删除失败');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    document.getElementById('loading').style.display = 'none';
}

// Load set on page load
loadSet();
