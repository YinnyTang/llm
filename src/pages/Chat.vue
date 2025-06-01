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
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore(); // ✅ 使用 Pinia 聊天 Store
const question = ref(""); // 用户输入的消息
const loading = ref(false);
// 确保 messages 从 store 中获取
const chatId = computed(() => chatStore.chatId);
const messages = computed(() => chatStore.messages);

// **发送消息**
const sendQuestion = async () => {
  if (!question.value.trim()) return;
  
  // 添加用户消息
  chatStore.messages.push({
    role: "user",
    content: question.value
  });

  // 添加一个带loading状态的AI消息
  chatStore.messages.push({
    role: "ai",
    content: "",
    loading: true
  });

  // 清空输入框并设置loading状态
  const userQuestion = question.value;
  question.value = "";
  loading.value = true;

  try {
    // 发送消息
    await chatStore.sendMessageToCoze(userQuestion);
  } catch (error) {
    console.error("发送消息失败:", error);
  } finally {
    // 移除loading状态的消息
    const loadingMsgIndex = chatStore.messages.findIndex(msg => msg.loading);
    if (loadingMsgIndex !== -1) {
      chatStore.messages.splice(loadingMsgIndex, 1);
    }
    loading.value = false;
  }
};

// 监听路由变化
watch(
  () => route.query,
  async (newQuery) => {
    let newChatId = String(newQuery.chatId || '');
    let initialMessage = String(newQuery.initialMessage || '');

    // 如果有 chatId，先切换到对应聊天
    if (newChatId) {
      await chatStore.switchChat(newChatId);
    }

    // 如果有初始消息，处理它
    if (initialMessage) {
      // 如果没有 chatId，创建新聊天
      if (!newChatId) {
        chatStore.createNewChat();
        newChatId = chatStore.chatId;
        await router.replace({
          query: { ...route.query, chatId: newChatId }
        });
      }

      // 确保消息列表被清空（如果是新对话）
      if (chatStore.messages.length === 0) {
        // 添加用户消息
        chatStore.messages.push({
          role: "user",
          content: initialMessage
        });

        // 添加 AI loading 消息
        chatStore.messages.push({
          role: "ai",
          content: "",
          loading: true
        });

        try {
          await chatStore.sendMessageToCoze(initialMessage);
        } catch (error) {
          console.error("发送消息失败:", error);
        }
      }

      // 处理完后清除 initialMessage
      const { initialMessage: _, ...rest } = route.query;
      await router.replace({ query: rest });
    }
  },
  { immediate: true }
);

// 监听消息列表变化，自动滚动到底部
watch(() => messages.value, () => {
  nextTick(() => {
    const chatWindow = document.querySelector('.chat-body');
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  });
}, { deep: true });

// **组件挂载时加载聊天记录**
onMounted(() => {
  if (!route.query.chatId && !route.query.initialMessage) {
    chatStore.createNewChat();
    // 创建新对话后更新 URL
    router.replace({
      query: { chatId: chatStore.chatId }
    });
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
  height: 590px;
  overflow-y: auto;
  
  /* 隐藏滚动条 */
  scrollbar-width: none;  /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  &::-webkit-scrollbar {  /* Chrome, Safari and Opera */
    display: none;
    width: 0;
    height: 0;
  }
  
  /* 增加消息间距 */
  :deep(.user-message),
  :deep(.ai-message) {
    margin-bottom: 50px;  /* 增加消息之间的间距 */
  }
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
