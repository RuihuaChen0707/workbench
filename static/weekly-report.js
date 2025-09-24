// 周报生成器类
class WeeklyReportGenerator {
    constructor() {
        this.startDate = null;
        this.endDate = null;
        this.includeOptions = {
            notes: true,
            todos: true,
            projects: true,
            habits: true,
            aiChats: false
        };
        this.reportData = null;
    }

    init() {
        this.bindDOMElements();
        this.bindEvents();
        this.setDefaultDateRange();
    }

    bindDOMElements() {
        this.startDateInput = document.getElementById('report-start-date');
        this.endDateInput = document.getElementById('report-end-date');
        this.generateBtn = document.getElementById('generate-report-btn');
        this.includeCheckboxes = {
            notes: document.getElementById('include-notes'),
            todos: document.getElementById('include-todos'),
            projects: document.getElementById('include-projects'),
            habits: document.getElementById('include-habits'),
            aiChats: document.getElementById('include-ai-chats')
        };
    }

    bindEvents() {
        this.generateBtn?.addEventListener('click', () => this.generateReport());
        
        // 监听日期变化
        this.startDateInput?.addEventListener('change', (e) => {
            this.startDate = new Date(e.target.value);
        });
        
        this.endDateInput?.addEventListener('change', (e) => {
            this.endDate = new Date(e.target.value);
        });
        
        // 监听选项变化
        Object.entries(this.includeCheckboxes).forEach(([key, checkbox]) => {
            checkbox?.addEventListener('change', (e) => {
                this.includeOptions[key] = e.target.checked;
            });
        });
    }

    setDefaultDateRange() {
        // 默认设置为本周
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        this.startDate = monday;
        this.endDate = sunday;
        
        if (this.startDateInput) {
            this.startDateInput.value = this.formatDateForInput(monday);
        }
        if (this.endDateInput) {
            this.endDateInput.value = this.formatDateForInput(sunday);
        }
    }

    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    async generateReport() {
        try {
            this.showLoading();
            
            // 收集数据
            const reportData = await this.collectData();
            
            // AI分析
            const analysis = await this.analyzeWithAI(reportData);
            
            // 生成报告
            const report = this.generateReportContent(reportData, analysis);
            
            // 显示报告
            this.displayReport(report);
            
        } catch (error) {
            console.error('生成周报失败:', error);
            this.showError('生成周报失败，请重试');
        } finally {
            this.hideLoading();
        }
    }

    async collectData() {
        const data = {
            period: {
                start: this.startDate,
                end: this.endDate
            },
            notes: [],
            todos: [],
            projects: [],
            habits: [],
            aiChats: []
        };

        // 收集笔记数据
        if (this.includeOptions.notes && window.appState.notebookManager) {
            data.notes = this.collectNotesData();
        }

        // 收集待办事项数据
        if (this.includeOptions.todos && window.appState.todoListManager) {
            data.todos = this.collectTodosData();
        }

        // 收集项目数据
        if (this.includeOptions.projects && window.appState.projectManager) {
            data.projects = await this.collectProjectsData();
        }

        // 收集习惯数据
        if (this.includeOptions.habits && window.appState.habitTracker) {
            data.habits = this.collectHabitsData();
        }

        // 收集AI对话数据
        if (this.includeOptions.aiChats && window.appState.aiChatManager) {
            data.aiChats = this.collectAIChatsData();
        }

        return data;
    }

    collectNotesData() {
        // 从笔记本管理器获取数据
        const notebooks = window.appState.notebookManager.notebooks || [];
        const notesInPeriod = [];
        
        notebooks.forEach(notebook => {
            if (notebook.lastModified) {
                const modifiedDate = new Date(notebook.lastModified);
                if (modifiedDate >= this.startDate && modifiedDate <= this.endDate) {
                    notesInPeriod.push({
                        title: notebook.name,
                        content: notebook.content || '',
                        modified: modifiedDate,
                        wordCount: (notebook.content || '').length
                    });
                }
            }
        });
        
        return notesInPeriod;
    }

    collectTodosData() {
        // 从待办事项管理器获取数据
        const todos = window.appState.todoListManager.todos || [];
        const todosInPeriod = {
            completed: [],
            pending: [],
            overdue: []
        };
        
        todos.forEach(todo => {
            const createdDate = new Date(todo.createdAt || Date.now());
            const completedDate = todo.completedAt ? new Date(todo.completedAt) : null;
            
            if (createdDate >= this.startDate && createdDate <= this.endDate) {
                if (todo.completed && completedDate) {
                    todosInPeriod.completed.push(todo);
                } else if (!todo.completed) {
                    const deadline = todo.deadline ? new Date(todo.deadline) : null;
                    if (deadline && deadline < new Date()) {
                        todosInPeriod.overdue.push(todo);
                    } else {
                        todosInPeriod.pending.push(todo);
                    }
                }
            }
        });
        
        return todosInPeriod;
    }

