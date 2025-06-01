<template>
    <div :class="message.role === 'ai' ? 'ai-message' : 'user-message'">
      <img v-if="message.role === 'ai'" src="../assets/images/coze.png" alt="AI" class="side" />
      <div class="bubble">
        <!-- 加载动画 -->
        <div v-if="message.loading" class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <!-- 正常消息内容 -->
        <div v-else class="markdown-body" v-html="renderedMessage" />
      </div>
      <!-- 仅 AI 消息显示复制框 -->
      <copybox v-if="message.role === 'ai'" :message="message.content" />
    </div>
  </template>
  
<script setup lang="ts">
import { computed, nextTick, onMounted, h } from "vue";
import { marked } from "marked";
import Prism from "prismjs";
import DOMPurify from 'dompurify';
import { ElButton, ElIcon, ElMessage } from 'element-plus';
import { CopyDocument } from '@element-plus/icons-vue';
// 引入更多的语言支持
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import 'github-markdown-css/github-markdown.css';

// 配置 marked
const renderer = new marked.Renderer();
marked.setOptions({
  renderer,
  gfm: true, // 启用 GitHub 风格的 Markdown
  breaks: true, // 允许回车换行
});

// 配置代码高亮
renderer.code = function(text: string, lang?: string) {
  if (lang && Prism.languages[lang]) {
    const highlightedCode = Prism.highlight(
      text,
      Prism.languages[lang],
      lang
    );
    return `<pre><code class="language-${lang}">${highlightedCode}</code></pre>`;
  }
  return `<pre><code>${escape(text)}</code></pre>`;
};

interface Message {
  role: string;
  content: string;
  loading?: boolean;
}

const props = defineProps<{ message: Message }>();

// 渲染消息内容
const renderedMessage = computed(() => {
  try {
    // 解析 Markdown 并生成 HTML
    let htmlContent = marked(props.message.content || '');
    nextTick(() => {
      Prism.highlightAll();
    });
    // 安全处理
    return DOMPurify.sanitize(htmlContent);
  } catch (error) {
    console.error('Markdown rendering error:', error);
    return props.message.content || '';
  }
});

// 添加代码复制功能
onMounted(() => {
  nextTick(() => {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      // 创建按钮容器
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'code-header';
      // 创建 vue 挂载点
      const vueMount = document.createElement('span');
      buttonContainer.appendChild(vueMount);
      // 渲染 el-button + el-icon
      const vnode = h(ElButton, {
        type: 'text',
        size: 'small',
        style: 'padding: 0; margin: 0; vertical-align: middle;',
        onClick: async () => {
          try {
            await navigator.clipboard.writeText(block.textContent || '');
            ElMessage.success('复制成功！');
          } catch (err) {
            ElMessage.error('复制失败');
          }
        }
      }, {
        default: () => h(ElIcon, null, { default: () => h(CopyDocument) })
      });
      // 动态挂载
      import('vue').then(({ createApp }) => {
        const app = createApp({ render: () => vnode });
        app.mount(vueMount);
      });
      // 插入到代码块
      const pre = block.parentElement;
      if (pre) {
        pre.style.position = 'relative';
        pre.insertBefore(buttonContainer, block);
      }
    });
  });
});

// HTML 转义函数
function escape(html: string): string {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
</script>
  
<style>
/* 代码块样式 */
.markdown-body pre {
  position: relative;
  padding: 2.5em 1em 1em;
  margin: 1em 0;
  overflow: auto;
  border-radius: 6px;
  background-color: #282c34;
  color: #abb2bf;
}

.markdown-body code {
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}

/* 代码块头部样式 */
.code-header {
  position: absolute;
  top: 0;
  right: 0;
  padding: 8px 12px;
  z-index: 2;
  background: transparent;
}

/* 消息气泡样式 */
.user-message {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 40px !important;  /* 强制应用间距 */
  padding: 0 20px;  /* 添加左右内边距 */
}

.ai-message {
  display: flex;
  margin-bottom: 40px !important;  /* 强制应用间距 */
  padding: 0 20px;  /* 添加左右内边距 */
}

.bubble {
  padding: 15px 25px;  /* 增加气泡内部间距 */
  border-radius: 20px;
  line-height: 2;
  color: #0d0d0d;
  max-width: 80%;
}

.user-message .bubble {
  background-color: #e8e8e880;
}

.ai-message .bubble {
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.side {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
}

/* Markdown 内容样式覆盖 */
.markdown-body {
  background: transparent !important;
  font-size: 14px;
}

.markdown-body p {
  margin-bottom: 0.8em;
}

.markdown-body ul, 
.markdown-body ol {
  padding-left: 1.5em;
}

/* 链接样式 */
.markdown-body a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

/* 表格样式 */
.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-body th,
.markdown-body td {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-body tr:nth-child(2n) {
  background-color: #f6f8fa;
}

/* 加载动画样式 */
.loading-dots {
  display: flex;
  gap: 4px;
  padding: 8px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #666;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0);
  } 
  40% { 
    transform: scale(1.0);
  }
}
</style>
  