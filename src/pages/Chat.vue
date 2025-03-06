<template>
  <div class="chat-container">
    <!-- 聊天内容区域 -->
    <div ref="chatWindow" class="chat-body">
      <ChatMessage 
        v-for="(message, index) in messages" 
        :key="index" 
        :message="message"
      />
    </div>

    <!-- 输入框 -->
    <div class="chat-input">
      <ChatInput v-model="question" :loading="loading" @send="sendQuestion" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, watch, onMounted, onUnmounted} from "vue";
import ChatMessage from "../components/ChatMessage.vue";
import ChatInput from "../components/ChatInput.vue";
import { useChatStore } from "../stores/chatStore";

const chatStore = useChatStore(); // ✅ 使用 Pinia 聊天 Store
const question = ref(""); // 用户输入的消息
const loading = ref(false);
// 确保 messages 从 store 中获取
const chatId = computed(() => chatStore.chatId);
const messages = computed(() => chatStore.messages);

// **发送消息**
const sendQuestion = async () => {
  if (!question.value.trim()) return;
  console.log("sendQuestion triggered!"); // ✅ 检查方法是否执行
  loading.value = true;

  await chatStore.sendMessageToCoze(question.value); // ⬅️ 关键调用
  question.value = ""; 
  loading.value = false;
   
};

// **组件挂载时加载聊天记录**
onMounted(() => {
  if (!chatId.value) {
    chatStore.createNewChat();
  }
});
</script>

<style scoped>
.chat-container {
  width: 850px;
  margin: 50px auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-top: 30px;
}

.chat-body {
  width: 100%;
  height: 500px; /* 适配输入框和 header */
  overflow-y: auto;
}

.chat-input {
  display: flex;
  background-color: white;
  position: fixed;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  width: 800px;
}
</style>
