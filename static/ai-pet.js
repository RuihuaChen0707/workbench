/**
 * AI-Pet 像素机器人组件
 * 支持拖拽、眼球跟随、状态动画和点击交互
 */
class AIPet {
    constructor() {
        this.element = null;
        this.isDragging = false;
        this.startPos = { x: 0, y: 0 };
        this.dragOffset = { x: 0, y: 0 };
        this.currentState = 'idle'; // idle, happy, sleeping
        this.speechTimeout = null;
        this.eyeTrackingEnabled = true;
        
        // 自动睡眠相关
        this.lastInteractionTime = Date.now();
        this.sleepTimer = null;
        this.SLEEP_DELAY = 60000; // 1分钟 = 60000毫秒
        
        // 拖拽阈值常量
        this.DRAG_THRESHOLD = 5;
        
        // 绑定方法到实例，确保正确的this上下文
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.checkSleepStatus = this.checkSleepStatus.bind(this);
        
        this.init();
    }
    
    init() {
        this.createElement();
        this.bindEvents();
        this.startEyeTracking();
        this.setRandomPosition();
        this.startSleepTimer();
        this.bindGlobalInteractionEvents();
    }
    
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'ai-pet';
        this.element.innerHTML = `
            <div class="robot-body">
                <div class="robot-antenna"></div>
                <div class="robot-head">
                    <div class="robot-eyes">
                        <div class="robot-eye left-eye"></div>
                        <div class="robot-eye right-eye"></div>
                    </div>
                </div>
                <div class="robot-mouth"></div>
                <div class="robot-wings">
                    <div class="robot-wing left"></div>
                    <div class="robot-wing right"></div>
                </div>
                <div class="robot-arms">
                    <div class="robot-arm left"></div>
                    <div class="robot-arm right"></div>
                </div>
                <div class="robot-legs">
                    <div class="robot-leg left"></div>
                    <div class="robot-leg right"></div>
                </div>
                <div class="robot-chest"></div>
                <div class="rocket-trail">
                    <div class="trail-particle"></div>
                    <div class="trail-particle"></div>
                    <div class="trail-particle"></div>
                    <div class="trail-particle"></div>
                    <div class="trail-particle"></div>
                    <div class="trail-particle"></div>
                </div>
                <div class="zzz-container">
                    <div class="zzz">z</div>
                    <div class="zzz">z</div>
                    <div class="zzz">z</div>
                </div>
            </div>
            <div class="speech-bubble"></div>
        `;
        
