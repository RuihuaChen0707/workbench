// CSS Debug 和重置工具
const CSSDebugger = {
    // 检查当前样式状态
    checkCurrentStyles: function() {
        console.log('🔍 开始CSS诊断...');
        
        // 检查字体加载
        document.fonts.forEach(font => {
            console.log(`字体 ${font.family}: ${font.status}`);
        });
        
        // 检查关键元素
        const keyElements = [
            '.app-container',
            '.sidebar-nav', 
            '.nav-btn',
            'fieldset',
            'legend'
        ];
        
        keyElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            console.log(`${selector}: 找到 ${elements.length} 个元素`);
            
            if (elements.length > 0) {
                const style = window.getComputedStyle(elements[0]);
                console.log(`  - 字体: ${style.fontFamily}`);
                console.log(`  - 背景: ${style.backgroundColor}`);
                console.log(`  - 边框: ${style.border}`);
            }
        });
    },
    
    // 强制刷新样式
    forceRefreshCSS: function() {
        console.log('🔄 强制刷新CSS...');
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
            const href = link.href;
            link.href = href + '?t=' + Date.now();
        });
    },
    
    // 应用紧急像素化样式
    applyEmergencyPixelStyles: function() {
        console.log('🚨 应用紧急像素化样式...');
        
        const emergencyCSS = `
            * {
                transition: none !important;
                border-radius: 0 !important;
            }
            
            body {
                font-family: 'Press Start 2P', monospace !important;
                background: #000 !important;
                color: #fff !important;
            }
            
            fieldset {
                border: 2px solid #fff !important;
                background: #000 !important;
                margin: 5px !important;
                padding: 10px !important;
            }
            
            legend {
                color: #ff0 !important;
                background: #000 !important;
                padding: 0 8px !important;
                border: 1px solid #fff !important;
                font-size: 10px !important;
                text-transform: uppercase !important;
            }
            
            button {
                background: #000 !important;
                color: #fff !important;
                border: 2px solid #fff !important;
                padding: 8px 16px !important;
                font-family: 'Press Start 2P', monospace !important;
                font-size: 10px !important;
                text-transform: uppercase !important;
            }
            
            button:hover {
                background: #333 !important;
                color: #ff0 !important;
                border-color: #ff0 !important;
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'emergency-pixel-styles';
        style.textContent = emergencyCSS;
        document.head.appendChild(style);
    }
};

// 在控制台中可用
window.CSSDebugger = CSSDebugger;

console.log('🛠️ CSS调试工具已加载！');
console.log('使用方法:');
console.log('- CSSDebugger.checkCurrentStyles() // 检查当前样式');
console.log('- CSSDebugger.forceRefreshCSS() // 强制刷新CSS');
console.log('- CSSDebugger.applyEmergencyPixelStyles() // 应用紧急样式');