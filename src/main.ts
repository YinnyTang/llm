import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router.ts"; // 引入路由
import { createPinia } from "pinia"; // 引入状态管理
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './prism.ts'; // 引入 Prism 配置


const app = createApp(App);
app.use(router); // 挂载 Vue Router
app.use(createPinia()); // 挂载状态管理
app.use(ElementPlus)
app.mount("#app"); // 挂载到 HTML
