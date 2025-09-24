// 全局状态管理
class AppState {
    constructor() {
        this.notebookManager = null;
        this.todoListManager = null;
        this.aiChatManager = null;
        this.habitTracker = null;
        this.projectManager = null;  // 新增项目管理器
        this.weeklyReportGenerator = null;  // 新增周报生成器
        this.viewManager = null;
    }

    init() {
        try {
            // 初始化视图管理器
            this.viewManager = new ViewManager();
            this.viewManager.init();

            // 初始化笔记本管理器
            this.notebookManager = new NotebookManager();
            this.notebookManager.init();

            // 初始化待办事项管理器
            this.todoListManager = new TodoListManager();
            this.todoListManager.init();

            // 初始化项目管理器
            this.projectManager = new ProjectManager();
            this.projectManager.init();

            // 初始化AI聊天
            this.aiChatManager = new AIChatManager();
            this.aiChatManager.init();

            // 初始化习惯追踪器
            this.habitTracker = new HabitTracker();
            this.habitTracker.init();
            
            // 初始化周报生成器
            this.weeklyReportGenerator = new WeeklyReportGenerator();
            this.weeklyReportGenerator.init();
            
            console.log('应用初始化完成');
        } catch (error) {
            console.error('应用初始化过程中发生错误:', error);
        }
    }
}

// 视图管理器 - SPA核心，处理视图切换
class ViewManager {
    constructor() {
        this.currentView = 'notes-view';  // 默认视图为笔记本视图
        this.navButtons = {};
        this.views = {};
    }

    init() {
        this.bindDOMElements();
        if (this.checkElementsExist()) {
            this.bindEvents();
            this.showView(this.currentView);
        } else {
            console.error('ViewManager初始化失败：部分DOM元素不存在');
        }
    }

    bindDOMElements() {
        // 左侧导航栏按钮
        this.navButtons = {
            notes: document.getElementById('nav-notes'),
            todo: document.getElementById('nav-todo'),
            projects: document.getElementById('nav-projects'),  // 新增项目按钮
            ai: document.getElementById('nav-ai'),
            habits: document.getElementById('nav-habits'),
            weeklyReport: document.getElementById('nav-weekly-report')  // 新增
        };

        // 视图容器
        this.views = {
            'notes-view': document.getElementById('notes-view'),
            'todo-view': document.getElementById('todo-view'),
            'projects-view': document.getElementById('projects-view'),  // 新增项目视图
            'ai-view': document.getElementById('ai-view'),
            'habits-view': document.getElementById('habits-view'),
            'weekly-report-view': document.getElementById('weekly-report-view')  // 新增
        };
    }

    // 新增：检查所有必要的DOM元素是否存在
    checkElementsExist() {
        // 检查导航按钮
        const missingButtons = Object.entries(this.navButtons)
            .filter(([key, element]) => !element)
            .map(([key]) => key);
        
        if (missingButtons.length > 0) {
            console.error('缺少导航按钮:', missingButtons);
            return false;
        }
        
        // 检查视图容器
        const missingViews = Object.entries(this.views)
            .filter(([key, element]) => !element)
            .map(([key]) => key);
            
        if (missingViews.length > 0) {
            console.error('缺少视图容器:', missingViews);
            return false;
        }
        
        return true;
    }

    bindEvents() {
        // 绑定导航按钮点击事件
        if (this.navButtons.notes) {
            this.navButtons.notes.addEventListener('click', () => this.showView('notes-view'));
        }
        if (this.navButtons.todo) {
            this.navButtons.todo.addEventListener('click', () => this.showView('todo-view'));
        }
        if (this.navButtons.projects) {
            this.navButtons.projects.addEventListener('click', () => this.showView('projects-view'));
        }
        if (this.navButtons.ai) {
            this.navButtons.ai.addEventListener('click', () => this.showView('ai-view'));
        }
        if (this.navButtons.habits) {
            this.navButtons.habits.addEventListener('click', () => this.showView('habits-view'));
        }
        if (this.navButtons.weeklyReport) {
            this.navButtons.weeklyReport.addEventListener('click', () => this.showView('weekly-report-view'));
        }
    }

    showView(viewId) {
        // 隐藏所有第三栏视图
        Object.values(this.views).forEach(view => {
            if (view) {
                view.classList.remove('active');
            }
        });
        
        // 隐藏所有第二栏视图
        const listViews = {
            'notes-view': document.getElementById('notes-list'),
            'todo-view': document.getElementById('todo-list-view'),
            'projects-view': document.getElementById('projects-list'),
            'ai-view': document.getElementById('ai-list'),
            'habits-view': document.getElementById('habits-list'),
            'weekly-report-view': document.getElementById('weekly-report-list')
        };
        
        Object.values(listViews).forEach(view => {
            if (view) {
                view.classList.remove('active');
            }
        });
        
        // 移除所有导航按钮的激活状态
        Object.values(this.navButtons).forEach(btn => {
            if (btn) {
                btn.classList.remove('active');
            }
        });
        
        // 显示目标视图（第三栏）
        const targetView = this.views[viewId];
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewId;
            
            // 同时显示对应的第二栏视图
            const targetListView = listViews[viewId];
            if (targetListView) {
                targetListView.classList.add('active');
            }
            
            // 激活对应的导航按钮
            const viewToButtonMap = {
                'notes-view': 'notes',
                'todo-view': 'todo',
                'projects-view': 'projects',
                'ai-view': 'ai',
                'habits-view': 'habits',
                'weekly-report-view': 'weeklyReport'
            };
            
            const buttonKey = viewToButtonMap[viewId];
            if (buttonKey && this.navButtons[buttonKey]) {
                this.navButtons[buttonKey].classList.add('active');
            }
            
            // 触发视图切换后的回调
            if (viewId === 'projects-view' && window.appState?.projectManager) {
                window.appState.projectManager.onViewActivated();
            }
        }
    }
}

// 项目管理器类
class ProjectManager {
    constructor() {
        this.projects = [];
        this.currentView = 'list'; // list, card, kanban
        this.selectedProject = null;
        this.draggedProject = null;
        
        // DOM元素
        this.elements = {};
    }

    init() {
        this.bindDOMElements();
        if (this.checkElementsExist()) {
            this.bindEvents();
            this.loadProjects();
        } else {
            console.error('ProjectManager初始化失败：部分DOM元素不存在');
        }
    }

    bindDOMElements() {
        this.elements = {
            // 视图切换按钮
            listViewBtn: document.getElementById('list-view-btn'),
            cardViewBtn: document.getElementById('card-view-btn'),
            kanbanViewBtn: document.getElementById('kanban-view-btn'),
            
            // 添加项目按钮
            addProjectBtn: document.getElementById('add-project'),
            
            // 视图容器
            listView: document.getElementById('projects-list-view'),
            cardView: document.getElementById('projects-card-view'),
            kanbanView: document.getElementById('projects-kanban-view'),
            
            // 内容容器
            projectsList: document.getElementById('projects-list'),
            projectsCards: document.getElementById('projects-cards'),
            pendingProjects: document.getElementById('pending-projects'),
            inProgressProjects: document.getElementById('in-progress-projects'),
            completedProjects: document.getElementById('completed-projects'),
            
            // 模态框
            projectModal: document.getElementById('project-modal'),
            projectModalTitle: document.getElementById('project-modal-title'),
            projectTitleInput: document.getElementById('project-title-input'),
            projectStatusSelect: document.getElementById('project-status-select'),
            projectModalConfirm: document.getElementById('project-modal-confirm'),
            projectModalCancel: document.getElementById('project-modal-cancel'),
            
            // 项目详情模态框
            projectDetailModal: document.getElementById('project-detail-modal'),
            projectDetailTitle: document.getElementById('project-detail-title'),
            projectDetailStatus: document.getElementById('project-detail-status'),
            projectDetailCreated: document.getElementById('project-detail-created'),
            projectDetailUpdated: document.getElementById('project-detail-updated'),
            linkedNotes: document.getElementById('linked-notes'),
            linkedTodos: document.getElementById('linked-todos'),
            linkNoteBtn: document.getElementById('link-note-btn'),
            linkTodoBtn: document.getElementById('link-todo-btn'),
            closeProjectDetail: document.getElementById('close-project-detail')
        };
    }

    checkElementsExist() {
        const requiredElements = [
            'listViewBtn', 'cardViewBtn', 'kanbanViewBtn', 'addProjectBtn',
            'listView', 'cardView', 'kanbanView', 'projectsList', 'projectsCards'
        ];
        
        const missingElements = requiredElements.filter(key => !this.elements[key]);
        
        if (missingElements.length > 0) {
            console.error('项目管理器缺少DOM元素:', missingElements);
            return false;
        }
        
        return true;
    }

