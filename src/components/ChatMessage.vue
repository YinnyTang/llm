<template>
    <div :class="message.role === 'ai' ? 'ai-message' : 'user-message'">
      <img v-if="message.role === 'ai'" src="../assets/images/coze.png" alt="AI" class="side" />
      <div class="bubble">
        <!-- 渲染消息内容，支持 Markdown 格式 -->
        <div v-html="renderedMessage" />
      </div>
      <!-- 仅 AI 消息显示复制框 -->
      <copybox v-if="message.role === 'ai'" :message="message.content" />
    </div>
  </template>
  
<script setup lang="ts">
  import { computed,nextTick } from "vue";
  import { marked } from "marked";
  import Prism from "prismjs";
  import 'prismjs/themes/prism.css';
  // 接收父组件传递的 `message` 属性
  const props = defineProps<{ message: { role: string; content: string } }>();
  // 使用 `marked` 将 Markdown 格式的消息转换为 HTML
  const renderedMessage = computed(() => {
    // 解析 Markdown 并生成 HTML
    let htmlContent = marked(props.message.content);

    // 等待 DOM 渲染后高亮所有代码块
    nextTick(() => {
      Prism.highlightAll();
    });
    return htmlContent;
  });
</script>
  
  <style scoped>
 .message {
  margin-bottom: 15px;
  width: 100%; /* 确保消息宽度适应容器 */
}

.user-message {
  display: flex;
  justify-content: flex-end;
}

.ai-message {
  display: flex;
}

.bubble {
  padding: 10px 20px;
  border-radius: 20px;
  line-height: 1.3;
  color: #0d0d0d;
}
.user-message .bubble {
  background-color: #e8e8e880;
}

.side {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

/* 添加全局样式以确保代码块正确显示 */
pre {
  background-color: #f5f5f5;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
}


  </style>
  