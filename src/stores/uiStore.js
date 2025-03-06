// src/stores/uiStore.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUIStore = defineStore("ui", () => {
  const isDrawerVisible = ref(false);

  const toggleDrawer = () => {
    isDrawerVisible.value = !isDrawerVisible.value;
  };

  return {
    isDrawerVisible,
    toggleDrawer,
  };
});
