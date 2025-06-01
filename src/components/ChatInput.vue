<template>
    <div class="chat-input">
      <el-input
        v-model="inputValue"
        :disabled="loading"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 5 }"
        :placeholder="placeholder"
        class="input-area"
        @input="emitUpdateValue"
        @keydown.enter.prevent="emitSendQuestion"
      ></el-input>
      <el-button
        :loading="loading"
        type="primary"
        @click="emitSendQuestion"
        :disabled="!inputValue.trim() || loading"
        class="send-button"
      >
        发送
      </el-button>
    </div>
  </template>
  
  <script setup>
  import { ref,watch} from "vue";
  
  const props = defineProps({
    modelValue: String, // v-model 绑定的数据
    loading: Boolean, // 是否加载中
    placeholder: {
      type: String,
      default: "输入你的问题..."  // 默认提示文本
    }
  });
  const emit = defineEmits(["update:modelValue", "send"]);
  
  const inputValue = ref(props.modelValue || "");
  
// 监听外部 `modelValue` 变化，保持同步
watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue;
});

// 输入框内容同步
const emitUpdateValue = () => {
  emit("update:modelValue", inputValue.value);
};
  
  // 发送消息
  const emitSendQuestion = () => {
    if (inputValue.value.trim()) {
      emit("send", inputValue.value); // 发送消息
      inputValue.value = ""; // 清空输入框
      emit("update:modelValue", ""); // 更新父组件数据
    }
  };
  </script>
  
  <style scoped>
  .chat-input {
    min-width: 500px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .input-area {
    width: 100%;
  }
  .send-button {
    align-self: flex-end;
  }
  </style>
  