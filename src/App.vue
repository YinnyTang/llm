<template>
  <div class="app-container">
    <TopNavbar />
    <ChatHistory :chatList="chatList" :chatId="chatId" />

    <!-- 路由页面 -->
    <router-view />
  </div>
</template>

<script setup>
import { ref } from "vue";
import TopNavbar from "./components/TopNavbar.vue";
import ChatHistory from "./components/ChatHistory.vue";
import { useUIStore } from './stores/uiStore'; 
// 控制聊天记录抽屉显隐
//const isDrawerVisible = ref(false);
const uiStore = useUIStore();

</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.main-content {
  display: flex;
  flex: 1;
}
.top-navbar {
  position: fixed;
  top: 0;
  width: 100%;
  padding: 10px;
}

</style>
