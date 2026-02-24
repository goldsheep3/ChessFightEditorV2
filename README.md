# ChessFight 套组编辑器 V2

一个用于管理和编辑 ChessFight 游戏套组数据的 Web 应用程序。

## 功能特点

- **套组管理**：创建、编辑、删除游戏套组
- **全局库管理**：管理全局效果库和固词库
- **数据验证**：使用 Pydantic V2 进行严格的数据验证
- **图片上传**：支持为卡片上传图片资源
- **简洁界面**：提供清晰易用的 Web 界面

## 技术栈

- **后端**：Flask 3.0+
- **数据验证**：Pydantic 2.0+
- **前端**：HTML + CSS + JavaScript (原生)
- **数据存储**：JSON 文件

## 项目结构

```
chessfight-set-editor/
├── run.py                          # 启动脚本
├── requirements.txt                # 依赖清单
├── data/                           # 数据存储目录
│   ├── global_effects.json         # 全局通用效果库
│   ├── global_fixed_terms.json     # 全局通用固词库
│   └── set_xxx.json                # 各个独立套组文件
├── assets/
│   └── image/                      # 图片资源目录
│       ├── global/                 # 通用图片存放处
│       └── <set_code>/             # 按套组隔离的上传图片
├── logs/                           # 运行日志
└── chessfight_editor/              # 核心 Python 包
    ├── __init__.py
    ├── config.py                   # 路径等全局配置定义
    ├── utils.py                    # 通用工具函数
    ├── models.py                   # Pydantic V2 数据模型
    ├── routes_set.py               # 路由：套组的 CRUD 和上传
    ├── routes_global.py            # 路由：通用库的 CRUD
    ├── app.py                      # Flask 实例工厂与主入口
    ├── static/                     # 前端静态资源 (CSS/JS)
    └── templates/                  # HTML 模板
        ├── index.html              # 首页：套组与通用库导航
        ├── editor.html             # 套组数据编辑器
        ├── global_effects.html     # 通用效果库编辑器
        └── global_fixed_terms.html # 通用固词库编辑器
```

## 安装

1. 克隆仓库：
```bash
git clone https://github.com/goldsheep3/ChessFightEditorV2.git
cd ChessFightEditorV2
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

## 使用

启动服务器：
```bash
python run.py
```

应用将在 `http://localhost:5000` 启动。

## 界面预览

### 首页
![首页](https://github.com/user-attachments/assets/6b1d2d34-a0ba-498f-ab9a-2dcdc55b4748)

### 套组编辑器
![套组编辑器](https://github.com/user-attachments/assets/c5953242-6c5e-4959-86e2-e5c1234c9ff1)

### 全局效果库编辑器
![全局效果库](https://github.com/user-attachments/assets/f988fef7-d5ad-4675-afdc-849868a2d56f)

## API 端点

### 套组管理
- `GET /api/set/list` - 列出所有套组
- `GET /api/set/<set_code>` - 获取特定套组数据
- `POST /api/set/<set_code>` - 保存/更新套组数据
- `DELETE /api/set/<set_code>` - 删除套组
- `POST /api/set/upload/<set_code>/<field_name>` - 上传图片

### 全局库管理
- `GET /api/global/effects` - 获取全局效果库
- `POST /api/global/effects` - 保存全局效果库
- `GET /api/global/fixed-terms` - 获取全局固词库
- `POST /api/global/fixed-terms` - 保存全局固词库

## 数据模型

### 套组 (SetSchemaV2)
- 基本信息：名称、代码、描述、备注
- 设计信息：原型、设计师
- 局部词库：效果、固词
- 卡片数据：形态、召唤物、建筑、攻击、策略

### 效果 (EffectDefinition)
- 名称
- 性质：正面(positive)/中性(neutral)/负面(negative)
- 备注

### 固词 (FixedTermDefinition)
- 名称
- 备注

### 卡片属性
所有卡片共享：
- 稀有度：R/SR/SSR
- 图片：卡面图、图标、Q版图
- 文本描述
- 关联效果和固词

## 开发

### 数据验证
所有 POST 请求会通过 Pydantic 模型进行验证，确保数据的完整性和正确性。

### 命名空间引用规范
- 通用库引用：直接写 ID（例如：`burn`, `shield`）
- 当前套组引用：带 `self.` 前缀（例如：`self.xg1`）
- 跨套组引用：带目标套组 ID 前缀（例如：`SET_01.xg1`）

## 许可证

本项目遵循 MIT 许可证。

## 贡献

欢迎提交 Issue 和 Pull Request！
