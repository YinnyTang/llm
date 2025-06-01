import { defineStore } from "pinia";
import { ref, nextTick, watch, onMounted } from "vue";

const BOT_ID = "7510883133068541978";

// 定义消息类型
interface ChatMessage {
  role: string;
  content: string;
  loading?: boolean;
}

// 防抖工具函数
function debounce<T extends (...args: any[]) => void>(fn: T, delay = 500) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function(this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  } as T;
}

export const useChatStore = defineStore("chat", () => {

  const chatId = ref<string | null>(null); // 当前聊天 ID
  const messages = ref<ChatMessage[]>([]);
  const chatList = ref<{ id: string; name: string }[]>([]); // 聊天列表
  const question = ref("");
  const loading = ref(false);
  const isHistoryVisible = ref(false);
  const editingChatId = ref(""); // 记录当前正在编辑的聊天 ID
  const activeMenuId = ref(""); // 当前显示菜单的聊天 ID


  const chatWindow = ref<HTMLElement | null>(null);

  // 原始的滚动函数
  const scrollToBottomOriginal = () => {
    nextTick(() => {
      if (chatWindow.value) {
        chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
      }
    });
  };

  // 防抖后的滚动函数
  const scrollToBottom = debounce(scrollToBottomOriginal, 100); // 滚动使用较短的延迟

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
    if (!id) return;
    
    chatId.value = id;
    const storedChats = localStorage.getItem("chats");
    if (storedChats) {
      const chats = JSON.parse(storedChats);
      messages.value = chats[id] || [];
    } else {
      messages.value = [];
    }
    
    // 确保该聊天在列表中存在
    const chatExists = chatList.value.some(chat => chat.id === id);
    if (!chatExists) {
      chatList.value.push({
        id,
        name: `对话 ${id.replace("chat-", "")}`,
      });
      saveChatsToStorage();
    }
    
    scrollToBottom();
  };

  // 原始的保存函数
  const saveChatsToStorageOriginal = () => {
    if (!chatId.value) return;
    const storedChats = localStorage.getItem("chats");
    const chats = storedChats ? JSON.parse(storedChats) : {};
    chats[chatId.value] = messages.value;
    localStorage.setItem("chats", JSON.stringify(chats));
    localStorage.setItem("chatList", JSON.stringify(chatList.value));
  };

  // 防抖后的保存函数
  const saveChatsToStorage = debounce(saveChatsToStorageOriginal, 500);

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
      const response = await fetch("/api/coze/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot_id: BOT_ID,
          user_id: chatId.value || `user_${Date.now()}`,
          additional_messages: [
            {
              role: "user",
              content: message,
            },
          ],
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let done = false;
      let result = "";

      // 在添加新消息前，先移除 loading 消息
      const loadingMsgIndex = messages.value.findIndex(msg => msg.loading);
      if (loadingMsgIndex !== -1) {
        // 不是删除loading消息，而是更新它
        const loadingMsg = messages.value[loadingMsgIndex];
        loadingMsg.loading = false;
        loadingMsg.role = 'ai';
        loadingMsg.content = '';

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const text = decoder.decode(value, { stream: true });
          result += text;
          loadingMsg.content = result;
        }
      }

      saveChatsToStorage(); // 保存聊天记录
      return result;
    } catch (error) {
      console.error("Error calling Coze API:", error);
      // 发生错误时移除 loading 消息
      const loadingMsgIndex = messages.value.findIndex(msg => msg.loading);
      if (loadingMsgIndex !== -1) {
        messages.value.splice(loadingMsgIndex, 1);
      }
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
