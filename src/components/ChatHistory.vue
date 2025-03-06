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
                  {{ chat.name }}
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
</style>
  