// ⚡ 闪电效果管理器
class LightningEffects {
    constructor() {
        this.isActive = true;
        this.lightningBolts = [];
        this.particles = [];
        this.init();
    }

    init() {
        this.createLightningBackground();
        this.createParticleContainer();
        this.bindEvents();
        this.startBackgroundLightning();
        console.log('⚡ 闪电效果已激活');
    }

    // 创建闪电背景容器
    createLightningBackground() {
        const lightningBg = document.createElement('div');
        lightningBg.className = 'lightning-bg';
        lightningBg.id = 'lightning-background';
        document.body.appendChild(lightningBg);
    }

    // 创建粒子容器
    createParticleContainer() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'lightning-particles';
        particleContainer.id = 'lightning-particles';
        document.body.appendChild(particleContainer);
    }

    // 绑定事件
    bindEvents() {
        // 为所有按钮添加闪电效果
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .nav-btn, .add-btn, .btn')) {
                this.triggerButtonLightning(e.target);
                this.createClickParticles(e.clientX, e.clientY);
            }
        });

        // 鼠标移动时的微弱闪电效果
        let mouseTimer;
        document.addEventListener('mousemove', (e) => {
            clearTimeout(mouseTimer);
            mouseTimer = setTimeout(() => {
                if (Math.random() < 0.1) { // 10% 概率
                    this.createMouseLightning(e.clientX, e.clientY);
                }
            }, 100);
        });
    }

    // 开始背景闪电动画
    startBackgroundLightning() {
        setInterval(() => {
            if (this.isActive && Math.random() < 0.3) { // 30% 概率
                this.createBackgroundLightning();
            }
        }, 3000 + Math.random() * 5000); // 3-8秒随机间隔
    }

    // 创建背景闪电
    createBackgroundLightning() {
        const container = document.getElementById('lightning-background');
        if (!container) return;

        const bolt = document.createElement('div');
        bolt.className = 'lightning-bolt';
        
        // 随机位置和高度
        const left = Math.random() * window.innerWidth;
        const height = 200 + Math.random() * 400;
        
        bolt.style.left = left + 'px';
        bolt.style.height = height + 'px';
        bolt.style.animationDelay = Math.random() * 0.5 + 's';
        
        container.appendChild(bolt);
        
        // 2秒后移除
        setTimeout(() => {
            if (bolt.parentNode) {
                bolt.parentNode.removeChild(bolt);
            }
        }, 2000);
    }

    // 按钮闪电效果
    triggerButtonLightning(button) {
        button.classList.add('lightning-btn', 'lightning-active');
        
        setTimeout(() => {
            button.classList.remove('lightning-active');
        }, 300);
        
        // 添加永久的闪电按钮类
        if (!button.classList.contains('lightning-btn')) {
            button.classList.add('lightning-btn');
        }
    }

    // 点击粒子效果
    createClickParticles(x, y) {
        const container = document.getElementById('lightning-particles');
        if (!container) return;

        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'lightning-particle';
            
            const offsetX = (Math.random() - 0.5) * 100;
            const offsetY = (Math.random() - 0.5) * 100;
            
            particle.style.left = (x + offsetX) + 'px';
            particle.style.top = (y + offsetY) + 'px';
            particle.style.animationDelay = (Math.random() * 0.5) + 's';
            
            container.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 3000);
        }
    }

    // 鼠标闪电效果
    createMouseLightning(x, y) {
        const container = document.getElementById('lightning-particles');
        if (!container) return;

        const particle = document.createElement('div');
        particle.className = 'lightning-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '2px';
        particle.style.height = '2px';
        particle.style.opacity = '0.5';
        
        container.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }

    // 为特定元素添加闪电文字效果
    addLightningText(element) {
        element.classList.add('lightning-text');
    }

    // 显示加载闪电效果
    showLoader() {
        const loader = document.createElement('div');
        loader.className = 'lightning-loader';
        loader.id = 'lightning-loader';
        
        const bolt = document.createElement('div');
        bolt.className = 'lightning-loader-bolt';
        
        loader.appendChild(bolt);
        document.body.appendChild(loader);
        
        return loader;
    }

    // 隐藏加载效果
    hideLoader() {
        const loader = document.getElementById('lightning-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 300);
        }
    }

    // 切换闪电效果
    toggle() {
        this.isActive = !this.isActive;
        console.log(`⚡ 闪电效果 ${this.isActive ? '已开启' : '已关闭'}`);
    }

    // 创建特殊场景闪电效果
    createSpecialEffect(type = 'success') {
        const colors = {
            success: '#00ff88',
            error: '#ff4444',
            warning: '#ffaa00',
            info: '#00d4ff'
        };
        
        const color = colors[type] || colors.info;
        
        // 创建全屏闪电效果
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createColoredLightning(color);
            }, i * 200);
        }
    }

    // 创建彩色闪电
    createColoredLightning(color) {
        const container = document.getElementById('lightning-background');
        if (!container) return;

        const bolt = document.createElement('div');
        bolt.className = 'lightning-bolt';
        bolt.style.background = `linear-gradient(to bottom, transparent 0%, ${color} 20%, #ffffff 50%, ${color} 80%, transparent 100%)`;
        bolt.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`;
        
        const left = Math.random() * window.innerWidth;
        const height = 150 + Math.random() * 300;
        
        bolt.style.left = left + 'px';
        bolt.style.height = height + 'px';
        
        container.appendChild(bolt);
        
        setTimeout(() => {
            if (bolt.parentNode) {
                bolt.parentNode.removeChild(bolt);
            }
        }, 1000);
    }
}

// 全局闪电效果实例
let lightningEffects;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 显示加载闪电效果
    const tempLoader = document.createElement('div');
    tempLoader.className = 'lightning-loader';
    const tempBolt = document.createElement('div');
    tempBolt.className = 'lightning-loader-bolt';
    tempLoader.appendChild(tempBolt);
    document.body.appendChild(tempLoader);
    
    // 延迟初始化闪电效果
    setTimeout(() => {
        lightningEffects = new LightningEffects();
        
        // 隐藏加载效果
        tempLoader.style.opacity = '0';
        setTimeout(() => {
            if (tempLoader.parentNode) {
                tempLoader.parentNode.removeChild(tempLoader);
            }
        }, 300);
        
        // 为标题添加闪电效果
        const title = document.querySelector('.app-title');
        if (title) {
            lightningEffects.addLightningText(title);
        }
        
        // 欢迎闪电效果
        setTimeout(() => {
            lightningEffects.createSpecialEffect('success');
        }, 1000);
        
    }, 1500);
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LightningEffects;
}