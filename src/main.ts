import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { WagmiPlugin } from '@wagmi/vue';
import Vconsole from 'vconsole';

import { config } from './config';
import { createApp } from 'vue';
import App from './App.vue';
import { i18n } from '@/i18n';
import router from '@/router';
import store from '@/store';
import { Ellipsis, Toast } from '@nutui/nutui';
import './assets/font/iconfont.css';
import './assets/app.css';

const queryClient = new QueryClient();
if (location.href.includes('vaonsole=1')) {
  new Vconsole();
}

const app = createApp(App);

// 路由
app.use(router);

// 国际化
app.use(i18n);

// 状态管理
app.use(store);

app.use(WagmiPlugin, { config });

app.use(VueQueryPlugin, { queryClient });
app.use(Ellipsis);
app.use(Toast);
app.mount('#app');
