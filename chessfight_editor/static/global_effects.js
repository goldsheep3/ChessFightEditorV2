let effectsData = null;

async function loadEffects() {
    try {
        const response = await fetch('/api/global/effects');
        const data = await response.json();
        
        if (data.error) {
            showError(data.error);
            return;
        }
        
        effectsData = data;
        renderEffects();
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('editor-content').style.display = 'block';
    } catch (error) {
        console.error('Error loading effects:', error);
        showError('加载全局效果库失败');
    }
}

function renderEffects() {
    const container = document.getElementById('effects-list');
    const effects = effectsData.effects || {};
    
    if (Object.keys(effects).length === 0) {
        container.innerHTML = '<p>暂无全局效果</p>';
        return;
    }
    
    container.innerHTML = Object.entries(effects).map(([id, effect]) => `
        <div class="effect-item">
            <div class="item-header">
                <h4>${effect.name} (${id})</h4>
                <button class="delete-btn" onclick="deleteEffect('${id}')">删除</button>
            </div>
            <div class="form-group">
                <label>名称:</label>
                <input type="text" value="${effect.name}" onchange="updateEffect('${id}', 'name', this.value)">
            </div>
            <div class="form-group">
                <label>性质:</label>
                <select value="${effect.alignment}" onchange="updateEffect('${id}', 'alignment', this.value)">
                    <option value="positive" ${effect.alignment === 'positive' ? 'selected' : ''}>正面 (positive)</option>
                    <option value="neutral" ${effect.alignment === 'neutral' ? 'selected' : ''}>中性 (neutral)</option>
                    <option value="negative" ${effect.alignment === 'negative' ? 'selected' : ''}>负面 (negative)</option>
                </select>
            </div>
            <div class="form-group">
                <label>备注:</label>
                <textarea rows="2" onchange="updateEffect('${id}', 'note', this.value)">${effect.note || ''}</textarea>
            </div>
        </div>
    `).join('');
}

function updateEffect(id, field, value) {
    if (!effectsData.effects[id]) return;
    effectsData.effects[id][field] = value;
}

function addEffect() {
    const effectId = prompt('请输入效果ID (小写字母、数字、下划线):');
    if (!effectId) return;
    
    try {
        validateId(effectId, '效果ID');
    } catch (error) {
        alert(error.message);
        return;
    }
    
    if (effectsData.effects[effectId]) {
        alert('该ID已存在！');
        return;
    }
    
    const effectName = prompt('请输入效果名称:');
    if (!effectName) return;
    
    const alignment = prompt('请输入性质 (positive/neutral/negative):');
    if (!ALIGNMENT_OPTIONS.includes(alignment)) {
        alert('性质必须是 positive、neutral 或 negative');
        return;
    }
    
    if (!effectsData.effects) effectsData.effects = {};
    
    effectsData.effects[effectId] = {
        name: effectName,
        alignment: alignment,
        note: ""
    };
    
    renderEffects();
}

function deleteEffect(id) {
    if (!confirm('确定要删除此效果吗？')) return;
    delete effectsData.effects[id];
    renderEffects();
}

async function saveEffects() {
    try {
        const response = await fetch('/api/global/effects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(effectsData)
        });
        
        const data = await response.json();
        
        if (data.error) {
            showError('保存失败: ' + (data.details ? JSON.stringify(data.details, null, 2) : data.error));
        } else {
            alert('保存成功！');
        }
    } catch (error) {
        console.error('Error saving effects:', error);
        showError('保存失败');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    document.getElementById('loading').style.display = 'none';
}

loadEffects();