    async collectProjectsData() {
        // 从项目管理器获取数据
        const projects = await window.appState.projectManager.loadProjects() || [];
        const projectsInPeriod = {
            created: [],
            updated: [],
            completed: []
        };
        
        projects.forEach(project => {
            const createdDate = new Date(project.createdAt || Date.now());
            const updatedDate = new Date(project.updatedAt || project.createdAt || Date.now());
            
            if (createdDate >= this.startDate && createdDate <= this.endDate) {
                projectsInPeriod.created.push(project);
            } else if (updatedDate >= this.startDate && updatedDate <= this.endDate) {
                projectsInPeriod.updated.push(project);
                
                if (project.status === 'completed') {
                    projectsInPeriod.completed.push(project);
                }
            }
        });
        
        return projectsInPeriod;
    }

    collectHabitsData() {
        // 从习惯追踪器获取数据
        const habits = window.appState.habitTracker.habits || [];
        const habitsStats = [];
        
        habits.forEach(habit => {
            const sessions = habit.sessions || [];
            const sessionsInPeriod = sessions.filter(session => {
                const sessionDate = new Date(session.date);
                return sessionDate >= this.startDate && sessionDate <= this.endDate;
            });
            
            if (sessionsInPeriod.length > 0) {
                const totalTime = sessionsInPeriod.reduce((sum, session) => sum + (session.duration || 0), 0);
                habitsStats.push({
                    name: habit.name,
                    sessions: sessionsInPeriod.length,
                    totalTime: totalTime,
                    averageTime: totalTime / sessionsInPeriod.length
                });
            }
        });
        
        return habitsStats;
    }

    collectAIChatsData() {
        // 从AI聊天管理器获取数据
        const conversations = window.appState.aiChatManager.conversations || {};
        const chatsInPeriod = [];
        
        Object.values(conversations).forEach(conversation => {
            const messages = conversation.messages || [];
            const messagesInPeriod = messages.filter(message => {
                const messageDate = new Date(message.timestamp);
                return messageDate >= this.startDate && messageDate <= this.endDate;
            });
            
            if (messagesInPeriod.length > 0) {
                chatsInPeriod.push({
                    title: conversation.title || '未命名对话',
                    messageCount: messagesInPeriod.length,
                    topics: this.extractTopicsFromMessages(messagesInPeriod)
                });
            }
        });
        
        return chatsInPeriod;
    }

    extractTopicsFromMessages(messages) {
        // 简单的主题提取逻辑
        const topics = new Set();
        messages.forEach(message => {
            if (message.role === 'user') {
                const words = message.content.split(/\s+/);
                words.forEach(word => {
                    if (word.length > 3) {
                        topics.add(word);
                    }
                });
            }
        });
        return Array.from(topics).slice(0, 5); // 返回前5个主题
    }

