/**
 * 复制代码到剪贴板
 * @param {HTMLElement} button - 被点击的复制按钮
 */
function copyCodeToClipboard(button) {
    const codeBlock = button.closest('.code-block');
    const codeContent = codeBlock.querySelector('code').textContent;
    
    // 创建临时textarea来复制文本
    const textarea = document.createElement('textarea');
    textarea.value = codeContent;
    textarea.style.position = 'fixed';  // 避免滚动页面
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        // 执行复制命令
        const successful = document.execCommand('copy');
        
        // 显示复制成功/失败的反馈
        const originalText = button.textContent;
        button.textContent = successful ? '已复制!' : '复制失败';
        button.classList.add(successful ? 'copy-success' : 'copy-error');
        
        // 2秒后恢复按钮状态
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copy-success', 'copy-error');
        }, 2000);
    } catch (err) {
        console.error('复制失败:', err);
        button.textContent = '复制失败';
        button.classList.add('copy-error');
        
        setTimeout(() => {
            button.textContent = '复制';
            button.classList.remove('copy-error');
        }, 2000);
    }
    
    // 清理临时元素
    document.body.removeChild(textarea);
}// main.js
// Main application file that initializes everything

import { sendMessage, saveConversation } from './api.js';
import { updateApiKeyStatus, showApiKeyManager, hideApiKeyManager, showApiKeyModal, hideApiKeyModal, submitApiKey, toggleKeyVisibility, toggleApiKeyVisibility, updateAllApiKeyStatuses, updateApiKey, removeApiKey } from './apiKeyManager.js';
import { scrollToBottom } from './messages.js';
import { toggleTheme, initTheme } from './theme.js';
import { initTextareaResize } from './textarea-resize.js';

// Make functions available globally
window.sendMessage = sendMessage;
window.saveConversation = saveConversation;
window.showApiKeyManager = showApiKeyManager;
window.hideApiKeyManager = hideApiKeyManager;
window.showApiKeyModal = showApiKeyModal;
window.hideApiKeyModal = hideApiKeyModal;
window.submitApiKey = submitApiKey;
window.toggleKeyVisibility = toggleKeyVisibility;
window.toggleApiKeyVisibility = toggleApiKeyVisibility;
window.updateApiKey = updateApiKey;
window.removeApiKey = removeApiKey;
window.toggleTheme = toggleTheme;
window.copyCodeToClipboard = copyCodeToClipboard;
window.copyMessageContent = copyMessageContent;

/**
 * 复制整段消息内容到剪贴板
 * @param {HTMLElement} button - 被点击的复制按钮
 */
function copyMessageContent(button) {
    // 获取消息元素
    const messageElement = button.closest('.message');
    const messageContent = messageElement.querySelector('.message-content');
    
    // 获取纯文本内容（移除HTML标签）
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = messageContent.innerHTML;
    
    // 处理代码块的特殊情况
    const codeBlocks = tempDiv.querySelectorAll('.code-block');
    codeBlocks.forEach(block => {
        const codeContent = block.querySelector('code').textContent;
        const language = block.querySelector('.code-language').textContent;
        
        // 替换为Markdown格式的代码块
        const codeBlockMd = document.createElement('div');
        codeBlockMd.innerHTML = `\`\`\`${language}\n${codeContent}\n\`\`\``;
        block.parentNode.replaceChild(codeBlockMd, block);
    });
    
    // 处理行内代码
    const inlineCodes = tempDiv.querySelectorAll('.inline-code');
    inlineCodes.forEach(code => {
        const codeText = code.textContent;
        const inlineCodeMd = document.createElement('span');
        inlineCodeMd.innerHTML = `\`${codeText}\``;
        code.parentNode.replaceChild(inlineCodeMd, code);
    });
    
    // 获取处理后的文本内容
    let textContent = tempDiv.innerText || tempDiv.textContent;
    
    // 清理多余空行
    textContent = textContent.replace(/\n{3,}/g, '\n\n');
    
    // 创建临时textarea来复制文本
    const textarea = document.createElement('textarea');
    textarea.value = textContent;
    textarea.style.position = 'fixed';  // 避免滚动页面
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        // 执行复制命令
        const successful = document.execCommand('copy');
        
        // 显示复制成功/失败的反馈
        const originalText = button.textContent;
        button.textContent = successful ? '已复制!' : '复制失败';
        button.classList.add(successful ? 'copy-success' : 'copy-error');
        
        // 2秒后恢复按钮状态
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copy-success', 'copy-error');
        }, 2000);
    } catch (err) {
        console.error('复制失败:', err);
        button.textContent = '复制失败';
        button.classList.add('copy-error');
        
        setTimeout(() => {
            button.textContent = '复制';
            button.classList.remove('copy-error');
        }, 2000);
    }
    
    // 清理临时元素
    document.body.removeChild(textarea);
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize message container scrolling
    const messagesContainer = document.querySelector('.messages');
    if (messagesContainer) {
        scrollToBottom(messagesContainer, false);
    }

    // Initialize API key status
    updateApiKeyStatus();
    
    // Initialize theme
    initTheme();
    
    // Initialize textarea auto-resize
    initTextareaResize();
    
    // Load saved model from localStorage
    const savedModel = localStorage.getItem('selectedModel');
    if (savedModel) {
        document.getElementById('model-selector').value = savedModel;
    }

    // Set up event listeners
    setupEventListeners();
});

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // API Key modal close when clicking outside
    window.onclick = function(event) {
        const apiKeyModal = document.getElementById('apiKeyModal');
        const apiKeyManager = document.getElementById('apiKeyManager');
        const dropdowns = document.getElementsByClassName('dropdown-content');
        
        // Close API key manager when clicking outside
        if (event.target === apiKeyManager) {
            hideApiKeyManager();
        }
        
        // Close API key modal when clicking outside
        if (event.target === apiKeyModal) {
            hideApiKeyModal();
        }
        
        // Close dropdown menu when clicking elsewhere
        if (!event.target.matches('.dropdown button')) {
            for (const dropdown of dropdowns) {
                if (dropdown.classList.contains('show')) {
                    dropdown.classList.remove('show');
                }
            }
        }
    };

    // Enter key in API key input
    document.getElementById('apiKeyInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            submitApiKey();
        }
    });

    // 注意：Enter键处理已经移动到textarea-resize.js中

    // Model selector change
    document.getElementById('model-selector').addEventListener('change', function(event) {
        localStorage.setItem('selectedModel', event.target.value);
        updateApiKeyStatus();
    });
}

/**
 * Toggle dropdown menu visibility
 * @param {Event} event - The event object
 */
window.toggleDropdown = function(event) {
    event.preventDefault();
    document.getElementById('dropdownMenu').classList.toggle('show');
};