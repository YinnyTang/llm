<template>
  <div class="home-container">
    
    <div class="content-wrapper">
      <h1 class="title">欢迎来到 AI 聊天</h1>
      <div class="input-wrapper">
        <ChatInput 
          v-model="question" 
          :loading="loading" 
          @send="startchat"
          placeholder="输入你的问题，按回车键或点击发送按钮开始聊天..."
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import ChatInput from "../components/ChatInput.vue"; // 引入 ChatInput 组件
import TopNavbar from "../components/TopNavbar.vue"; // 引入顶部导航栏组件
import { useChatStore } from "../stores/chatStore";
import { useUIStore } from "../stores/uiStore"; // 引入 UI store

const question = ref(""); // 用户输入的问题
const loading = ref(false); // 控制加载状态
const router = useRouter();
const chatStore = useChatStore();
const uiStore = useUIStore(); // 使用 UI store

// 处理发送消息
const startchat = async (msg) => {
  console.log("用户发送了:", msg);
  // 先创建新聊天
  chatStore.createNewChat();
  const newChatId = chatStore.chatId;
  
  // 跳转到聊天页面，带上消息和新创建的聊天ID
  router.push({
    path: "/chat",
    query: { 
      chatId: newChatId,
      initialMessage: msg 
    }
  });
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;  /* 修改为纵向布局 */
  background-color: #f5f7fa;
}

.content-wrapper {
  flex: 1;  /* 让内容区域填充剩余空间 */
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;  /* 水平居中 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;  /* 垂直居中 */
  gap: 50px;
  padding: 20px;
}

.title {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.input-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
}

/* 覆盖 ChatInput 组件的样式 */
:deep(.chat-input) {
  width: 100%;
  max-width: 900px;
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-textarea__inner) {
  font-size: 16px;
  padding: 12px 16px;
  min-height: 120px !important;
}

:deep(.el-button) {
  padding: 12px 30px;
  font-size: 16px;
}
</style>
  