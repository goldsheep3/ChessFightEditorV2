// Load and display list of sets
async function loadSets() {
    try {
        const response = await fetch('/api/set/list');
        const data = await response.json();
        
        const setsList = document.getElementById('sets-list');
        
        if (data.sets.length === 0) {
            setsList.innerHTML = '<p>暂无套组，请创建一个新套组</p>';
            return;
        }
        
        setsList.innerHTML = data.sets.map(set => `
            <div class="set-item">
                <div>
                    <h3>${set.name}</h3>
                    <p>${set.description || '无描述'}</p>
                    <p><strong>代码:</strong> ${set.set_code}</p>
                </div>
                <div class="action-buttons">
                    <a href="/editor/${set.set_code}" class="button">编辑</a>
                    <button class="danger" onclick="deleteSetFromList('${set.set_code}')">删除</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading sets:', error);
        alert('加载套组列表失败');
    }
}

function createNewSet() {
    const setCode = prompt('请输入新套组的代码 (英文、数字、下划线):');
    
    if (!setCode) return;
    
    // Validate set code
    if (!/^[A-Za-z0-9][A-Za-z0-9\-_]*$/.test(setCode)) {
        alert('套组代码格式无效！必须以字母或数字开头，只能包含字母、数字、下划线和短横线。');
        return;
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
    };
    
    // Save the new set
    fetch(`/api/set/${setCode}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSet)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('创建失败: ' + (data.details ? JSON.stringify(data.details) : data.error));
        } else {
            alert('套组创建成功！');
            window.location.href = `/editor/${setCode}`;
        }
    })
    .catch(error => {
        console.error('Error creating set:', error);
        alert('创建套组失败');
    });
}

async function deleteSetFromList(setCode) {
    if (!confirm(`确定要删除套组 ${setCode} 吗？此操作无法撤销！`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/set/${setCode}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.error) {
            alert('删除失败: ' + data.error);
        } else {
            alert('套组已删除');
            loadSets();
        }
    } catch (error) {
        console.error('Error deleting set:', error);
        alert('删除套组失败');
    }
}

// Load sets on page load
loadSets();
