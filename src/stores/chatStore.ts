import { defineStore } from "pinia";
import { ref, nextTick, watch, onMounted } from "vue";

const BOT_ID = "7465630144141950985";

export const useChatStore = defineStore("chat", () => {
  
  const chatId = ref<string | null>(null); // 当前聊天 ID
  const messages = ref<{ role: string; content: string }[]>([]);
  const chatList = ref<{ id: string; name: string }[]>([]); // 聊天列表
  const question = ref("");
  const loading = ref(false);
  const isHistoryVisible = ref(false);
  const editingChatId = ref(""); // 记录当前正在编辑的聊天 ID
  const activeMenuId = ref(""); // 当前显示菜单的聊天 ID


  const chatWindow = ref<HTMLElement | null>(null);

  const scrollToBottom = () => {
    nextTick(() => {
      if (chatWindow.value) {
        chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
      }
    });
  };

  // **编辑聊天名称**
  const renameChat = (id: string) => {
    editingChatId.value = id; // 进入编辑模式
    nextTick(() => {
      const input = document.getElementById(`edit-input-${id}`) as HTMLInputElement;
      if (input) {
        input.focus(); // 自动聚焦输入框
      }
    });
  };

  // **保存聊天名称**
  const saveChatName = (chat: { id: string; name: string }) => {
    if (!chat.name.trim()) {
      chat.name = "未命名对话"; // 防止空名
    }
    localStorage.setItem("chatList", JSON.stringify(chatList.value)); // 持久化
    editingChatId.value = ""; // 退出编辑模式
  };

  // **删除聊天**
  const deleteChat = (id: string) => {
    const index = chatList.value.findIndex((chat) => chat.id === id);
    if (index !== -1) {
      chatList.value.splice(index, 1);

      // **删除本地存储的聊天记录**
      const storedChats = localStorage.getItem("chats");
      if (storedChats) {
        const chats = JSON.parse(storedChats);
        delete chats[id];
        localStorage.setItem("chats", JSON.stringify(chats));
      }

      // 如果当前聊天被删除，清空聊天窗口
      if (chatId.value === id) {
        chatId.value = "";
        messages.value = [];
      }
    }
    activeMenuId.value = ""; // 关闭菜单
  };

  // **加载所有聊天记录**
  const loadChatList = () => {
    const storedChatList = localStorage.getItem("chatList");
    if (storedChatList) {
      chatList.value = JSON.parse(storedChatList); // **加载存储的聊天列表**
      return;
    }

    // **如果 `chatList` 为空，就从 `chats` 里生成默认的聊天列表**
    const storedChats = localStorage.getItem("chats");
    if (storedChats) {
      const chats = JSON.parse(storedChats);
      chatList.value = Object.keys(chats).map((id) => ({
        id,
        name: `对话 ${id.replace("chat-", "")}`, // 默认名称
      }));
    }
  };

  // **切换聊天，加载历史记录**
  const switchChat = (id: string) => {
    chatId.value = id;
    const storedChats = localStorage.getItem("chats");
    if (storedChats) {
      const chats = JSON.parse(storedChats);
      messages.value = chats[id] || [];
    }
    scrollToBottom();
  };

  // **保存聊天记录到 localStorage**
  const saveChatsToStorage = () => {
    if (!chatId.value) return; // 避免在 `chatId` 为空时存储
    const storedChats = localStorage.getItem("chats");
    const chats = storedChats ? JSON.parse(storedChats) : {};
    chats[chatId.value] = messages.value;
    localStorage.setItem("chats", JSON.stringify(chats));
    localStorage.setItem("chatList", JSON.stringify(chatList.value));
  };

  // **新建聊天**
  const createNewChat = () => {
    chatId.value = `chat-${Date.now()}`; // 生成新 ID
    messages.value = []; // 清空当前聊天
    chatList.value.push({
      id: chatId.value,
      name: `对话 ${chatId.value.replace("chat-", "")}`,
    });
    saveChatsToStorage(); // 立即保存到 localStorage
  };

  /** 发送用户输入 */
const sendQuestion = async () => {
    if (!question.value.trim()) return;
  
    if (!chatId.value) {
      createNewChat();
    }
  
    messages.value.push({ role: "user", content: question.value });
    scrollToBottom();
    loading.value = true;
    try {
      await sendMessageToCoze(question.value);
    } catch (error) {
      messages.value.push({
        role: "ai",
        content: "请求出错，请检查 API Key 或网络连接。",
      });
    }
    question.value = "";
    loading.value = false;
  };

  // **发送消息**
  const sendMessageToCoze = async (message: string) => {
    try {
      messages.value.push({ role: "user", content: message });

      const response = await fetch("/api/coze/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, botId: BOT_ID }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let done = false;
      let result = "";
      const aiMessage = { role: "ai", content: "" };

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        result += decoder.decode(value, { stream: true });

        aiMessage.content = result;
      }
      // 当流读取完成后，推送完整的 AI 消息到 messages 数组
      messages.value.push(aiMessage);

      saveChatsToStorage(); // 保存聊天记录
      return result;
    } catch (error) {
      console.error("Error calling Coze API:", error);
      return null;
    }
  };

  // **监听消息数组的变化，自动保存**
  watch(messages, saveChatsToStorage, { deep: true });
  // **在 store 里自动加载聊天列表**
  onMounted(() => {
    loadChatList();
  });

  return {
    BOT_ID,
    chatId,
    messages,
    question,
    loading,
    isHistoryVisible,
    chatWindow,
    scrollToBottom,
    editingChatId,
    activeMenuId,
    renameChat,
    saveChatName,
    deleteChat,
    chatList,
    loadChatList,
    switchChat,
    saveChatsToStorage,
    createNewChat,
    sendMessageToCoze,
    sendQuestion,

  };
});
