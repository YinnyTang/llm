<template>
    <!-- 聊天记录抽屉 -->
    <el-drawer
      v-model="uiStore.isDrawerVisible"
      direction="ltr"
      size="250px"
      :show-close="false"
    >
    <div class="chat-history-container">
        <!-- 抽屉内部的按钮组 -->
      <div class="nav-buttons">
        <el-button type="primary" @click="toggleDrawer">
          {{ drawerText }}
        </el-button>
  
        <el-button type="success" class="new-chat-btn" @click="createNewChat">
          新建聊天
        </el-button>
      </div>
        <ul class="chat-list">
          <li v-for="chat in chatList" :key="chat.id" class="chat-item">
            <div class="chat-item-content">
              <template v-if="editingChatId === chat.id">
                <el-input
                  v-model="chat.name"
                  @blur="saveChatName(chat)"
                  @keyup.enter="saveChatName(chat)"
                  class="edit-input"
                />
              </template>
  
              <template v-else>
                <el-button
                  @click="switchChat(chat.id)"
                  :type="chat.id === chatId ? 'success' : 'default'"
                  class="chat-btn"
                >
                  <div class="chat-summary">{{ getChatSummary(chat) }}</div>
                </el-button>
              </template>
  
              <el-dropdown placement="top-start" trigger="click">
                <el-button size="small" class="menu-btn">···</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="renameChat(chat.id)">
                      重命名
                    </el-dropdown-item>
                    <el-dropdown-item @click="deleteChat(chat.id)">
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </li>
        </ul>
      </div>
    </el-drawer>
</template>
  
<script setup>
  import { ref, onMounted } from "vue";
  import { ElMessageBox } from "element-plus";
  import { useUIStore } from "../stores/uiStore"; 
  import { computed } from "vue";
  import { useChatStore } from "../stores/chatStore";
  import { useRouter } from "vue-router";

  const router = useRouter();
  const chatStore = useChatStore();
  const uiStore = useUIStore();
  const drawerText = computed(() => (uiStore.isDrawerVisible ? "收起聊天记录" : "展开聊天记录"));

  const toggleDrawer = () => {
    uiStore.toggleDrawer();
  };
  const chatList = computed(() => chatStore.chatList); // 从 store 获取 chatList
  const chatId = computed(() => chatStore.chatId); // 从 store 获取当前 chatId

  // 编辑聊天名称
const editingChatId = ref(null);
const switchChat = (id) => {
  chatStore.switchChat(id);  // 调用 store 中的切换聊天函数
  
  // 获取当前路由路径
  const currentPath = router.currentRoute.value.path;
  
  // 如果在首页，则使用 push 进行导航
  if (currentPath === '/') {
    router.push({
      path: '/chat',
      query: { chatId: id }
    });
  } else {
    // 如果已经在聊天页面，则使用 replace 更新参数
    router.replace({ query: { chatId: id } });
  }
};

const renameChat = (id) => {
  editingChatId.value = id;
};

const saveChatName = (chat) => {
  editingChatId.value = null;
  chatStore.saveChatName(chat);  // 调用 store 中保存聊天名称的函数
};

const deleteChat = (id) => {
  chatStore.deleteChat(id);  // 调用 store 中删除聊天的函数
};

const createNewChat = () => {
  chatStore.createNewChat();  // 调用 store 中新建聊天的函数
  router.replace({ query: { chatId: chatStore.chatId } }); // 更新 URL 为新创建的聊天
};

// 获取摘要（首条用户消息，超出5字用...，无消息显示"新会话"或"无内容"）
const getChatSummary = (chat) => {
  const storedChats = localStorage.getItem("chats");
  if (storedChats) {
    const chats = JSON.parse(storedChats);
    const messages = chats[chat.id] || [];
    const firstUserMsg = messages.find((msg) => msg.role === "user");
    if (firstUserMsg && firstUserMsg.content) {
      return firstUserMsg.content.length > 5
        ? firstUserMsg.content.slice(0, 5) + "..."
        : firstUserMsg.content;
    }
    // 没有用户消息但有其它消息
    if (messages.length > 0) return "无内容";
  }
  return "新会话";
};

  onMounted(() => {
  chatStore.loadChatList(); // 加载聊天记录列表
});
</script>

<style scoped>
/* 让按钮固定在抽屉顶部 */
.toggle-btn {
  width: 100%;
  margin-bottom: 10px;
}

.nav-buttons {
  display: flex;
  justify-content: center; /* 让按钮居中 */
  align-items: center;
  width: 100%; /* 确保按钮区域填充整个顶部 */
  position: absolute; /* 让按钮固定在顶部 */
  top: 10px; /* 与顶部的距离 */
  left: 0;
}

.chat-history-container {
  margin-left: -25px;
}

.chat-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 让名称和菜单按钮分开 */
  width: 100%;
  padding: 10px 5px;
}

.chat-summary {
  color: #333;
  font-size: 15px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}
.chat-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 120px;
  max-width: 180px;
  padding: 6px 12px;
}
</style>
  