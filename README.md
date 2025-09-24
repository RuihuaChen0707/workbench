# 智能工作台

一个基于Flask的智能工作台应用，集成了笔记管理、待办事项、项目管理和AI助手功能。

## ✨ 功能特性

- 📝 **笔记管理** - 创建、编辑和组织笔记
- ✅ **待办事项** - 任务管理和进度跟踪
- 📋 **项目管理** - 项目组织和协调
- 🤖 **AI助手** - 智能对话和辅助功能
- 🎯 **习惯追踪** - 个人习惯管理

## 🛠️ 技术栈

- **后端**: Flask (Python)
- **前端**: HTML + CSS + JavaScript
- **数据存储**: JSON文件
- **AI集成**: OpenRouter API

## 🚀 快速开始

### 安装依赖
```bash
pip install -r requirements.txt
```

### 运行应用
```bash
python app.py
```

应用将在 http://localhost:8080 启动

## 📁 项目结构

```
智能工作台/
├── app.py              # Flask后端
├── requirements.txt    # Python依赖
├── templates/
│   └── index.html     # HTML模板
├── static/
│   ├── style.css      # 样式文件
│   └── script.js      # JavaScript逻辑
└── README.md          # 说明文档
```

## 注意事项

- 所有数据都存储在浏览器本地，清除浏览器数据会丢失所有信息
- 请妥善保管你的AI API密钥，不要上传到代码仓库
- 番茄钟通知需要用户授权浏览器通知权限