    async analyzeWithAI(data) {
        // 使用AI分析数据
        const prompt = this.buildAnalysisPrompt(data);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: prompt,
                    model: 'gpt-3.5-turbo'
                })
            });
            
            const result = await response.json();
            return result.response || '分析生成失败';
        } catch (error) {
            console.error('AI分析失败:', error);
            return '无法生成AI分析';
        }
    }

    buildAnalysisPrompt(data) {
        return `请基于以下工作数据生成一份周报分析：

时间范围：${this.formatDate(data.period.start)} 至 ${this.formatDate(data.period.end)}

笔记数据：
- 创建/修改笔记：${data.notes.length}篇
- 总字数：${data.notes.reduce((sum, note) => sum + note.wordCount, 0)}字

待办事项：
- 已完成：${data.todos.completed?.length || 0}项
- 待处理：${data.todos.pending?.length || 0}项
- 逾期：${data.todos.overdue?.length || 0}项

项目进展：
- 新建项目：${data.projects.created?.length || 0}个
- 更新项目：${data.projects.updated?.length || 0}个
- 完成项目：${data.projects.completed?.length || 0}个

习惯追踪：
- 活跃习惯：${data.habits.length}个
- 总练习时长：${data.habits.reduce((sum, habit) => sum + habit.totalTime, 0)}分钟

请提供：
1. 工作总结
2. 主要成就
3. 需要改进的地方
4. 下周建议`;
    }

    generateReportContent(data, analysis) {
        const report = {
            title: `工作周报 (${this.formatDate(data.period.start)} - ${this.formatDate(data.period.end)})`,
            summary: this.generateSummary(data),
            details: this.generateDetails(data),
            analysis: analysis,
            nextWeekPlan: this.generateNextWeekPlan(data)
        };
        
        return report;
    }

    generateSummary(data) {
        return {
            notesCount: data.notes.length,
            totalWords: data.notes.reduce((sum, note) => sum + note.wordCount, 0),
            completedTodos: data.todos.completed?.length || 0,
            totalTodos: (data.todos.completed?.length || 0) + (data.todos.pending?.length || 0) + (data.todos.overdue?.length || 0),
            activeProjects: data.projects.created?.length + data.projects.updated?.length || 0,
            completedProjects: data.projects.completed?.length || 0,
            habitSessions: data.habits.reduce((sum, habit) => sum + habit.sessions, 0),
            habitTime: data.habits.reduce((sum, habit) => sum + habit.totalTime, 0)
        };
    }

    generateDetails(data) {
        return {
            notes: data.notes,
            todos: data.todos,
            projects: data.projects,
            habits: data.habits,
            aiChats: data.aiChats
        };
    }

    generateNextWeekPlan(data) {
        const suggestions = [];
        
        // 基于待办事项生成建议
        if (data.todos.overdue?.length > 0) {
            suggestions.push(`处理${data.todos.overdue.length}个逾期待办事项`);
        }
        
        if (data.todos.pending?.length > 0) {
            suggestions.push(`完成${Math.min(5, data.todos.pending.length)}个待办事项`);
        }
        
        // 基于项目进展生成建议
        if (data.projects.updated?.length > 0) {
            suggestions.push('继续推进进行中的项目');
        }
        
        // 基于习惯数据生成建议
        if (data.habits.length > 0) {
            const avgTime = data.habits.reduce((sum, habit) => sum + habit.averageTime, 0) / data.habits.length;
            if (avgTime < 30) {
                suggestions.push('增加习惯练习时长');
            }
        }
        
        return suggestions;
    }

    displayReport(report) {
        // 切换到内容视图显示报告
        const contentPane = document.querySelector('.content-pane');
        if (contentPane) {
            contentPane.innerHTML = this.renderReportHTML(report);
        }
    }

    renderReportHTML(report) {
        return `
            <div class="weekly-report-view">
                <div class="content-header">
                    <h2>${report.title}</h2>
                    <div class="report-actions">
                        <button id="export-markdown" class="action-btn">导出Markdown</button>
                        <button id="export-pdf" class="action-btn">导出PDF</button>
                    </div>
                </div>
                <div class="content-body">
                    <div class="report-content">
                        ${this.renderSummarySection(report.summary)}
                        ${this.renderAnalysisSection(report.analysis)}
                        ${this.renderDetailsSection(report.details)}
                        ${this.renderPlanSection(report.nextWeekPlan)}
                    </div>
                </div>
            </div>
        `;
    }

    renderSummarySection(summary) {
        return `
            <section class="report-section">
                <h3>📊 本周概览</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-number">${summary.notesCount}</span>
                        <span class="summary-label">笔记篇数</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-number">${summary.totalWords}</span>
                        <span class="summary-label">总字数</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-number">${summary.completedTodos}/${summary.totalTodos}</span>
                        <span class="summary-label">完成待办</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-number">${summary.completedProjects}</span>
                        <span class="summary-label">完成项目</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-number">${Math.round(summary.habitTime / 60)}h</span>
                        <span class="summary-label">习惯时长</span>
                    </div>
                </div>
            </section>
        `;
    }

    renderAnalysisSection(analysis) {
        return `
            <section class="report-section">
                <h3>🤖 AI分析</h3>
                <div class="analysis-content">
                    <pre>${analysis}</pre>
                </div>
            </section>
        `;
    }

    renderDetailsSection(details) {
        return `
            <section class="report-section">
                <h3>📋 详细数据</h3>
                <div class="details-tabs">
                    <button class="tab-btn active" data-tab="notes">笔记</button>
                    <button class="tab-btn" data-tab="todos">待办</button>
                    <button class="tab-btn" data-tab="projects">项目</button>
                    <button class="tab-btn" data-tab="habits">习惯</button>
                </div>
                <div class="details-content">
                    <div id="notes-details" class="tab-content active">
                        ${this.renderNotesDetails(details.notes)}
                    </div>
                    <div id="todos-details" class="tab-content">
                        ${this.renderTodosDetails(details.todos)}
                    </div>
                    <div id="projects-details" class="tab-content">
                        ${this.renderProjectsDetails(details.projects)}
                    </div>
                    <div id="habits-details" class="tab-content">
                        ${this.renderHabitsDetails(details.habits)}
                    </div>
                </div>
            </section>
        `;
    }

    renderPlanSection(plan) {
        return `
            <section class="report-section">
                <h3>📅 下周计划</h3>
                <ul class="plan-list">
                    ${plan.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </section>
        `;
    }

    // 辅助方法
    formatDate(date) {
        return date.toLocaleDateString('zh-CN');
    }

    showLoading() {
        // 显示加载状态
        console.log('生成周报中...');
    }

    hideLoading() {
        // 隐藏加载状态
        console.log('周报生成完成');
    }

    showError(message) {
        // 显示错误信息
        console.error(message);
    }
}

// 导出类
window.WeeklyReportGenerator = WeeklyReportGenerator;