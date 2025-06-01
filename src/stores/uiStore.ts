// src/stores/uiStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUIStore = defineStore("ui", () => {
  const isDrawerVisible = ref<boolean>(false);

  const toggleDrawer = () => {
    isDrawerVisible.value = !isDrawerVisible.value;
  };

  return {
    isDrawerVisible,
    toggleDrawer,
  };
}); 