    bindEvents() {
        // 视图切换事件
        this.elements.listViewBtn?.addEventListener('click', () => this.switchView('list'));
        this.elements.cardViewBtn?.addEventListener('click', () => this.switchView('card'));
        this.elements.kanbanViewBtn?.addEventListener('click', () => this.switchView('kanban'));
        
        // 添加项目事件
        this.elements.addProjectBtn?.addEventListener('click', () => this.showCreateModal());
        
        // 模态框事件
        this.elements.projectModalConfirm?.addEventListener('click', () => this.handleModalConfirm());
        this.elements.projectModalCancel?.addEventListener('click', () => this.hideModal());
        this.elements.closeProjectDetail?.addEventListener('click', () => this.hideDetailModal());
        
        // 关联功能事件
        this.elements.linkNoteBtn?.addEventListener('click', () => this.showLinkNoteDialog());
        this.elements.linkTodoBtn?.addEventListener('click', () => this.showLinkTodoDialog());
        
        // 模态框外点击关闭
        this.elements.projectModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.projectModal) {
                this.hideModal();
            }
        });
        
        this.elements.projectDetailModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.projectDetailModal) {
                this.hideDetailModal();
            }
        });
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                this.hideDetailModal();
            }
        });
    }

    async loadProjects() {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            
            if (response.ok) {
                this.projects = data.projects || [];
                this.renderCurrentView();
            } else {
                console.error('加载项目失败:', data.error);
                this.showMessage('加载项目失败', 'error');
            }
        } catch (error) {
            console.error('加载项目时发生错误:', error);
            this.showMessage('网络错误', 'error');
        }
    }

    async saveProject(projectData) {
        try {
            const url = projectData.id ? `/api/projects/${projectData.id}` : '/api/projects';
            const method = projectData.id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                if (projectData.id) {
                    // 更新现有项目
                    const index = this.projects.findIndex(p => p.id === projectData.id);
                    if (index !== -1) {
                        this.projects[index] = data.project;
                    }
                } else {
                    // 添加新项目
                    this.projects.push(data.project);
                }
                
                this.renderCurrentView();
                this.showMessage(projectData.id ? '项目更新成功' : '项目创建成功', 'success');
                return data.project;
            } else {
                this.showMessage(data.error || '保存失败', 'error');
                return null;
            }
        } catch (error) {
            console.error('保存项目时发生错误:', error);
            this.showMessage('网络错误', 'error');
            return null;
        }
    }

    async deleteProject(projectId) {
        if (!confirm('确定要删除这个项目吗？这将解除所有关联，但不会删除笔记和任务。')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.projects = this.projects.filter(p => p.id !== projectId);
                this.renderCurrentView();
                this.showMessage('项目删除成功', 'success');
            } else {
                this.showMessage(data.error || '删除失败', 'error');
            }
        } catch (error) {
            console.error('删除项目时发生错误:', error);
            this.showMessage('网络错误', 'error');
        }
    }

    switchView(viewType) {
        // 更新按钮状态
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        
        if (viewType === 'list') {
            this.elements.listViewBtn?.classList.add('active');
        } else if (viewType === 'card') {
            this.elements.cardViewBtn?.classList.add('active');
        } else if (viewType === 'kanban') {
            this.elements.kanbanViewBtn?.classList.add('active');
        }
        
        // 更新视图显示
        document.querySelectorAll('.projects-view').forEach(view => view.classList.remove('active'));
        
        if (viewType === 'list') {
            this.elements.listView?.classList.add('active');
        } else if (viewType === 'card') {
            this.elements.cardView?.classList.add('active');
        } else if (viewType === 'kanban') {
            this.elements.kanbanView?.classList.add('active');
        }
        
        this.currentView = viewType;
        this.renderCurrentView();
    }

    renderCurrentView() {
        switch (this.currentView) {
            case 'list':
                this.renderListView();
                break;
            case 'card':
                this.renderCardView();
                break;
            case 'kanban':
                this.renderKanbanView();
                break;
        }
    }

    renderListView() {
        if (!this.elements.projectsList) return;
        
        if (this.projects.length === 0) {
            this.elements.projectsList.innerHTML = `
                <div class="empty-state">
                    <p>还没有项目，点击"新建项目"开始吧！</p>
                </div>
            `;
            return;
        }
        
        const html = this.projects.map(project => `
            <div class="project-row" data-project-id="${project.id}">
                <div class="project-title">${this.escapeHtml(project.title)}</div>
                <div class="project-status">
                    <span class="status-badge status-${project.status}">
                        ${this.getStatusText(project.status)}
                    </span>
                </div>
                <div class="project-created">${this.formatDate(project.createdAt)}</div>
                <div class="project-actions">
                    <button class="action-btn" onclick="window.appState.projectManager.showProjectDetail(${project.id})" title="查看详情">👁️</button>
                    <button class="action-btn" onclick="window.appState.projectManager.showEditModal(${project.id})" title="编辑">✏️</button>
                    <button class="action-btn" onclick="window.appState.projectManager.deleteProject(${project.id})" title="删除">🗑️</button>
                </div>
            </div>
        `).join('');
        
        this.elements.projectsList.innerHTML = html;
        
        // 绑定行点击事件
        this.elements.projectsList.querySelectorAll('.project-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if (!e.target.closest('.project-actions')) {
                    const projectId = parseInt(row.dataset.projectId);
                    this.showProjectDetail(projectId);
                }
            });
        });
    }

    renderCardView() {
        if (!this.elements.projectsCards) return;
        
        if (this.projects.length === 0) {
            this.elements.projectsCards.innerHTML = `
                <div class="empty-state">
                    <p>还没有项目，点击"新建项目"开始吧！</p>
                </div>
            `;
            return;
        }
        
        const html = this.projects.map(project => {
            const linkedNotesCount = project.linkedNotes?.length || 0;
            const linkedTodosCount = project.linkedTodos?.length || 0;
            
            return `
                <div class="project-card" data-project-id="${project.id}">
                    <div class="project-card-header">
                        <h3 class="project-card-title">${this.escapeHtml(project.title)}</h3>
                        <span class="status-badge status-${project.status} project-card-status">
                            ${this.getStatusText(project.status)}
                        </span>
                    </div>
                    <div class="project-card-meta">
                        <span>创建于 ${this.formatDate(project.createdAt)}</span>
                    </div>
                    <div class="project-card-links">
                        <div class="link-count">
                            <span>📝</span>
                            <span>${linkedNotesCount}</span>
                        </div>
                        <div class="link-count">
                            <span>✅</span>
                            <span>${linkedTodosCount}</span>
                        </div>
                    </div>
                    <div class="project-card-actions">
                        <button class="action-btn" onclick="window.appState.projectManager.showProjectDetail(${project.id})" title="查看详情">👁️</button>
                        <button class="action-btn" onclick="window.appState.projectManager.showEditModal(${project.id})" title="编辑">✏️</button>
                        <button class="action-btn" onclick="window.appState.projectManager.deleteProject(${project.id})" title="删除">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
        
        this.elements.projectsCards.innerHTML = html;
        
        // 绑定卡片点击事件
        this.elements.projectsCards.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.project-card-actions')) {
                    const projectId = parseInt(card.dataset.projectId);
                    this.showProjectDetail(projectId);
                }
            });
        });
    }

    renderKanbanView() {
        const pendingProjects = this.projects.filter(p => p.status === 'pending');
        const inProgressProjects = this.projects.filter(p => p.status === 'in_progress');
        const completedProjects = this.projects.filter(p => p.status === 'completed');
        
        this.renderKanbanColumn('pending-projects', pendingProjects);
        this.renderKanbanColumn('in-progress-projects', inProgressProjects);
        this.renderKanbanColumn('completed-projects', completedProjects);
        
        // 更新计数
        this.updateKanbanCounts();
        
        // 初始化拖拽功能
        this.initDragAndDrop();
    }

    renderKanbanColumn(containerId, projects) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (projects.length === 0) {
            container.innerHTML = `
                <div class="drop-zone" data-status="${container.id.replace('-projects', '')}">
                    拖拽项目到这里
                </div>
            `;
            return;
        }
        
        const html = projects.map(project => {
            const linkedNotesCount = project.linkedNotes?.length || 0;
            const linkedTodosCount = project.linkedTodos?.length || 0;
            
            return `
                <div class="kanban-card" draggable="true" data-project-id="${project.id}" data-status="${project.status}">
                    <div class="kanban-card-title">${this.escapeHtml(project.title)}</div>
                    <div class="kanban-card-meta">
                        <span>${this.formatDate(project.createdAt)}</span>
                        <div class="kanban-card-links">
                            <span>📝${linkedNotesCount}</span>
                            <span>✅${linkedTodosCount}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html + `
            <div class="drop-zone" data-status="${containerId.replace('-projects', '')}">
                拖拽项目到这里
            </div>
        `;
        
        // 绑定卡片点击事件
        container.querySelectorAll('.kanban-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const projectId = parseInt(card.dataset.projectId);
                this.showProjectDetail(projectId);
            });
        });
    }

    initDragAndDrop() {
        const kanbanCards = document.querySelectorAll('.kanban-card');
        const dropZones = document.querySelectorAll('.drop-zone');
        
        // 卡片拖拽事件
        kanbanCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                this.draggedProject = {
                    id: parseInt(card.dataset.projectId),
                    element: card
                };
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                this.draggedProject = null;
            });
        });
        
        // 放置区域事件
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                if (this.draggedProject) {
                    const newStatus = zone.dataset.status.replace('-', '_');
                    this.updateProjectStatus(this.draggedProject.id, newStatus);
                }
            });
        });
    }

    async updateProjectStatus(projectId, newStatus) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project || project.status === newStatus) return;
        
        const updatedProject = await this.saveProject({
            id: projectId,
            title: project.title,
            status: newStatus
        });
        
        if (updatedProject) {
            this.renderKanbanView();
        }
    }

    updateKanbanCounts() {
        const counts = {
            pending: this.projects.filter(p => p.status === 'pending').length,
            'in_progress': this.projects.filter(p => p.status === 'in_progress').length,
            completed: this.projects.filter(p => p.status === 'completed').length
        };
        
        Object.entries(counts).forEach(([status, count]) => {
            const column = document.querySelector(`[data-status="${status}"]`)?.closest('.kanban-column');
            const countElement = column?.querySelector('.project-count');
            if (countElement) {
                countElement.textContent = count;
            }
        });
    }

    showCreateModal() {
        this.selectedProject = null;
        this.elements.projectModalTitle.textContent = '新建项目';
        this.elements.projectTitleInput.value = '';
        this.elements.projectStatusSelect.value = 'pending';
        this.showModal();
    }

    showEditModal(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        this.selectedProject = project;
        this.elements.projectModalTitle.textContent = '编辑项目';
        this.elements.projectTitleInput.value = project.title;
        this.elements.projectStatusSelect.value = project.status;
        this.showModal();
    }

    showModal() {
        this.elements.projectModal?.classList.add('show');
        this.elements.projectTitleInput?.focus();
    }

    hideModal() {
        this.elements.projectModal?.classList.remove('show');
    }

    async handleModalConfirm() {
        const title = this.elements.projectTitleInput?.value.trim();
        const status = this.elements.projectStatusSelect?.value;
        
        if (!title) {
            this.showMessage('请输入项目标题', 'error');
            return;
        }
        
        const projectData = {
            title: title,
            status: status
        };
        
        if (this.selectedProject) {
            projectData.id = this.selectedProject.id;
        }
        
        const savedProject = await this.saveProject(projectData);
        if (savedProject) {
            this.hideModal();
        }
    }

    async showProjectDetail(projectId) {
        try {
            const response = await fetch(`/api/projects/${projectId}`);
            const data = await response.json();
            
            if (response.ok) {
                const project = data.project;
                
                // 填充项目基本信息
                this.elements.projectDetailTitle.textContent = project.title;
                this.elements.projectDetailStatus.textContent = this.getStatusText(project.status);
                this.elements.projectDetailStatus.className = `status-badge status-${project.status}`;
                this.elements.projectDetailCreated.textContent = this.formatDate(project.createdAt);
                this.elements.projectDetailUpdated.textContent = this.formatDate(project.updatedAt);
                
                // 渲染关联笔记
                this.renderLinkedNotes(project.linkedNotesDetail || []);
                
                // 渲染关联任务
                this.renderLinkedTodos(project.linkedTodosDetail || []);
                
                this.selectedProject = project;
                this.showDetailModal();
            } else {
                this.showMessage(data.error || '获取项目详情失败', 'error');
            }
        } catch (error) {
            console.error('获取项目详情时发生错误:', error);
            this.showMessage('网络错误', 'error');
        }
    }

    renderLinkedNotes(notes) {
        if (!this.elements.linkedNotes) return;
        
        if (notes.length === 0) {
            this.elements.linkedNotes.innerHTML = '<p class="empty-message">暂无关联笔记</p>';
            return;
        }
        
        const html = notes.map(note => `
            <div class="linked-item" data-note-id="${note.id}">
                <div class="linked-item-title">${this.escapeHtml(note.title)}</div>
                <div class="linked-item-content">${this.escapeHtml(note.content)}</div>
                <div class="linked-item-meta">
                    <span>笔记</span>
                    <button class="action-btn" onclick="window.appState.projectManager.unlinkNote(${this.selectedProject?.id}, ${note.id})" title="取消关联">🔗</button>
                </div>
            </div>
        `).join('');
        
        this.elements.linkedNotes.innerHTML = html;
    }

    renderLinkedTodos(todos) {
        if (!this.elements.linkedTodos) return;
        
        if (todos.length === 0) {
            this.elements.linkedTodos.innerHTML = '<p class="empty-message">暂无关联任务</p>';
            return;
        }
        
        const html = todos.map(todo => `
            <div class="linked-item" data-todo-id="${todo.id}" data-notebook-id="${todo.notebookId}">
                <div class="linked-item-title">
                    ${todo.completed ? '✅' : '⭕'} ${this.escapeHtml(todo.text)}
                </div>
                <div class="linked-item-meta">
                    <span>${todo.deadline ? `截止：${this.formatDate(todo.deadline)}` : '无截止日期'}</span>
                    <button class="action-btn" onclick="window.appState.projectManager.unlinkTodo(${this.selectedProject?.id}, ${todo.notebookId}, ${todo.id})" title="取消关联">🔗</button>
                </div>
            </div>
        `).join('');
        
        this.elements.linkedTodos.innerHTML = html;
    }

    showDetailModal() {
        this.elements.projectDetailModal?.classList.add('show');
    }

    hideDetailModal() {
        this.elements.projectDetailModal?.classList.remove('show');
    }

    async showLinkNoteDialog() {
        try {
            const response = await fetch('/api/notebooks');
            const data = await response.json();
            
            if (response.ok && data.notebooks.length > 0) {
                this.populateNoteSelectionModal(data.notebooks);
                this.showNoteSelectionModal();
            } else {
                this.showMessage('没有可关联的笔记', 'info');
            }
        } catch (error) {
            console.error('获取笔记列表失败:', error);
            this.showMessage('获取笔记列表失败', 'error');
        }
    }

    async showLinkTodoDialog() {
        try {
            const notebooksResponse = await fetch('/api/notebooks');
            const notebooksData = await notebooksResponse.json();
            
            if (notebooksResponse.ok && notebooksData.notebooks.length > 0) {
                await this.populateTodoSelectionModal(notebooksData.notebooks);
                this.showTodoSelectionModal();
            } else {
                this.showMessage('没有可关联的任务', 'info');
            }
        } catch (error) {
            console.error('获取任务列表失败:', error);
            this.showMessage('获取任务列表失败', 'error');
        }
    }

    populateNoteSelectionModal(notebooks) {
        const noteList = document.getElementById('note-selection-list');
        const searchInput = document.getElementById('note-search-input');
        
        if (!noteList) return;
        
        if (notebooks.length === 0) {
            noteList.innerHTML = `
                <div class="empty-selection">
                    <div class="empty-selection-icon">📝</div>
                    <div>暂无可关联的笔记</div>
                </div>
            `;
            return;
        }
        
        const renderNotes = (filteredNotebooks = notebooks) => {
            const html = filteredNotebooks.map(notebook => `
                <div class="selection-item" data-note-id="${notebook.id}">
                    <input type="checkbox" class="selection-checkbox" data-note-id="${notebook.id}">
                    <div class="selection-content">
                        <div class="selection-title">${this.escapeHtml(notebook.name)}</div>
                        <div class="selection-meta">
                            <span>📝 笔记</span>
                            <span>创建于 ${this.formatDate(notebook.createdAt)}</span>
                        </div>
                        ${notebook.content ? `<div class="selection-preview">${this.escapeHtml(notebook.content)}</div>` : ''}
                    </div>
                </div>
            `).join('');
            
            noteList.innerHTML = html;
            
            // 绑定选择事件
            noteList.querySelectorAll('.selection-item').forEach(item => {
                const checkbox = item.querySelector('.selection-checkbox');
                item.addEventListener('click', (e) => {
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                    }
                    this.updateNoteSelectionUI();
                });
                
                checkbox.addEventListener('change', () => {
                    this.updateNoteSelectionUI();
                });
            });
        };
        
        // 搜索功能
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = notebooks.filter(notebook => 
                notebook.name.toLowerCase().includes(query) ||
                (notebook.content && notebook.content.toLowerCase().includes(query))
            );
            renderNotes(filtered);
        });
        
        renderNotes();
    }

    async populateTodoSelectionModal(notebooks) {
        const todoList = document.getElementById('todo-selection-list');
        const searchInput = document.getElementById('todo-search-input');
        const notebookFilter = document.getElementById('notebook-filter');
        
        if (!todoList || !notebookFilter) return;
        
        // 获取所有任务
        let allTodos = [];
        
        for (const notebook of notebooks) {
            try {
                const todosResponse = await fetch(`/api/notebooks/${notebook.id}/todos`);
                const todosData = await todosResponse.json();
                
                if (todosResponse.ok && todosData.todos) {
                    const todosWithNotebook = todosData.todos.map(todo => ({
                        ...todo,
                        notebookId: notebook.id,
                        notebookName: notebook.name
                    }));
                    allTodos = allTodos.concat(todosWithNotebook);
                }
            } catch (error) {
                console.error(`获取笔记本 ${notebook.name} 的任务失败:`, error);
            }
        }
        
        // 填充笔记本筛选器
        const filterOptions = notebooks.map(nb => 
            `<option value="${nb.id}">${this.escapeHtml(nb.name)}</option>`
        ).join('');
        notebookFilter.innerHTML = `<option value="">所有笔记本</option>${filterOptions}`;
        
        const renderTodos = (filteredTodos = allTodos) => {
            if (filteredTodos.length === 0) {
                todoList.innerHTML = `
                    <div class="empty-selection">
                        <div class="empty-selection-icon">✅</div>
                        <div>暂无可关联的任务</div>
                    </div>
                `;
                return;
            }
            
            const html = filteredTodos.map(todo => `
                <div class="selection-item" data-todo-id="${todo.id}" data-notebook-id="${todo.notebookId}">
                    <input type="checkbox" class="selection-checkbox" data-todo-id="${todo.id}" data-notebook-id="${todo.notebookId}">
                    <div class="selection-content">
                        <div class="selection-title">
                            ${todo.completed ? '✅' : '⭕'} ${this.escapeHtml(todo.text)}
                        </div>
                        <div class="selection-meta">
                            <span>📋 ${this.escapeHtml(todo.notebookName)}</span>
                            ${todo.deadline ? `<span>⏰ ${this.formatDate(todo.deadline)}</span>` : '<span>无截止日期</span>'}
                        </div>
                    </div>
                </div>
            `).join('');
            
            todoList.innerHTML = html;
            
            // 绑定选择事件
            todoList.querySelectorAll('.selection-item').forEach(item => {
                const checkbox = item.querySelector('.selection-checkbox');
                item.addEventListener('click', (e) => {
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                    }
                    this.updateTodoSelectionUI();
                });
                
                checkbox.addEventListener('change', () => {
                    this.updateTodoSelectionUI();
                });
            });
        };
        
        // 搜索和筛选功能
        const applyFilters = () => {
            const query = searchInput.value.toLowerCase();
            const selectedNotebook = notebookFilter.value;
            
            let filtered = allTodos;
            
            if (selectedNotebook) {
                filtered = filtered.filter(todo => todo.notebookId == selectedNotebook);
            }
            
            if (query) {
                filtered = filtered.filter(todo => 
                    todo.text.toLowerCase().includes(query) ||
                    todo.notebookName.toLowerCase().includes(query)
                );
            }
            
            renderTodos(filtered);
        };
        
        searchInput.addEventListener('input', applyFilters);
        notebookFilter.addEventListener('change', applyFilters);
        
        renderTodos();
    }

    updateNoteSelectionUI() {
        const confirmBtn = document.getElementById('confirm-link-note');
        const selectedCheckboxes = document.querySelectorAll('#note-selection-list .selection-checkbox:checked');
        
        if (confirmBtn) {
            confirmBtn.disabled = selectedCheckboxes.length === 0;
        }
    }

    updateTodoSelectionUI() {
        const confirmBtn = document.getElementById('confirm-link-todo');
        const selectedCheckboxes = document.querySelectorAll('#todo-selection-list .selection-checkbox:checked');
        
        if (confirmBtn) {
            confirmBtn.disabled = selectedCheckboxes.length === 0;
        }
    }

    showNoteSelectionModal() {
        const modal = document.getElementById('link-note-modal');
        if (modal) {
            modal.classList.add('show');
            
            // 绑定事件
            const closeBtn = document.getElementById('close-link-note-modal');
            const cancelBtn = document.getElementById('cancel-link-note');
            const confirmBtn = document.getElementById('confirm-link-note');
            
            const closeModal = () => {
                modal.classList.remove('show');
                document.getElementById('note-search-input').value = '';
            };
            
            closeBtn?.addEventListener('click', closeModal);
            cancelBtn?.addEventListener('click', closeModal);
            
            confirmBtn?.addEventListener('click', async () => {
                const selectedCheckboxes = document.querySelectorAll('#note-selection-list .selection-checkbox:checked');
                
                for (const checkbox of selectedCheckboxes) {
                    const noteId = parseInt(checkbox.dataset.noteId);
                    if (noteId && this.selectedProject) {
                        await this.linkNoteToProject(this.selectedProject.id, noteId);
                    }
                }
                
                closeModal();
            });
        }
    }

    showTodoSelectionModal() {
        const modal = document.getElementById('link-todo-modal');
        if (modal) {
            modal.classList.add('show');
            
            // 绑定事件
            const closeBtn = document.getElementById('close-link-todo-modal');
            const cancelBtn = document.getElementById('cancel-link-todo');
            const confirmBtn = document.getElementById('confirm-link-todo');
            
            const closeModal = () => {
                modal.classList.remove('show');
                document.getElementById('todo-search-input').value = '';
                document.getElementById('notebook-filter').value = '';
            };
            
            closeBtn?.addEventListener('click', closeModal);
            cancelBtn?.addEventListener('click', closeModal);
            
            confirmBtn?.addEventListener('click', async () => {
                const selectedCheckboxes = document.querySelectorAll('#todo-selection-list .selection-checkbox:checked');
                
                for (const checkbox of selectedCheckboxes) {
                    const todoId = parseInt(checkbox.dataset.todoId);
                    const notebookId = parseInt(checkbox.dataset.notebookId);
                    
                    if (todoId && notebookId && this.selectedProject) {
                        await this.linkTodoToProject(this.selectedProject.id, notebookId, todoId);
                    }
                }
                
                closeModal();
            });
        }
    }

    async linkNoteToProject(projectId, noteId) {
        try {
            const response = await fetch(`/api/projects/${projectId}/link-note`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ noteId: noteId })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('笔记关联成功', 'success');
                // 刷新项目详情
                this.showProjectDetail(projectId);
            } else {
                this.showMessage(data.error || '关联失败', 'error');
            }
        } catch (error) {
            console.error('关联笔记时发生错误:', error);
            this.showMessage('网络错误', 'error');
        }
    }

    async linkTodoToProject(projectId, notebookId, todoId) {
        try {
            const response = await fetch(`/api/projects/${projectId}/link-todo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    notebookId: notebookId,
                    todoId: todoId 
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('任务关联成功', 'success');
                // 刷新项目详情
                this.showProjectDetail(projectId);
            } else {
                this.showMessage(data.error || '关联失败', 'error');
            }
        } catch (error) {
            console.error('关联任务时发生错误:', error);
            this.showMessage('网络错误', 'error');
        }
    }

    async unlinkNote(projectId, noteId) {
        try {
            const response = await fetch(`/api/projects/${projectId}/unlink-note`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ noteId: noteId })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('笔记关联已取消', 'success');
                // 刷新项目详情
                this.showProjectDetail(projectId);
            } else {
                this.showMessage(data.error || '取消关联失败', 'error');
            }
        } catch (error) {
            console.error('取消笔记关联时发生错误:', error);
            this.showMessage('网络错误', 'error');
        }
    }

    async unlinkTodo(projectId, notebookId, todoId) {
        try {
            const response = await fetch(`/api/projects/${projectId}/unlink-todo`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    notebookId: notebookId,
                    todoId: todoId 
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('任务关联已取消', 'success');
                // 刷新项目详情
                this.showProjectDetail(projectId);
            } else {
                this.showMessage(data.error || '取消关联失败', 'error');
            }
        } catch (error) {
            console.error('取消任务关联时发生错误:', error);
            this.showMessage('网络错误', 'error');
        }
    }

    onViewActivated() {
        // 当项目视图被激活时调用
        this.loadProjects();
    }

    getStatusText(status) {
        const statusMap = {
            'pending': '📝 待开始',
            'in_progress': '🚀 进行中',
            'completed': '✅ 已完成'
        };
        return statusMap[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    showMessage(message, type = 'info') {
        // 创建消息提示
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${this.escapeHtml(message)}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => toast.classList.add('show'), 100);
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }



    // 新增方法：将待办事项关联到项目
    async linkTodoToProject(projectId, notebookId, todoId) {
        try {
            const response = await fetch(`/api/projects/${projectId}/link-todo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notebookId: notebookId,
                    todoId: todoId
                })
            });
            
            if (!response.ok) {
                console.error('关联待办事项到项目失败');
            }
        } catch (error) {
            console.error('关联待办事项到项目时发生错误:', error);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 习惯追踪器
class HabitTracker {
    constructor() {
        this.habits = [];
        this.currentHabit = null;
        this.timer = {
            minutes: 25,
            seconds: 0,
            isRunning: false,
            intervalId: null
        };
        this.storageKey = 'habits_data';
        
        // DOM 元素
        this.habitNameInput = null;
        this.createHabitBtn = null;
        this.habitsGrid = null;
        this.habitListPage = null;
        this.habitDetailPage = null;
        this.backToHabitsBtn = null;
        this.currentHabitName = null;
        this.totalTimeDisplay = null;
        this.habitTimer = null;
        this.startHabitTimerBtn = null;
        this.pauseHabitTimerBtn = null;
        this.resetHabitTimerBtn = null;
        this.editHabitBtn = null;
        this.deleteHabitBtn = null;
        this.habitEditModal = null;
        this.habitEditInput = null;
        this.habitEditConfirm = null;
        this.habitEditCancel = null;
        this.checkinToast = null;
    }

    init() {
        this.bindDOMElements();
        if (this.checkElementsExist()) {
            this.loadHabits();
            this.bindEvents();
            this.renderHabits();
        } else {
            console.warn('HabitTracker: 部分DOM元素未找到，跳过初始化');
        }
    }

    bindDOMElements() {
        this.habitNameInput = document.getElementById('habit-name-input');
        this.createHabitBtn = document.getElementById('create-habit-btn');
        this.habitsGrid = document.getElementById('habits-grid');
        this.habitListPage = document.getElementById('habit-list-page');
        this.habitDetailPage = document.getElementById('habit-detail-page');
        this.backToHabitsBtn = document.getElementById('back-to-habits');
        this.currentHabitName = document.getElementById('current-habit-name');
        this.totalTimeDisplay = document.getElementById('total-time-display');
        this.habitTimer = document.getElementById('habit-timer');
        this.startHabitTimerBtn = document.getElementById('start-habit-timer');
        this.pauseHabitTimerBtn = document.getElementById('pause-habit-timer');
        this.resetHabitTimerBtn = document.getElementById('reset-habit-timer');
        this.editHabitBtn = document.getElementById('edit-habit-btn');
        this.deleteHabitBtn = document.getElementById('delete-habit-btn');
        this.habitEditModal = document.getElementById('habit-edit-modal');
        this.habitEditInput = document.getElementById('habit-edit-input');
        this.habitEditConfirm = document.getElementById('habit-edit-confirm');
        this.habitEditCancel = document.getElementById('habit-edit-cancel');
        this.checkinToast = document.getElementById('checkin-toast');
    }

    checkElementsExist() {
        const requiredElements = [
            'habitNameInput', 'createHabitBtn', 'habitsGrid', 'habitListPage', 
            'habitDetailPage', 'backToHabitsBtn', 'currentHabitName', 
            'totalTimeDisplay', 'habitTimer', 'startHabitTimerBtn', 
            'pauseHabitTimerBtn', 'resetHabitTimerBtn', 'editHabitBtn', 
            'deleteHabitBtn', 'habitEditModal', 'habitEditInput', 
            'habitEditConfirm', 'habitEditCancel', 'checkinToast'
        ];
        
        const missingElements = [];
        
        for (const elementName of requiredElements) {
            if (!this[elementName]) {
                missingElements.push(elementName);
            }
        }
        
        if (missingElements.length > 0) {
            console.error('HabitTracker: 缺少以下DOM元素:', missingElements);
            return false;
        }
        
        return true;
    }

    loadHabits() {
        const savedHabits = localStorage.getItem(this.storageKey);
        if (savedHabits) {
            this.habits = JSON.parse(savedHabits);
        } else {
            this.habits = [];
        }
    }

    saveHabits() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.habits));
    }

    bindEvents() {
        // 只有当元素存在时才添加事件监听器
        if (this.createHabitBtn && this.habitNameInput) {
            // 创建习惯
            this.createHabitBtn.addEventListener('click', () => this.createHabit());
            this.habitNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.createHabit();
            });
        }

        if (this.backToHabitsBtn) {
            // 返回习惯列表
            this.backToHabitsBtn.addEventListener('click', () => this.showHabitList());
        }

        if (this.startHabitTimerBtn && this.pauseHabitTimerBtn && this.resetHabitTimerBtn) {
            // 计时器控制
            this.startHabitTimerBtn.addEventListener('click', () => this.startTimer());
            this.pauseHabitTimerBtn.addEventListener('click', () => this.pauseTimer());
            this.resetHabitTimerBtn.addEventListener('click', () => this.resetTimer());
        }

        if (this.editHabitBtn && this.deleteHabitBtn) {
            // 编辑和删除习惯
            this.editHabitBtn.addEventListener('click', () => this.showEditModal());
            this.deleteHabitBtn.addEventListener('click', () => this.deleteCurrentHabit());
        }

        if (this.habitEditConfirm && this.habitEditCancel && this.habitEditInput && this.habitEditModal) {
            // 编辑模态框
            this.habitEditConfirm.addEventListener('click', () => this.confirmEdit());
            this.habitEditCancel.addEventListener('click', () => this.hideEditModal());
            this.habitEditInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.confirmEdit();
            });

            // 点击模态框外部关闭
            this.habitEditModal.addEventListener('click', (e) => {
                if (e.target === this.habitEditModal) this.hideEditModal();
            });
        }
    }

    createHabit() {
        const name = this.habitNameInput.value.trim();
        if (!name) return;

        const habit = {
            id: Date.now(),
            name: name,
            total_minutes: 0,
            createdAt: new Date().toISOString()
        };

        this.habits.push(habit);
        this.saveHabits();
        this.renderHabits();
        this.habitNameInput.value = '';
    }

    renderHabits() {
        if (!this.habitsGrid) return;

        this.habitsGrid.innerHTML = '';

        if (this.habits.length === 0) {
            this.habitsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #9b9a97;">
                    <p>还没有创建任何习惯</p>
                    <p>开始创建你的第一个习惯吧！</p>
                </div>
            `;
            return;
        }

        this.habits.forEach(habit => {
            const habitCard = document.createElement('div');
            habitCard.className = 'habit-card';
            habitCard.innerHTML = `
                <div class="habit-card-header">
                    <h3 class="habit-name">${this.escapeHtml(habit.name)}</h3>
                    <div class="habit-actions">
                        <button class="action-btn edit-habit" data-id="${habit.id}" title="编辑">✏️</button>
                        <button class="action-btn delete-habit" data-id="${habit.id}" title="删除">🗑️</button>
                    </div>
                </div>
                <div class="habit-total-time">${this.formatTime(habit.total_minutes)}</div>
                <div class="habit-time-label">累计时长</div>
            `;

            // 点击卡片进入详情页
            habitCard.addEventListener('click', (e) => {
                if (!e.target.classList.contains('action-btn')) {
                    this.showHabitDetail(habit);
                }
            });

            // 编辑按钮
            const editBtn = habitCard.querySelector('.edit-habit');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.currentHabit = habit;
                this.showEditModal();
            });

            // 删除按钮
            const deleteBtn = habitCard.querySelector('.delete-habit');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteHabit(habit.id);
            });

            this.habitsGrid.appendChild(habitCard);
        });
    }

    showHabitDetail(habit) {
        this.currentHabit = habit;
        if (this.currentHabitName) {
            this.currentHabitName.textContent = habit.name;
        }
        if (this.totalTimeDisplay) {
            this.totalTimeDisplay.textContent = this.formatTime(habit.total_minutes);
        }
        
        // 重置计时器
        this.resetTimer();
        
        // 切换到详情页
        if (this.habitListPage) {
            this.habitListPage.classList.remove('active');
        }
        if (this.habitDetailPage) {
            this.habitDetailPage.classList.add('active');
        }
    }

    showHabitList() {
        // 如果计时器正在运行，先暂停
        if (this.timer.isRunning) {
            this.pauseTimer();
        }
        
        if (this.habitDetailPage) {
            this.habitDetailPage.classList.remove('active');
        }
        if (this.habitListPage) {
            this.habitListPage.classList.add('active');
        }
        this.currentHabit = null;
    }

    startTimer() {
        if (this.timer.isRunning) return;

        this.timer.isRunning = true;
        
        this.timer.intervalId = setInterval(() => {
            if (this.timer.seconds > 0) {
                this.timer.seconds--;
            } else if (this.timer.minutes > 0) {
                this.timer.minutes--;
                this.timer.seconds = 59;
            } else {
                // 计时器结束
                this.completeSession();
                return;
            }
            this.updateTimerDisplay();
        }, 1000);

        this.updateTimerButtons();
    }

    pauseTimer() {
        if (!this.timer.isRunning) return;

        clearInterval(this.timer.intervalId);
        this.timer.isRunning = false;
        this.updateTimerButtons();
    }

    resetTimer() {
        if (this.timer.isRunning) {
            clearInterval(this.timer.intervalId);
            this.timer.isRunning = false;
        }
        
        this.timer.minutes = 25;
        this.timer.seconds = 0;
        this.updateTimerDisplay();
        this.updateTimerButtons();
    }

    completeSession() {
        clearInterval(this.timer.intervalId);
        this.timer.isRunning = false;
        
        // 更新习惯总时长（增加25分钟）
        this.currentHabit.total_minutes += 25;
        
        // 更新habits数组中的对应项
        const habitIndex = this.habits.findIndex(h => h.id === this.currentHabit.id);
        if (habitIndex !== -1) {
            this.habits[habitIndex] = this.currentHabit;
        }
        
        this.saveHabits();
        if (this.totalTimeDisplay) {
            this.totalTimeDisplay.textContent = this.formatTime(this.currentHabit.total_minutes);
        }
        
        // 显示打卡成功提示
        this.showCheckinToast();
        
        // 重置计时器
        this.resetTimer();
    }

    updateTimerDisplay() {
        if (this.habitTimer) {
            this.habitTimer.textContent = `${this.timer.minutes.toString().padStart(2, '0')}:${this.timer.seconds.toString().padStart(2, '0')}`;
        }
    }

    updateTimerButtons() {
        if (this.startHabitTimerBtn) {
            this.startHabitTimerBtn.style.display = this.timer.isRunning ? 'none' : 'block';
        }
        if (this.pauseHabitTimerBtn) {
            this.pauseHabitTimerBtn.style.display = this.timer.isRunning ? 'block' : 'none';
        }
    }

    showEditModal() {
        if (!this.currentHabit || !this.habitEditInput || !this.habitEditModal) return;
        
        this.habitEditInput.value = this.currentHabit.name;
        this.habitEditModal.classList.add('show');
        this.habitEditInput.focus();
    }

    hideEditModal() {
        if (this.habitEditModal) {
            this.habitEditModal.classList.remove('show');
        }
    }

    confirmEdit() {
        if (!this.habitEditInput || !this.currentHabit) return;
        
        const newName = this.habitEditInput.value.trim();
        if (!newName) return;

        this.currentHabit.name = newName;
        
        // 更新habits数组中的对应项
        const habitIndex = this.habits.findIndex(h => h.id === this.currentHabit.id);
        if (habitIndex !== -1) {
            this.habits[habitIndex] = this.currentHabit;
        }
        
        this.saveHabits();
        if (this.currentHabitName) {
            this.currentHabitName.textContent = newName;
        }
        this.renderHabits();
        this.hideEditModal();
    }

    deleteCurrentHabit() {
        if (!this.currentHabit) return;
        
        if (confirm(`确定要删除习惯"${this.currentHabit.name}"吗？此操作不可撤销。`)) {
            this.deleteHabit(this.currentHabit.id);
            this.showHabitList();
        }
    }

    deleteHabit(habitId) {
        if (confirm('确定要删除这个习惯吗？此操作不可撤销。')) {
            this.habits = this.habits.filter(h => h.id !== habitId);
            this.saveHabits();
            this.renderHabits();
        }
    }

    showCheckinToast() {
        if (this.checkinToast) {
            this.checkinToast.classList.add('show');
            setTimeout(() => {
                this.checkinToast.classList.remove('show');
            }, 3000);
        }
    }

    showMessage(message, type = 'info') {
        // 简单的消息提示
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.innerHTML = `
            <div class="toast-content" style="background-color: ${type === 'warning' ? '#ffc107' : '#28a745'}; color: ${type === 'warning' ? '#212529' : 'white'};">
                <span class="toast-icon">${type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes}分钟`;
        }
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (remainingMinutes === 0) {
            return `${hours}小时`;
        }
        
        return `${hours}小时${remainingMinutes}分钟`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 笔记本管理器
class NotebookManager {
    constructor() {
        this.notebooks = [];
        this.currentNotebookId = null;
        this.storageKey = 'notebooks_data';
        this.currentNotebookKey = 'current_notebook_id';
        
        // DOM 元素
        this.notebookList = null;
        this.addNotebookBtn = null;
        this.addNotebookContainer = null;  // 新增容器
        this.currentNotebookTitle = null;
        this.renameNotebookBtn = null;
        this.deleteNotebookBtn = null;
        this.notepadTextarea = null;
        this.modal = null;
        this.modalTitle = null;
        this.notebookNameInput = null;
        this.notebookProjectSelect = null;  // 新增
        this.modalConfirm = null;
        this.modalCancel = null;
        
        this.isRenaming = false;
        this.renamingNotebookId = null;
        this.sketchAddButton = null;  // 新增SketchButton实例
    }

    init() {
        this.bindDOMElements();
        if (!this.checkElementsExist()) {
            console.error('NotebookManager: 必要的DOM元素不存在');
            return;
        }
        this.loadNotebooks();
        this.bindEvents();
        this.renderNotebooks();
        this.selectCurrentNotebook();
        
        // 创建并渲染SketchButton
        this.createSketchButton();
    }

    bindDOMElements() {
        this.notebookList = document.getElementById('notebook-list');
        this.addNotebookContainer = document.getElementById('add-notebook-container');  // 修改为容器
        this.currentNotebookTitle = document.getElementById('current-notebook-title');
        this.renameNotebookBtn = document.getElementById('rename-notebook');
        this.deleteNotebookBtn = document.getElementById('delete-notebook');
        this.notepadTextarea = document.getElementById('notepad');
        this.modal = document.getElementById('notebook-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.notebookNameInput = document.getElementById('notebook-name');
        this.notebookProjectSelect = document.getElementById('notebook-project');
        this.modalConfirm = document.getElementById('modal-confirm');
        this.modalCancel = document.getElementById('modal-cancel');
    }
    
    checkElementsExist() {
        const requiredElements = [
            'notebookList', 'addNotebookContainer', 'currentNotebookTitle', 
            'renameNotebookBtn', 'deleteNotebookBtn', 'notepadTextarea',
            'modal', 'modalTitle', 'notebookNameInput', 'modalConfirm', 'modalCancel'
        ];
        
        return requiredElements.every(elementName => {
            if (!this[elementName]) {
                console.error(`NotebookManager: ${elementName} 元素未找到`);
                return false;
            }
            return true;
        });
    }
    
    createSketchButton() {
        if (this.addNotebookContainer) {
            this.sketchAddButton = new SketchButton({
                text: 'New Note',
                className: 'sketch-add-btn',
                id: 'sketch-add-notebook',
                onClick: () => this.showCreateModal()
            });
            
            this.sketchAddButton.render(this.addNotebookContainer);
        }
    }

    loadNotebooks() {
        const savedNotebooks = localStorage.getItem(this.storageKey);
        const savedCurrentId = localStorage.getItem(this.currentNotebookKey);
        
        if (savedNotebooks) {
            this.notebooks = JSON.parse(savedNotebooks);
        } else {
            // 创建默认笔记本
            this.notebooks = [{
                id: Date.now(),
                name: '默认笔记本',
                content: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }];
            this.saveNotebooks();
        }
        
        this.currentNotebookId = savedCurrentId ? parseInt(savedCurrentId) : this.notebooks[0].id;
    }

    saveNotebooks() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.notebooks));
        localStorage.setItem(this.currentNotebookKey, this.currentNotebookId.toString());
    }

    bindEvents() {
        // 移除原来的addNotebookBtn事件绑定，因为现在使用SketchButton
        
        // 重命名笔记本
        this.renameNotebookBtn.addEventListener('click', () => this.showRenameModal());
        
        // 删除笔记本
        this.deleteNotebookBtn.addEventListener('click', () => this.deleteCurrentNotebook());
        
        // 模态框事件
        this.modalConfirm.addEventListener('click', () => this.handleModalConfirm());
        this.modalCancel.addEventListener('click', () => this.hideModal());
        
        // 回车键确认
        this.notebookNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleModalConfirm();
        });
        
        // 点击模态框外部关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hideModal();
        });
        
        // 自动保存笔记内容
        this.notepadTextarea.addEventListener('input', () => {
            this.saveCurrentNotebookContent();
        });
    }

    renderNotebooks() {
        this.notebookList.innerHTML = '';
        
        this.notebooks.forEach(notebook => {
            const notebookItem = document.createElement('div');
            notebookItem.className = 'notebook-item';
            notebookItem.dataset.id = notebook.id;
            
            if (notebook.id === this.currentNotebookId) {
                notebookItem.classList.add('active');
            }
            
            notebookItem.innerHTML = `<span class="notebook-name">${this.escapeHtml(notebook.name)}</span>`;
            
            notebookItem.addEventListener('click', () => this.selectNotebook(notebook.id));
            
            this.notebookList.appendChild(notebookItem);
        });
    }

    selectNotebook(notebookId) {
        // 保存当前笔记本内容
        this.saveCurrentNotebookContent();
        
        // 切换当前笔记本
        this.currentNotebookId = notebookId;
        this.saveNotebooks();
        
        // 更新UI
        this.renderNotebooks();
        this.selectCurrentNotebook();
        
        // 通知TodoList管理器切换笔记本
        if (window.appState && window.appState.todoListManager) {
            window.appState.todoListManager.switchNotebook(notebookId);
        }
    }

    selectCurrentNotebook() {
        const currentNotebook = this.notebooks.find(nb => nb.id === this.currentNotebookId);
        if (currentNotebook) {
            this.currentNotebookTitle.textContent = currentNotebook.name;
            this.notepadTextarea.value = currentNotebook.content || '';
        }
    }

    saveCurrentNotebookContent() {
        const currentNotebook = this.notebooks.find(nb => nb.id === this.currentNotebookId);
        if (currentNotebook) {
            currentNotebook.content = this.notepadTextarea.value;
            currentNotebook.updatedAt = new Date().toISOString();
            this.saveNotebooks();
        }
    }

    showCreateModal() {
        this.isRenaming = false;
        this.modalTitle.textContent = '新建笔记本';
        this.notebookNameInput.value = '';
        this.notebookNameInput.placeholder = '输入笔记本名称...';
        
        // 显示项目选择容器并填充项目选项
        const projectContainer = document.getElementById('notebook-project-selection');
        if (projectContainer) {
            projectContainer.style.display = 'block';
            this.populateProjectOptions();
        }
        
        this.showModal();
    }

    showRenameModal() {
        const notebook = this.notebooks.find(nb => nb.id === this.currentNotebookId);
        if (!notebook) return;
        
        this.isRenaming = true;
        this.renamingNotebookId = this.currentNotebookId;
        this.modalTitle.textContent = '重命名笔记本';
        this.notebookNameInput.value = notebook.name;
        this.notebookNameInput.placeholder = '输入新的笔记本名称...';
        
        // 隐藏项目选择容器（重命名时不需要）
        const projectContainer = document.getElementById('notebook-project-selection');
        if (projectContainer) {
            projectContainer.style.display = 'none';
        }
        
        this.showModal();
    }

    showModal() {
        this.modal.classList.add('show');
        this.notebookNameInput.focus();
        this.notebookNameInput.select();
    }

    hideModal() {
        this.modal.classList.remove('show');
        this.notebookNameInput.value = '';
        this.isRenaming = false;
        this.renamingNotebookId = null;
    }

    handleModalConfirm() {
        const name = this.notebookNameInput.value.trim();
        if (!name) return;
        
        if (this.isRenaming) {
            this.renameNotebook(this.renamingNotebookId, name);
        } else {
            this.createNotebook(name);
        }
        
        this.hideModal();
    }

    createNotebook(name) {
        const selectedProjectId = this.notebookProjectSelect?.value || null;
        
        const newNotebook = {
            id: Date.now(),
            name: name,
            content: '',
            projectId: selectedProjectId ? parseInt(selectedProjectId) : null,  // 新增项目关联
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.notebooks.push(newNotebook);
        this.saveNotebooks();
        this.renderNotebooks();
        this.selectNotebook(newNotebook.id);
        
        // 如果关联了项目，同步到后端
        if (newNotebook.projectId) {
            this.linkNotebookToProject(newNotebook.id, newNotebook.projectId);
        }
    }

    // 新增方法：填充项目选项
    async populateProjectOptions() {
        if (!this.notebookProjectSelect) return;
        
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            
            if (response.ok && data.projects) {
                const options = data.projects.map(project => 
                    `<option value="${project.id}">${this.escapeHtml(project.title)}</option>`
                ).join('');
                
                this.notebookProjectSelect.innerHTML = `
                    <option value="">无关联项目</option>
                    ${options}
                `;
            }
        } catch (error) {
            console.error('获取项目列表失败:', error);
        }
    }

    // 新增方法：将笔记本关联到项目
    async linkNotebookToProject(notebookId, projectId) {
        try {
            const response = await fetch(`/api/projects/${projectId}/link-note`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    noteId: notebookId
                })
            });
            
            if (!response.ok) {
                console.error('关联笔记本到项目失败');
            }
        } catch (error) {
            console.error('关联笔记本到项目时发生错误:', error);
        }
    }

    renameNotebook(notebookId, newName) {
        const notebook = this.notebooks.find(nb => nb.id === notebookId);
        if (notebook) {
            notebook.name = newName;
            notebook.updatedAt = new Date().toISOString();
            this.saveNotebooks();
            this.renderNotebooks();
            this.selectCurrentNotebook();
        }
    }

    deleteCurrentNotebook() {
        if (this.notebooks.length <= 1) {
            alert('至少需要保留一个笔记本');
            return;
        }
        
        const notebook = this.notebooks.find(nb => nb.id === this.currentNotebookId);
        if (!notebook) return;
        
        if (confirm(`确定要删除笔记本 "${notebook.name}" 吗？此操作不可撤销。`)) {
            this.notebooks = this.notebooks.filter(nb => nb.id !== this.currentNotebookId);
            
            // 切换到第一个笔记本
            const firstNotebook = this.notebooks[0];
            this.currentNotebookId = firstNotebook.id;
            
            this.saveNotebooks();
            this.renderNotebooks();
            this.selectCurrentNotebook();
            
            // 通知TodoList管理器切换笔记本
            if (window.appState && window.appState.todoListManager) {
                window.appState.todoListManager.switchNotebook(this.currentNotebookId);
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCurrentNotebookId() {
        return this.currentNotebookId;
    }
}

// TodoList管理器
class TodoListManager {
    constructor() {
        this.todos = {}; // 按笔记本ID存储的todos
        this.storageKey = 'todos_by_notebook';
        this.todoInput = null;
        this.todoDeadline = null;
        this.todoProjectSelect = null;  // 新增
        this.addTodoBtn = null;
        this.todoList = null;
        this.currentNotebookId = null;
    }

    async init() {
        this.bindDOMElements();
        this.loadTodos();
        this.bindEvents();
        await this.populateProjectOptions();  // 新增：初始化时填充项目选项
    }

    bindDOMElements() {
        this.todoInput = document.getElementById('todo-input');
        this.todoDeadline = document.getElementById('todo-deadline');
        this.todoProjectSelect = document.getElementById('todo-project-select');  // 新增
        this.addTodoBtn = document.getElementById('add-todo');
        this.todoList = document.getElementById('todo-list');
    }

    loadTodos() {
        const savedTodos = localStorage.getItem(this.storageKey);
        this.todos = savedTodos ? JSON.parse(savedTodos) : {};
    }

    saveTodos() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
    }

    bindEvents() {
        this.addTodoBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
    }

    // 新增方法：填充项目选项
    async populateProjectOptions() {
        if (!this.todoProjectSelect) return;
        
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            
            if (response.ok && data.projects) {
                const options = data.projects.map(project => 
                    `<option value="${project.id}">${this.escapeHtml(project.title)}</option>`
                ).join('');
                
                this.todoProjectSelect.innerHTML = `
                    <option value="">无关联项目</option>
                    ${options}
                `;
            }
        } catch (error) {
            console.error('获取项目列表失败:', error);
        }
    }

    // 新增方法：填充项目选项
    async populateProjectOptions() {
        if (!this.todoProjectSelect) return;
        
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            
            if (response.ok && data.projects) {
                const options = data.projects.map(project => 
                    `<option value="${project.id}">${this.escapeHtml(project.title)}</option>`
                ).join('');
                
                this.todoProjectSelect.innerHTML = `
                    <option value="">无关联项目</option>
                    ${options}
                `;
            }
        } catch (error) {
            console.error('获取项目列表失败:', error);
        }
    }

    switchNotebook(notebookId) {
        this.currentNotebookId = notebookId;
        this.renderTodos();
    }

    getCurrentTodos() {
        return this.todos[this.currentNotebookId] || [];
    }

    setCurrentTodos(todos) {
        this.todos[this.currentNotebookId] = todos;
        this.saveTodos();
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const selectedProjectId = this.todoProjectSelect?.value || null;
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            deadline: this.todoDeadline.value || null,
            projectId: selectedProjectId ? parseInt(selectedProjectId) : null,  // 新增项目关联
            createdAt: new Date().toISOString()
        };

        const currentTodos = this.getCurrentTodos();
        currentTodos.push(todo);
        this.setCurrentTodos(currentTodos);
        
        this.todoInput.value = '';
        this.todoDeadline.value = '';
        if (this.todoProjectSelect) this.todoProjectSelect.value = '';  // 重置项目选择
        this.renderTodos();
        
        // 如果关联了项目，同步到后端
        if (todo.projectId && this.currentNotebookId) {
            this.linkTodoToProject(todo.projectId, this.currentNotebookId, todo.id);
        }
    }

    toggleTodo(id) {
        const currentTodos = this.getCurrentTodos();
        const todo = currentTodos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.setCurrentTodos(currentTodos);
            this.renderTodos();
        }
    }

    deleteTodo(id) {
        const currentTodos = this.getCurrentTodos().filter(t => t.id !== id);
        this.setCurrentTodos(currentTodos);
        this.renderTodos();
    }

    renderTodos() {
        if (!this.todoList) return;
        
        const currentTodos = this.getCurrentTodos();
        const sortedTodos = this.sortTodos([...currentTodos]);
        
        this.todoList.innerHTML = '';
        
        sortedTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            
            const deadlineInfo = this.getDeadlineInfo(todo.deadline);
            const deadlineHtml = todo.deadline ? 
                `<div class="todo-deadline ${deadlineInfo.class}">
                    📅 ${deadlineInfo.text}
                </div>` : '';
            
            // 新增：显示关联的项目信息
            const projectHtml = todo.projectId ? 
                `<div class="todo-project">
                    🔗 已关联项目
                </div>` : '';
            
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <div class="todo-content">
                    <div class="todo-text ${todo.completed ? 'completed' : ''}">${this.escapeHtml(todo.text)}</div>
                    ${deadlineHtml}
                    ${projectHtml}
                </div>
                <button class="todo-delete">×</button>
            `;
            
            const checkbox = li.querySelector('.todo-checkbox');
            const deleteBtn = li.querySelector('.todo-delete');
            
            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
            
            this.todoList.appendChild(li);
        });
    }

    sortTodos(todos) {
        return todos.sort((a, b) => {
            // 未完成的在前
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // 有截止日期的在前
            if (a.deadline && !b.deadline) return -1;
            if (!a.deadline && b.deadline) return 1;
            
            // 都有截止日期，按日期排序
            if (a.deadline && b.deadline) {
                return new Date(a.deadline) - new Date(b.deadline);
            }
            
            // 都没有截止日期，按创建时间排序
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    getDeadlineInfo(deadline) {
        if (!deadline) return { text: '', class: '' };
        
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return {
                text: `已逾期 ${Math.abs(diffDays)} 天`,
                class: 'overdue'
            };
        } else if (diffDays === 0) {
            return {
                text: '今天到期',
                class: 'today'
            };
        } else if (diffDays === 1) {
            return {
                text: '明天到期',
                class: 'upcoming'
            };
        } else {
            return {
                text: `${diffDays} 天后到期`,
                class: 'upcoming'
            };
        }
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('zh-CN', {
            month: 'short', day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 番茄钟计时器
class PomodoroTimer {
    constructor() {
        this.workTime = 25;
        this.breakTime = 5;
        this.currentTime = this.workTime * 60;
        this.isRunning = false;
        this.isWorkSession = true;
        this.intervalId = null;
        
        this.timerDisplay = null;
        this.startBtn = null;
        this.pauseBtn = null;
        this.resetBtn = null;
        this.workTimeInput = null;
        this.breakTimeInput = null;
        
        this.storageKey = 'pomodoro_settings';
    }

    init() {
        this.bindDOMElements();
        this.loadSettings();
        this.bindEvents();
        this.updateDisplay();
        this.requestNotificationPermission();
    }

    bindDOMElements() {
        this.timerDisplay = document.getElementById('timer');
        this.startBtn = document.getElementById('start-timer');
        this.pauseBtn = document.getElementById('pause-timer');
        this.resetBtn = document.getElementById('reset-timer');
        this.workTimeInput = document.getElementById('work-time');
        this.breakTimeInput = document.getElementById('break-time');
    }

    loadSettings() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            const settings = JSON.parse(saved);
            this.workTime = settings.workTime || 25;
            this.breakTime = settings.breakTime || 5;
            this.workTimeInput.value = this.workTime;
            this.breakTimeInput.value = this.breakTime;
            this.currentTime = this.workTime * 60;
        }
    }

    saveSettings() {
        const settings = {
            workTime: this.workTime,
            breakTime: this.breakTime
        };
        localStorage.setItem(this.storageKey, JSON.stringify(settings));
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        this.workTimeInput.addEventListener('change', () => {
            this.workTime = parseInt(this.workTimeInput.value) || 25;
            this.saveSettings();
            if (!this.isRunning && this.isWorkSession) {
                this.currentTime = this.workTime * 60;
                this.updateDisplay();
            }
        });
        
        this.breakTimeInput.addEventListener('change', () => {
            this.breakTime = parseInt(this.breakTimeInput.value) || 5;
            this.saveSettings();
            if (!this.isRunning && !this.isWorkSession) {
                this.currentTime = this.breakTime * 60;
                this.updateDisplay();
            }
        });
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    start() {
        this.isRunning = true;
        this.intervalId = setInterval(() => this.tick(), 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.intervalId);
    }

    reset() {
        this.pause();
        this.currentTime = this.isWorkSession ? this.workTime * 60 : this.breakTime * 60;
        this.updateDisplay();
    }

    tick() {
        this.currentTime--;
        this.updateDisplay();
        
        if (this.currentTime <= 0) {
            this.pause();
            this.showNotification();
            this.isWorkSession = !this.isWorkSession;
            this.currentTime = this.isWorkSession ? this.workTime * 60 : this.breakTime * 60;
            this.updateDisplay();
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    showNotification() {
        const message = this.isWorkSession ? '休息时间结束，开始工作！' : '工作时间结束，该休息了！';
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('番茄钟提醒', { body: message });
        }
    }
}

// AI聊天管理器
class AIChatManager {
    constructor() {
        this.chatInput = null;
        this.chatSendButton = null;
        this.chatMessages = null;
        this.modelSelect = null; // 模型选择下拉菜单
        this.topicSidebar = null; // 新增：话题侧栏容器
        this.newTopicButton = null; // 新增：新建话题按钮
        this.topicList = null; // 新增：话题列表容器
        
        // 新的数据结构
        this.conversations = []; // 所有话题的数组
        this.currentTopicId = null; // 当前选中的话题ID
    }

    init() {
        this.bindDOMElements();
        if (this.checkElementsExist()) {
            this.loadConversations(); // 修改：加载所有话题
            this.bindEvents();
            this.renderTopicSidebar(); // 新增：渲染话题侧栏
            this.renderChatWindow(); // 修改：渲染当前话题的聊天窗口
        } else {
            console.error('AIChatManager初始化失败：部分DOM元素不存在');
        }
    }

    bindDOMElements() {
        this.chatInput = document.getElementById('chat-input');
        this.chatSendButton = document.getElementById('send-chat');
        this.chatMessages = document.getElementById('chat-messages');
        this.modelSelect = document.getElementById('ai-model-select');
        
        // 新增：绑定话题侧栏元素
        this.topicSidebar = document.querySelector('.topic-sidebar');
        this.newTopicButton = document.getElementById('new-topic-btn');
        this.topicList = document.getElementById('topic-list');
    }
    
    // 检查所有必要的DOM元素是否存在
    checkElementsExist() {
        if (!this.chatInput) {
            console.error('缺少聊天输入框元素');
            return false;
        }
        if (!this.chatSendButton) {
            console.error('缺少发送按钮元素');
            return false;
        }
        if (!this.chatMessages) {
            console.error('缺少聊天消息容器元素');
            return false;
        }
        if (!this.modelSelect) {
            console.error('缺少模型选择元素');
            return false;
        }
        if (!this.topicSidebar) {
            console.error('缺少话题侧栏容器元素');
            return false;
        }
        if (!this.newTopicButton) {
            console.error('缺少新建话题按钮元素');
            return false;
        }
        if (!this.topicList) {
            console.error('缺少话题列表容器元素');
            return false;
        }
        return true;
    }

    // 修改：加载所有话题
    loadConversations() {
        const savedConversations = localStorage.getItem('aiConversations');
        if (savedConversations) {
            try {
                this.conversations = JSON.parse(savedConversations);
                // 如果有话题，选择第一个作为当前话题
                if (this.conversations.length > 0) {
                    this.currentTopicId = this.conversations[0].id;
                } else {
                    // 如果没有话题，创建一个默认话题
                    this.createNewTopic();
                }
            } catch (e) {
                console.error('Failed to parse saved conversations:', e);
                this.conversations = [];
                this.createNewTopic();
            }
        } else {
            // 兼容旧版数据结构
            this.migrateOldData();
        }
    }

    // 迁移旧版数据结构到新版
    migrateOldData() {
        const savedMessages = localStorage.getItem('aiChatMessages');
        if (savedMessages) {
            try {
                const oldMessages = JSON.parse(savedMessages);
                if (oldMessages.length > 0) {
                    // 创建一个默认话题，包含所有旧消息
                    const defaultTopic = {
                        id: 'topic-' + Date.now(),
                        title: '历史对话',
                        messages: oldMessages,
                        createdAt: new Date().toISOString()
                    };
                    this.conversations = [defaultTopic];
                    this.currentTopicId = defaultTopic.id;
                } else {
                    this.createNewTopic();
                }
            } catch (e) {
                console.error('Failed to migrate old data:', e);
                this.createNewTopic();
            }
        } else {
            this.createNewTopic();
        }
        this.saveConversations();
    }

    // 保存所有话题
    saveConversations() {
        localStorage.setItem('aiConversations', JSON.stringify(this.conversations));
    }

    // 创建新话题
    createNewTopic() {
        const newTopic = {
            id: 'topic-' + Date.now(),
            title: '新对话',
            messages: [],
            createdAt: new Date().toISOString()
        };
        this.conversations.unshift(newTopic); // 添加到数组开头
        this.currentTopicId = newTopic.id;
        this.saveConversations();
        return newTopic;
    }

    // 获取当前话题
    getCurrentTopic() {
        return this.conversations.find(topic => topic.id === this.currentTopicId) || this.createNewTopic();
    }

    // 获取当前话题的消息
    getCurrentMessages() {
        const currentTopic = this.getCurrentTopic();
        return currentTopic ? currentTopic.messages : [];
    }

    bindEvents() {
        this.chatSendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 新增：绑定新建话题按钮事件
        this.newTopicButton.addEventListener('click', () => {
            const newTopic = this.createNewTopic();
            this.renderTopicSidebar();
            this.renderChatWindow();
        });
        
        // 添加话题侧栏切换功能
        const sidebarToggle = document.querySelector('.topic-sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                const sidebar = document.querySelector('.topic-sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('collapsed');
                    
                    // 更新按钮文本
                    if (sidebar.classList.contains('collapsed')) {
                        sidebarToggle.textContent = '‹';
                    } else {
                        sidebarToggle.textContent = '›';
                    }
                }
            });
        }
        
        // 添加输入框自动调整高度的功能
        if (this.chatInput) {
            this.chatInput.addEventListener('input', function() {
                // 重置高度
                this.style.height = 'auto';
                // 设置新高度
                this.style.height = (this.scrollHeight) + 'px';
            });
            
            // 初始化高度
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = (this.chatInput.scrollHeight) + 'px';
        }
    }

    // 渲染话题侧栏
    renderTopicSidebar() {
        this.topicList.innerHTML = '';
        
        // 按创建时间倒序排列话题
        const sortedTopics = [...this.conversations].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        sortedTopics.forEach(topic => {
            const topicItem = document.createElement('div');
            topicItem.className = `topic-item ${topic.id === this.currentTopicId ? 'active' : ''}`;
            topicItem.dataset.topicId = topic.id;
            
            // 话题标题
            const titleElement = document.createElement('div');
            titleElement.className = 'topic-title';
            titleElement.textContent = topic.title;
            topicItem.appendChild(titleElement);
            
            // 话题操作按钮
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'topic-actions';
            
            // 编辑按钮
            const editButton = document.createElement('button');
            editButton.className = 'topic-action-btn';
            editButton.innerHTML = '✏️';
            editButton.title = '编辑';
            editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editTopic(topic.id);
            });
            actionsDiv.appendChild(editButton);
            
            // 删除按钮
            const deleteButton = document.createElement('button');
            deleteButton.className = 'topic-action-btn';
            deleteButton.innerHTML = '🗑️';
            deleteButton.title = '删除';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTopic(topic.id);
            });
            actionsDiv.appendChild(deleteButton);
            
            topicItem.appendChild(actionsDiv);
            
            // 点击话题切换
            topicItem.addEventListener('click', () => {
                this.switchTopic(topic.id);
            });
            
            this.topicList.appendChild(topicItem);
        });
    }

    // 渲染聊天窗口
    renderChatWindow() {
        this.chatMessages.innerHTML = '';
        
        const currentMessages = this.getCurrentMessages();
        
        currentMessages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${message.role}`;
            
            // 创建消息内容元素
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = message.content;
            messageDiv.appendChild(contentDiv);
            
            // 如果是AI回复，添加操作按钮
            if (message.role === 'assistant') {
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'message-actions';
                
                // 添加复制按钮
                const copyButton = document.createElement('button');
                copyButton.className = 'action-button copy-button';
                copyButton.innerHTML = '<i class="fas fa-copy"></i> 复制';
                copyButton.addEventListener('click', () => this.copyToClipboard(message.content));
                actionsDiv.appendChild(copyButton);
                
                // 添加保存为笔记按钮
                const saveButton = document.createElement('button');
                saveButton.className = 'action-button save-button';
                saveButton.innerHTML = '<i class="fas fa-save"></i> 保存为笔记';
                saveButton.addEventListener('click', () => this.saveAsNote(message.content));
                actionsDiv.appendChild(saveButton);
                
                messageDiv.appendChild(actionsDiv);
            }
            
            this.chatMessages.appendChild(messageDiv);
        });
        
        this.scrollToBottom();
    }

    // 修改发送消息方法，支持上下文记忆
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // 清空输入框
        this.chatInput.value = '';

        // 获取选中的模型
        const selectedModel = this.modelSelect ? this.modelSelect.value : 'anthropic/claude-3.5-sonnet';

        // 获取当前话题
        const currentTopic = this.getCurrentTopic();
        
        // 添加用户消息到当前话题
        currentTopic.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        this.saveConversations();
        this.renderChatWindow();
        this.scrollToBottom();

        // 显示加载中消息
        const loadingId = this.addLoadingMessage();

        try {
            // 如果是新话题的第一条消息，触发智能命名
            const isFirstMessage = currentTopic.messages.length === 1;
            if (isFirstMessage) {
                this.generateTopicTitle(currentTopic.id, message);
            }

            // 准备发送给API的消息历史
            const messageHistory = currentTopic.messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    messages: messageHistory,
                    model: selectedModel
                })
            });

            const data = await response.json();
            
            // 移除加载消息
            this.removeLoadingMessage(loadingId);

            if (data.response) {
                // 添加AI回复到当前话题
                currentTopic.messages.push({
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date().toISOString()
                });
            } else {
                // 添加错误消息
                currentTopic.messages.push({
                    role: 'assistant',
                    content: '抱歉，我现在无法回复。请稍后再试。',
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.removeLoadingMessage(loadingId);
            currentTopic.messages.push({
                role: 'assistant',
                content: '网络连接出现问题，请检查网络后重试。',
                timestamp: new Date().toISOString()
            });
        }

        this.saveConversations();
        this.renderChatWindow();
        this.scrollToBottom();
    }

    addLoadingMessage() {
        const loadingId = 'loading-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message assistant';
        loadingDiv.id = loadingId;
        loadingDiv.innerHTML = '正在思考中...';
        this.chatMessages.appendChild(loadingDiv);
        this.scrollToBottom();
        return loadingId;
    }

    removeLoadingMessage(loadingId) {
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('已复制到剪贴板');
        }).catch(err => {
            console.error('复制失败:', err);
            this.showToast('复制失败，请重试');
        });
    }

    saveAsNote(content) {
        // 获取当前选中的笔记本
        const activeNotebook = window.appState.notebookManager.getActiveNotebook();
        if (!activeNotebook) {
            this.showToast('请先选择一个笔记本');
            return;
        }

        // 将AI回复添加到当前笔记本内容中
        const currentContent = activeNotebook.content || '';
        const timestamp = new Date().toLocaleString();
        const newContent = `${currentContent}\n\n--- AI回复 (${timestamp}) ---\n${content}\n---\n`;

        // 更新笔记本内容
        window.appState.notebookManager.updateNotebookContent(activeNotebook.id, newContent);
        this.showToast('已保存到笔记本');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // 显示toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 3秒后隐藏并移除toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // 切换话题
    switchTopic(topicId) {
        this.currentTopicId = topicId;
        this.renderTopicSidebar();
        this.renderChatWindow();
    }

    // 编辑话题
    editTopic(topicId) {
        const topic = this.conversations.find(t => t.id === topicId);
        if (!topic) return;
        
        const topicItem = this.topicList.querySelector(`[data-topic-id="${topicId}"]`);
        if (!topicItem) return;
        
        const titleElement = topicItem.querySelector('.topic-title');
        const originalTitle = titleElement.textContent;
        
        // 创建输入框
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.className = 'topic-edit-input';
        inputElement.value = originalTitle;
        inputElement.maxLength = 20;
        
        // 替换标题为输入框
        titleElement.replaceWith(inputElement);
        inputElement.focus();
        inputElement.select();
        
        // 处理输入框失焦和回车事件
        const handleEdit = () => {
            const newTitle = inputElement.value.trim();
            if (newTitle && newTitle !== originalTitle) {
                topic.title = newTitle;
                this.saveConversations();
            }
            this.renderTopicSidebar();
        };
        
        inputElement.addEventListener('blur', handleEdit);
        inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleEdit();
            }
        });
    }

    // 删除话题
    deleteTopic(topicId) {
        if (confirm('确定要删除此话题吗？')) {
            const index = this.conversations.findIndex(t => t.id === topicId);
            if (index !== -1) {
                this.conversations.splice(index, 1);
                
                // 如果删除的是当前话题，切换到第一个话题或创建新话题
                if (topicId === this.currentTopicId) {
                    if (this.conversations.length > 0) {
                        this.currentTopicId = this.conversations[0].id;
                    } else {
                        this.createNewTopic();
                    }
                }
                
                this.saveConversations();
                this.renderTopicSidebar();
                this.renderChatWindow();
            }
        }
    }

    // 智能话题命名
    async generateTopicTitle(topicId, firstMessage) {
        try {
            const response = await fetch('/api/generate-title', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: firstMessage })
            });

            const data = await response.json();
            
            if (data.title) {
                const topic = this.conversations.find(t => t.id === topicId);
                if (topic) {
                    topic.title = data.title;
                    this.saveConversations();
                    this.renderTopicSidebar();
                }
            }
        } catch (error) {
            console.error('Failed to generate topic title:', error);
        }
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// SketchButton 组件类
class SketchButton {
    constructor(options = {}) {
        this.text = options.text || '+';
        this.className = options.className || '';
        this.onClick = options.onClick || (() => {});
        this.id = options.id || '';
        this.element = null;
        
        this.createElement();
    }
    
    createElement() {
        this.element = document.createElement('button');
        this.element.className = `sketch-button ${this.className}`;
        this.element.textContent = this.text;
        
        if (this.id) {
            this.element.id = this.id;
        }
        
        this.element.addEventListener('click', this.onClick);
        
        return this.element;
    }
    
    render(container) {
        if (container && this.element) {
            container.appendChild(this.element);
        }
        return this.element;
    }
    
    setText(newText) {
        this.text = newText;
        if (this.element) {
            this.element.textContent = newText;
        }
    }
    
    setOnClick(newOnClick) {
        this.onClick = newOnClick;
        if (this.element) {
            this.element.removeEventListener('click', this.onClick);
            this.element.addEventListener('click', newOnClick);
        }
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// 周报生成器类
class WeeklyReportGenerator {
    constructor() {
        this.generateBtn = null;
        this.reportContent = null;
        this.reportModal = null;
        this.closeModalBtn = null;
        this.copyReportBtn = null;
        this.saveReportBtn = null;
        this.reportTitle = null;
        this.reportBody = null;
    }

    init() {
        this.bindDOMElements();
        if (this.checkElementsExist()) {
            this.bindEvents();
        } else {
            console.warn('WeeklyReportGenerator: 部分DOM元素未找到，跳过初始化');
        }
    }

    bindDOMElements() {
        this.generateBtn = document.getElementById('generate-weekly-report');
        this.reportContent = document.getElementById('report-content');
        this.reportModal = document.getElementById('weekly-report-modal');
        this.closeModalBtn = document.getElementById('close-report-modal');
        this.copyReportBtn = document.getElementById('copy-report');
        this.saveReportBtn = document.getElementById('save-report');
        this.reportTitle = document.getElementById('report-title');
        this.reportBody = document.getElementById('report-body');
    }

    checkElementsExist() {
        const requiredElements = [
            'generateBtn', 'reportContent', 'reportModal', 'closeModalBtn',
            'copyReportBtn', 'saveReportBtn', 'reportTitle', 'reportBody'
        ];
        
        const missingElements = requiredElements.filter(key => !this[key]);
        
        if (missingElements.length > 0) {
            console.error('WeeklyReportGenerator缺少DOM元素:', missingElements);
            return false;
        }
        
        return true;
    }

    bindEvents() {
        this.generateBtn?.addEventListener('click', () => this.generateWeeklyReport());
        this.closeModalBtn?.addEventListener('click', () => this.hideModal());
        this.copyReportBtn?.addEventListener('click', () => this.copyReport());
        this.saveReportBtn?.addEventListener('click', () => this.saveReport());
        
        // 点击模态框外部关闭
        this.reportModal?.addEventListener('click', (e) => {
            if (e.target === this.reportModal) {
                this.hideModal();
            }
        });
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.reportModal?.classList.contains('show')) {
                this.hideModal();
            }
        });
    }

    async generateWeeklyReport() {
        try {
            this.showLoadingState();
            
            // 收集数据
            const reportData = await this.collectWeeklyData();
            
            // 生成报告
            const report = await this.generateReportContent(reportData);
            
            // 显示报告
            this.displayReport(report);
            this.showModal();
            
        } catch (error) {
            console.error('生成周报时发生错误:', error);
            this.showMessage('生成周报失败，请重试', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    async collectWeeklyData() {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const data = {
            dateRange: {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0]
            },
            projects: [],
            habits: [],
            todos: [],
            notes: []
        };

        // 收集项目数据
        if (window.appState?.projectManager?.projects) {
            data.projects = window.appState.projectManager.projects.filter(project => {
                const updatedAt = new Date(project.updatedAt || project.createdAt);
                return updatedAt >= startDate && updatedAt <= endDate;
            });
        }

        // 收集习惯数据
        if (window.appState?.habitTracker?.habits) {
            data.habits = window.appState.habitTracker.habits.map(habit => ({
                name: habit.name,
                totalMinutes: habit.total_minutes || 0
            }));
        }

        // 收集待办事项数据
        if (window.appState?.todoListManager?.todos) {
            const allTodos = [];
            Object.values(window.appState.todoListManager.todos).forEach(notebookTodos => {
                notebookTodos.forEach(todo => {
                    const createdAt = new Date(todo.createdAt);
                    if (createdAt >= startDate && createdAt <= endDate) {
                        allTodos.push({
                            text: todo.text,
                            completed: todo.completed,
                            deadline: todo.deadline
                        });
                    }
                });
            });
            data.todos = allTodos;
        }

        // 收集笔记数据
        if (window.appState?.notebookManager?.notebooks) {
            data.notes = window.appState.notebookManager.notebooks.filter(notebook => {
                const updatedAt = new Date(notebook.updatedAt || notebook.createdAt);
                return updatedAt >= startDate && updatedAt <= endDate;
            }).map(notebook => ({
                name: notebook.name,
                wordCount: this.countWords(notebook.content || '')
            }));
        }

        return data;
    }

    async generateReportContent(data) {
        try {
            const response = await fetch('/api/generate-weekly-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (response.ok && result.report) {
                return result.report;
            } else {
                // 如果API失败，使用本地生成
                return this.generateLocalReport(data);
            }
        } catch (error) {
            console.error('API生成周报失败，使用本地生成:', error);
            return this.generateLocalReport(data);
        }
    }

    generateLocalReport(data) {
        const { dateRange, projects, habits, todos, notes } = data;
        
        let report = `# 周报 (${dateRange.start} 至 ${dateRange.end})\n\n`;
        
        // 项目进展
        report += `## 📋 项目进展\n\n`;
        if (projects.length > 0) {
            projects.forEach(project => {
                const statusText = this.getProjectStatusText(project.status);
                report += `- **${project.title}**: ${statusText}\n`;
            });
        } else {
            report += `本周无项目更新。\n`;
        }
        
        // 任务完成情况
        report += `\n## ✅ 任务完成情况\n\n`;
        if (todos.length > 0) {
            const completedTodos = todos.filter(todo => todo.completed);
            const totalTodos = todos.length;
            const completionRate = Math.round((completedTodos.length / totalTodos) * 100);
            
            report += `- 总任务数: ${totalTodos}\n`;
            report += `- 已完成: ${completedTodos.length}\n`;
            report += `- 完成率: ${completionRate}%\n\n`;
            
            if (completedTodos.length > 0) {
                report += `### 已完成任务:\n`;
                completedTodos.forEach(todo => {
                    report += `- ${todo.text}\n`;
                });
            }
        } else {
            report += `本周无新增任务。\n`;
        }
        
        // 习惯追踪
        report += `\n## 🎯 习惯追踪\n\n`;
        if (habits.length > 0) {
            habits.forEach(habit => {
                const timeText = this.formatTime(habit.totalMinutes);
                report += `- **${habit.name}**: ${timeText}\n`;
            });
        } else {
            report += `本周无习惯追踪记录。\n`;
        }
        
        // 笔记创作
        report += `\n## 📝 笔记创作\n\n`;
        if (notes.length > 0) {
            const totalWords = notes.reduce((sum, note) => sum + note.wordCount, 0);
            report += `- 更新笔记数: ${notes.length}\n`;
            report += `- 总字数: ${totalWords}\n\n`;
            
            report += `### 更新的笔记:\n`;
            notes.forEach(note => {
                report += `- **${note.name}**: ${note.wordCount} 字\n`;
            });
        } else {
            report += `本周无笔记更新。\n`;
        }
        
        // 总结
        report += `\n## 📊 本周总结\n\n`;
        report += `本周共完成了 ${todos.filter(t => t.completed).length} 个任务，`;
        report += `更新了 ${notes.length} 个笔记，`;
        report += `在习惯养成方面投入了 ${this.formatTime(habits.reduce((sum, h) => sum + h.totalMinutes, 0))}。\n\n`;
        
        if (projects.length > 0) {
            const completedProjects = projects.filter(p => p.status === 'completed').length;
            const inProgressProjects = projects.filter(p => p.status === 'in_progress').length;
            
            if (completedProjects > 0) {
                report += `🎉 恭喜完成了 ${completedProjects} 个项目！\n`;
            }
            if (inProgressProjects > 0) {
                report += `💪 目前有 ${inProgressProjects} 个项目正在进行中。\n`;
            }
        }
        
        return report;
    }

    displayReport(reportContent) {
        if (this.reportTitle && this.reportBody) {
            const lines = reportContent.split('\n');
            const title = lines[0].replace(/^#\s*/, '') || '周报';
            
            this.reportTitle.textContent = title;
            this.reportBody.innerHTML = this.markdownToHtml(reportContent);
        }
    }

    markdownToHtml(markdown) {
        return markdown
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.*)$/gm, '<p>$1</p>')
            .replace(/<p><h/g, '<h')
            .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
            .replace(/<p><ul>/g, '<ul>')
            .replace(/<\/ul><\/p>/g, '</ul>')
            .replace(/<p><\/p>/g, '');
    }

    showModal() {
        this.reportModal?.classList.add('show');
    }

    hideModal() {
        this.reportModal?.classList.remove('show');
    }

    showLoadingState() {
        if (this.generateBtn) {
            this.generateBtn.disabled = true;
            this.generateBtn.textContent = '生成中...';
        }
    }

    hideLoadingState() {
        if (this.generateBtn) {
            this.generateBtn.disabled = false;
            this.generateBtn.textContent = '生成周报';
        }
    }

    async copyReport() {
        try {
            const reportText = this.reportBody?.textContent || '';
            await navigator.clipboard.writeText(reportText);
            this.showMessage('周报已复制到剪贴板', 'success');
        } catch (error) {
            console.error('复制失败:', error);
            this.showMessage('复制失败，请重试', 'error');
        }
    }

    saveReport() {
        if (!window.appState?.notebookManager) {
            this.showMessage('笔记本管理器未初始化', 'error');
            return;
        }

        const reportText = this.reportBody?.textContent || '';
        const title = this.reportTitle?.textContent || '周报';
        
        // 创建新笔记本保存周报
        const timestamp = new Date().toLocaleDateString('zh-CN');
        const notebookName = `${title} - ${timestamp}`;
        
        try {
            // 这里需要调用NotebookManager的方法来创建新笔记本
            // 由于当前NotebookManager没有公开的创建方法，我们直接操作其数据
            const newNotebook = {
                id: Date.now(),
                name: notebookName,
                content: reportText,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            window.appState.notebookManager.notebooks.push(newNotebook);
            window.appState.notebookManager.saveNotebooks();
            window.appState.notebookManager.renderNotebooks();
            
            this.showMessage('周报已保存为笔记', 'success');
            this.hideModal();
        } catch (error) {
            console.error('保存周报失败:', error);
            this.showMessage('保存失败，请重试', 'error');
        }
    }

    getProjectStatusText(status) {
        const statusMap = {
            'pending': '待开始',
            'in_progress': '进行中',
            'completed': '已完成'
        };
        return statusMap[status] || status;
    }

    formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes}分钟`;
        }
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (remainingMinutes === 0) {
            return `${hours}小时`;
        }
        
        return `${hours}小时${remainingMinutes}分钟`;
    }

    countWords(text) {
        if (!text) return 0;
        // 简单的中英文字数统计
        const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
        return chineseChars + englishWords;
    }

    showMessage(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${this.escapeHtml(message)}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.appState = new AppState();
    window.appState.init();
});