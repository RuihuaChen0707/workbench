/**
 * AI 命令窗口组件
 * 支持快捷键唤醒、自然语言输入和 AI 响应
 */
class AICommandModal {
    constructor() {
        this.isOpen = false;
        this.isLoading = false;
        this.responses = [];
        
        this.init();
    }
    
    init() {
        this.createElement();
        this.bindEvents();
    }
    
    createElement() {
        // 创建模态框 HTML 结构
        const modalHTML = `
            <div class="ai-command-overlay" id="ai-command-overlay">
                <div class="ai-command-modal">
                    <div class="ai-command-header">
                        <div class="ai-command-input-wrapper">
                            <div class="ai-command-icon"></div>
                            <input 
                                type="text" 
                                class="ai-command-input" 
                                id="ai-command-input"
                                placeholder="告诉我你想做什么..."
                                autocomplete="off"
                            >
                            <div class="ai-command-shortcut">
                                <kbd>⌘</kbd><kbd>K</kbd> 唤醒
                            </div>
                        </div>
                    </div>
                    
                    <div class="ai-command-loading" id="ai-command-loading" style="display: none;">
                        <div class="ai-command-spinner"></div>
                        <span>AI 正在思考中...</span>
                    </div>
                    
                    <div class="ai-command-content" id="ai-command-content">
                        <!-- AI 响应内容将在这里显示 -->
                    </div>
                    
                    <div class="ai-command-footer">
                        <div class="ai-command-tips">
                            <div class="ai-tip" data-tip="创建一个新的笔记">创建笔记</div>
                            <div class="ai-tip" data-tip="添加一个待办事项">添加待办</div>
                            <div class="ai-tip" data-tip="开始一个新项目">新建项目</div>
                            <div class="ai-tip" data-tip="帮我整理今天的任务">整理任务</div>
                            <div class="ai-tip" data-tip="总结我的工作进度">工作总结</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 获取元素引用
        this.overlay = document.getElementById('ai-command-overlay');
        this.input = document.getElementById('ai-command-input');
        this.loading = document.getElementById('ai-command-loading');
        this.content = document.getElementById('ai-command-content');
    }
    
    bindEvents() {
        // 检查关键元素是否存在
        if (!this.overlay || !this.input || !this.content) {
            console.error('AI命令窗口关键元素获取失败');
            return;
        }
        
        // 快捷键事件
        document.addEventListener('keydown', (e) => {
            // Cmd+K (Mac) 或 Ctrl+K (Windows/Linux)
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
            
            // ESC 关闭
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // 点击遮罩关闭
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
        
        // 输入框回车提交
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSubmit();
            }
        });
        
        // 快捷提示点击
        this.content.addEventListener('click', (e) => {
            const tip = e.target.closest('.ai-tip');
            if (tip) {
                const tipText = tip.getAttribute('data-tip');
                this.input.value = tipText;
                this.input.focus();
            }
        });
        
        // AI-Pet 点击唤醒
        document.addEventListener('click', (e) => {
            if (e.target.closest('.ai-pet')) {
                // 延迟一下避免与拖拽冲突
                setTimeout(() => {
                    if (!window.aiPet.isDragging) {
                        this.open();
                    }
                }, 100);
            }
        });
        
        // 操作按钮点击处理
        this.content.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.ai-action-btn');
            if (actionBtn) {
                const actionType = actionBtn.getAttribute('data-action');
                const actionData = JSON.parse(actionBtn.getAttribute('data-action-data') || '{}');
                
                this.handleAIAction({ type: actionType }, actionData);
                
                // 关闭命令窗口
                setTimeout(() => {
                    this.close();
                }, 500);
            }
            
            // ... existing tip handling ...
        });
    }
    
    createActionButtons(data) {
        // 根据 AI 响应创建操作按钮
        if (data.actions && data.actions.length > 0) {
            const buttonsHTML = data.actions.map(action => {
                const actionData = JSON.stringify(action.data || {});
                return `<button class="ai-action-btn" data-action="${action.type}" data-action-data='${actionData}'>${action.label}</button>`;
            }).join('');
            
            return `<div class="ai-response-actions">${buttonsHTML}</div>`;
        }
        
        return '';
    }
    
    open() {
        this.isOpen = true;
        this.overlay.classList.add('show');
        
        // 聚焦输入框
        setTimeout(() => {
            this.input.focus();
        }, 300);
        
        // AI-Pet 状态切换
        if (window.aiPet) {
            window.aiPet.setState('happy');
            window.aiPet.showMessage('我来帮助你！', 2000);
        }
    }
    
    close() {
        this.isOpen = false;
        this.overlay.classList.remove('show');
        this.input.value = '';
        this.hideLoading();
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    showLoading() {
        this.isLoading = true;
        this.loading.style.display = 'flex';
    }
    
    hideLoading() {
        this.isLoading = false;
        this.loading.style.display = 'none';
    }
    
    async handleSubmit() {
        const query = this.input.value.trim();
        if (!query || this.isLoading) return;
        
        // 显示加载状态
        this.showLoading();
        
        try {
            // 调用后端 AI API
            const response = await fetch('/api/ai/assist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: query,
                    context: this.getWorkbenchContext()
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 显示 AI 响应
            this.addResponse(query, data);
            
            // 清空输入框
            this.input.value = '';
            
        } catch (error) {
            console.error('AI API 调用失败:', error);
            this.addErrorResponse(query, '抱歉，AI 服务暂时不可用，请稍后再试。');
        } finally {
            this.hideLoading();
        }
    }
    
    getWorkbenchContext() {
        // 获取当前工作台状态作为上下文
        const context = {
            currentView: document.querySelector('.view-content.active')?.id || 'unknown',
            timestamp: new Date().toISOString(),
            
            // 获取笔记内容
            notes: this.getNotesContext(),
            
            // 获取待办事项
            todos: this.getTodosContext(),
            
            // 获取项目信息
            projects: this.getProjectsContext(),
            
            // 获取习惯追踪
            habits: this.getHabitsContext()
        };
        
        return context;
    }
    
    getNotesContext() {
        const notesList = document.getElementById('notes-list');
        const notesContent = document.getElementById('notes-content');
        
        return {
            hasNotes: notesList?.children.length > 0,
            currentNote: notesContent?.querySelector('textarea')?.value || '',
            notesCount: notesList?.children.length || 0
        };
    }
    
    getTodosContext() {
        const todoList = document.getElementById('todo-list');
        const todos = [];
        
        if (todoList) {
            const todoItems = todoList.querySelectorAll('.todo-item');
            todoItems.forEach(item => {
                const text = item.querySelector('.todo-text')?.textContent || '';
                const completed = item.classList.contains('completed');
                todos.push({ text, completed });
            });
        }
        
        return {
            items: todos,
            total: todos.length,
            completed: todos.filter(t => t.completed).length,
            pending: todos.filter(t => !t.completed).length
        };
    }
    
    getProjectsContext() {
        const projectsList = document.getElementById('projects-list');
        const projects = [];
        
        if (projectsList) {
            const projectItems = projectsList.querySelectorAll('.project-item');
            projectItems.forEach(item => {
                const name = item.querySelector('.project-name')?.textContent || '';
                const status = item.querySelector('.project-status')?.textContent || '';
                projects.push({ name, status });
            });
        }
        
        return {
            items: projects,
            total: projects.length
        };
    }
    
    getHabitsContext() {
        const habitsList = document.getElementById('habits-list');
        const habits = [];
        
        if (habitsList) {
            const habitItems = habitsList.querySelectorAll('.habit-item');
            habitItems.forEach(item => {
                const name = item.querySelector('.habit-name')?.textContent || '';
                const streak = item.querySelector('.habit-streak')?.textContent || '0';
                habits.push({ name, streak });
            });
        }
        
        return {
            items: habits,
            total: habits.length
        };
    }
    
    // 处理 AI 响应中的操作
    handleAIAction(action, data) {
        switch (action.type) {
            case 'create_note':
                this.createNote(data.title, data.content);
                break;
            case 'add_todo':
                this.addTodo(data.text);
                break;
            case 'create_project':
                this.createProject(data.name, data.description);
                break;
            case 'add_habit':
                this.addHabit(data.name, data.frequency);
                break;
            case 'switch_view':
                this.switchView(data.view);
                break;
            default:
                console.log('未知操作类型:', action.type);
        }
    }
    
    // 创建笔记
    createNote(title, content) {
        // 切换到笔记视图
        this.switchView('notes');
        
        // 延迟执行以确保视图已切换
        setTimeout(() => {
            const textarea = document.querySelector('#notes-content textarea');
            if (textarea) {
                textarea.value = `# ${title}\n\n${content}`;
                textarea.focus();
            }
            
