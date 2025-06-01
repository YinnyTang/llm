<template>
    <div class="p-4 space-y-4">
      <h2 class="text-xl font-bold">🧪 防抖 & 节流 Demo</h2>
  
      <div class="space-y-2">
        <button @click="debouncedClick" class="px-4 py-2 bg-blue-500 text-white rounded">
          点击（防抖按钮）
        </button>
        <p>防抖触发次数：{{ debounceCount }}</p>
      </div>
  
      <div class="space-y-2">
        <button @click="throttledClick" class="px-4 py-2 bg-green-500 text-white rounded">
          点击（节流按钮）
        </button>
        <p>节流触发次数：{{ throttleCount }}</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  
  // 计数器
  const debounceCount = ref(0);
  const throttleCount = ref(0);
  
  // 防抖函数
  function debounce<T extends (...args: any[]) => void>(fn: T, delay = 1000) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return function (this: any, ...args: Parameters<T>) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  }
  
  // 节流函数
  function throttle<T extends (...args: any[]) => void>(fn: T, delay = 1000) {
    let last = 0;
    return function (this: any, ...args: Parameters<T>) {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        fn.apply(this, args);
      }
    };
  }
  
  // 实际执行函数
  const increaseDebounce = () => {
    debounceCount.value++;
    console.log("防抖触发，当前次数：", debounceCount.value, "时间：", new Date().toLocaleTimeString());
  };
  const increaseThrottle = () => {
    throttleCount.value++;
    console.log("节流触发，当前次数：", throttleCount.value, "时间：", new Date().toLocaleTimeString());
  };
  
  // 包装后的点击事件
  const debouncedClick = debounce(increaseDebounce, 1000);
  const throttledClick = throttle(increaseThrottle, 1000);
  </script>
  