        document.body.appendChild(this.element);
    }
    
    bindEvents() {
        // 只绑定mousedown事件到元素本身
        this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        
        // 触摸事件（移动端支持）
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
    }
    
    // 绑定全局交互事件，用于检测用户活动
    bindGlobalInteractionEvents() {
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, this.updateLastInteractionTime.bind(this), { passive: true });
        });
    }
    
    // 更新最后交互时间
    updateLastInteractionTime() {
        this.lastInteractionTime = Date.now();
        
        // 如果当前是睡眠状态，唤醒机器人
        if (this.currentState === 'sleeping') {
            this.setState('idle');
        }
    }
    
    // 开始睡眠检测定时器
    startSleepTimer() {
        this.sleepTimer = setInterval(this.checkSleepStatus, 5000); // 每5秒检查一次
    }
    
    // 检查是否应该进入睡眠状态
    checkSleepStatus() {
        const timeSinceLastInteraction = Date.now() - this.lastInteractionTime;
        
        if (timeSinceLastInteraction >= this.SLEEP_DELAY && this.currentState !== 'sleeping') {
            this.setState('sleeping');
        }
    }
    
    handleMouseDown(e) {
        if (e.target.closest('.speech-bubble')) return;
        
        // 更新交互时间
        this.updateLastInteractionTime();
        
        // 阻止默认事件，防止文本选等副作用
        e.preventDefault();
        
        // 记录初始鼠标位置
        this.startPos = {
            x: e.clientX,
            y: e.clientY
        };
        
        // 重置拖拽状态 - 总是假设操作开始时是潜在的点击
        this.isDragging = false;
        
        // 计算拖拽偏移量（用于后续拖拽时的位置计算）
        const rect = this.element.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        // 在window对象上添加事件监听器，确保在组件外移动也能追踪
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
    }
    
    handleMouseMove(e) {
        // 如果已经确定是拖拽状态，直接执行拖拽逻辑
        if (this.isDragging) {
            const x = e.clientX - this.dragOffset.x;
            const y = e.clientY - this.dragOffset.y;
            this.setPosition(x, y);
            return;
        }
        
        // 核心判断逻辑：计算鼠标移动距离
        const distance = Math.sqrt(
            Math.pow(e.clientX - this.startPos.x, 2) + 
            Math.pow(e.clientY - this.startPos.y, 2)
        );
        
        // 如果移动距离超过阈值，确定为拖拽操作
        if (distance > this.DRAG_THRESHOLD) {
            this.isDragging = true;
            this.element.classList.add('dragging');
            
            // 开始拖拽，立即更新位置
            const x = e.clientX - this.dragOffset.x;
            const y = e.clientY - this.dragOffset.y;
            this.setPosition(x, y);
        }
    }
    
    handleMouseUp(e) {
        // 移除全局事件监听器
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
        
        // 如果不是拖拽操作，则视为点击
        if (!this.isDragging) {
            this.handleClick(e);
        } else {
            // 结束拖拽状态
            this.element.classList.remove('dragging');
        }
        
        // 重置拖拽状态
        this.isDragging = false;
    }
    
    handleTouchStart(e) {
        const touch = e.touches[0];
        this.handleMouseDown({
            clientX: touch.clientX,
            clientY: touch.clientY,
            target: e.target,
            preventDefault: () => e.preventDefault()
        });
    }
    
    handleClick(e) {
        // 更新交互时间
        this.updateLastInteractionTime();
        
        if (e.target.closest('.speech-bubble')) {
            return;
        }
        
        // 打开AI命令窗口
        if (window.aiCommandModal) {
            window.aiCommandModal.open();
        }
    }
    
    setPosition(x, y) {
        // 边界检查
        const maxX = window.innerWidth - this.element.offsetWidth;
        const maxY = window.innerHeight - this.element.offsetHeight;
        
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
    }
    
    setRandomPosition() {
        const x = Math.random() * (window.innerWidth - 100) + 50;
        const y = Math.random() * (window.innerHeight - 100) + 50;
        this.setPosition(x, y);
    }
    
    setState(state) {
        if (this.currentState === state) return;
        
        // 移除当前状态类
        this.element.classList.remove(this.currentState);
        
        // 设置新状态
        this.currentState = state;
        this.element.classList.add(state);
        
        // 根据状态显示不同消息
        if (state === 'happy') {
            this.showMessage('✨ 我很开心！', 2000);
            // 2秒后回到idle状态
            setTimeout(() => {
                if (this.currentState === 'happy') {
                    this.setState('idle');
                }
            }, 2000);
        } else if (state === 'sleeping') {
            this.showMessage('💤 进入睡眠模式...', 1500);
        }
    }
    
    toggleState() {
        const states = ['idle', 'happy', 'sleeping'];
        const currentIndex = states.indexOf(this.currentState);
        const nextIndex = (currentIndex + 1) % states.length;
        this.setState(states[nextIndex]);
    }
    
    showMessage(message, duration = 3000) {
        const bubble = this.element.querySelector('.speech-bubble');
        bubble.textContent = message;
        bubble.classList.add('show');
        
        if (this.speechTimeout) {
            clearTimeout(this.speechTimeout);
        }
        
        this.speechTimeout = setTimeout(() => {
            bubble.classList.remove('show');
        }, duration);
    }
    
    showRandomMessage() {
        const messages = [
            '你好！我是你的AI助手 🤖',
            '有什么可以帮助你的吗？',
            '按 Cmd+K 唤醒我！',
            '让我们一起工作吧！',
            '我在这里随时待命~',
            '点击我打开AI助手！',
            '拖拽我到任何地方！'
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.showMessage(randomMessage);
    }
    
    startEyeTracking() {
        if (!this.eyeTrackingEnabled) return;
        
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging || this.currentState === 'sleeping') return;
            
            const rect = this.element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            
            const eyes = this.element.querySelectorAll('.robot-eye');
            eyes.forEach(eye => {
                eye.classList.remove('looking-left', 'looking-right', 'looking-up', 'looking-down');
                
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (deltaX > 20) {
                        eye.classList.add('looking-right');
                    } else if (deltaX < -20) {
                        eye.classList.add('looking-left');
                    }
                } else {
                    if (deltaY > 20) {
                        eye.classList.add('looking-down');
                    } else if (deltaY < -20) {
                        eye.classList.add('looking-up');
                    }
                }
            });
        });
    }
    
    // 公共API方法
    show() {
        this.element.style.display = 'block';
    }
    
    hide() {
        this.element.style.display = 'none';
    }
    
    destroy() {
        // 清理定时器
        if (this.sleepTimer) {
            clearInterval(this.sleepTimer);
        }
        
        if (this.speechTimeout) {
            clearTimeout(this.speechTimeout);
        }
        
        // 移除全局事件监听器
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.removeEventListener(event, this.updateLastInteractionTime);
        });
        
        // 移除元素
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// 全局实例
window.aiPet = null;

// 初始化AI-Pet
function initAIPet() {
    if (!window.aiPet) {
        window.aiPet = new AIPet();
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAIPet);
} else {
    initAIPet();
}