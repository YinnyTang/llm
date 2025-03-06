<template>
    <div class="home-container">
      <h1>欢迎来到 AI 聊天</h1>

      <ChatInput v-model="question" :loading="loading" @send="startchat" />
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import ChatInput from "../components/ChatInput.vue"; // 引入 ChatInput 组件
  
  const question = ref(""); // 用户输入的问题
  const loading = ref(false); // 控制加载状态
  const router = useRouter();
  
  // 处理发送消息
  const startchat = (msg) => {
    console.log("用户发送了:", msg);
    router.push("/chat"); // 发送后跳转到 Chat 页面
  };
  </script>
  
  <style scoped>
  .home-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;
  }
  </style>
  