            // 显示成功消息
            if (window.aiPet) {
                window.aiPet.showMessage('笔记已创建！', 2000);
            }
        }, 300);
    }
    
    // 添加待办事项
    addTodo(text) {
        this.switchView('todo');
        
        setTimeout(() => {
            const input = document.querySelector('#todo-input');
            if (input) {
                input.value = text;
                // 触发添加事件
                const event = new KeyboardEvent('keydown', { key: 'Enter' });
                input.dispatchEvent(event);
            }
            
            if (window.aiPet) {
                window.aiPet.showMessage('待办已添加！', 2000);
            }
        }, 300);
    }
    
    // 创建项目
    createProject(name, description) {
        this.switchView('projects');
        
        setTimeout(() => {
            // 这里可以触发项目创建逻辑
            console.log('创建项目:', name, description);
            
            if (window.aiPet) {
                window.aiPet.showMessage('项目已创建！', 2000);
            }
        }, 300);
    }
    
    // 添加习惯
    addHabit(name, frequency) {
        this.switchView('habits');
        
        setTimeout(() => {
            // 这里可以触发习惯添加逻辑
            console.log('添加习惯:', name, frequency);
            
            if (window.aiPet) {
                window.aiPet.showMessage('习惯已添加！', 2000);
            }
        }, 300);
    }
    
    // 切换视图
    switchView(viewName) {
        const viewManager = window.viewManager;
        if (viewManager && viewManager.showView) {
            viewManager.showView(viewName);
        }
    }
    
    addResponse(query, data) {
        const responseHTML = `
            <div class="ai-response">
                <div class="ai-response-header">
                    <div class="ai-response-avatar"></div>
                    <div class="ai-response-title">AI 助手</div>
                </div>
                <div class="ai-response-text">${this.formatResponse(data)}</div>
                ${this.createActionButtons(data)}
            </div>
        `;
        
        this.content.insertAdjacentHTML('beforeend', responseHTML);
        this.scrollToBottom();
    }
    
    addErrorResponse(query, errorMessage) {
        const responseHTML = `
            <div class="ai-response">
                <div class="ai-response-header">
                    <div class="ai-response-avatar"></div>
                    <div class="ai-response-title">系统提示</div>
                </div>
                <div class="ai-response-text">${errorMessage}</div>
            </div>
        `;
        
        this.content.insertAdjacentHTML('beforeend', responseHTML);
        this.scrollToBottom();
    }
    
    formatResponse(data) {
        // 格式化 AI 响应数据
        if (data.response) {
            return data.response.replace(/\n/g, '<br>');
        }
        
        return '收到你的请求，正在处理中...';
    }
    
    scrollToBottom() {
        this.content.scrollTop = this.content.scrollHeight;
    }
}

// 全局实例
window.aiCommandModal = null;

// 初始化 AI 命令窗口
function initAICommandModal() {
    if (!window.aiCommandModal) {
        window.aiCommandModal = new AICommandModal();
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAICommandModal);
} else {
    initAICommandModal();
}