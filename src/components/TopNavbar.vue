<template>
    <div class="top-navbar">
      <!-- 按钮组 -->
      <div class="navbar-buttons">
        <el-button type="primary" @click="toggleDrawer">
            {{ drawerText }}
        </el-button>
  
        <el-button type="success" class="new-chat-btn" @click="createNewChat">
          新建聊天
        </el-button>
      </div>

      <div class="brand-title">DeepSeek</div>
    </div>
  </template>
  
  <script setup>
import { useUIStore } from "../stores/uiStore";
import { computed } from "vue";
import { useChatStore } from "../stores/chatStore";

const uiStore = useUIStore(); // 使用 Pinia 全局状态
const drawerText = computed(() => (uiStore.isDrawerVisible ? "收起聊天记录" : "展开聊天记录"));

const createNewChat = () => {
  chatStore.createNewChat();  // 调用 store 中新建聊天的函数
};

const toggleDrawer = () => {
  uiStore.toggleDrawer();
};


</script>
  
  <style scoped>
  .top-navbar {
    display: flex;
    align-items: center;
    padding: 10px 20px;
    background-color: #ffffff;
    border-bottom: 1px solid #ddd;
  }
  
  .brand-title {
    font-size: 23px;
    font-weight: bold;
    color: #575050;
    margin-left: 15px;
    letter-spacing: 1px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1); 
  }
  
  .navbar-buttons {
    display: flex;
    gap: 10px;
  }
  </style>
  