export const routes = [
  {
    path: '/',
    redirect: '/home',
    component: () => import('@/layout/basic/index.vue'),
    children: [
      {
        path: 'home',
        name: 'HomePage',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: 'home',
          keepAlive: true,
        },
      },
      {
        name: 'orderDetail',
        path: '/order/detail',
        component: () => import('@/views/order/detail.vue'),
        meta: {
          title: 'order.detail',
          border: false,
        },
      },
    ],
  },
  // 匹配不到重定向会主页
  {
    // 找不到路由重定向到404页面
    path: '/:pathMatch(.*)',
    redirect: '/Home',
  },
];

export default routes;
