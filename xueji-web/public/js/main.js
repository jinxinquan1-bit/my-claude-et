// 应用入口：监听 hash 变化渲染页面
import { navigate } from './router.js';

window.addEventListener('hashchange', navigate);
navigate();
