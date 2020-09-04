import VueRouter from 'vue-router';
// import HelloWorld from "@/components/HelloWorld.vue";
// import Me from "@/components/Me.vue";

// 路由懒加载, 得结合 babel-plugin-syntax-dynamic-import 插件使用
const perfOb = () => import('@/components/perfOb');
const Crash = () => import('@/components/crash');
const swTimer = () => import('@/components/swTimer');
const CrashSimple = () => import('@/components/crashSimple');
const CrashSw = () => import('@/components/beforeunload');

const router = new VueRouter({
    routes: [
        { path: '/', redirect: { name: 'CrashSw' } },
        {
            path: '/swTimer',
            name: 'swTimer',
            component: swTimer,
        },
        {
            path: '/crash',
            name: 'crash',
            component: Crash,
        },
        {
            path: '/perfOb',
            name: 'perfOb',
            component: perfOb,
        },

        {
            path: '/crash-sw',
            name: 'CrashSw',
            component: CrashSw,
        },
        {
            path: '/crashSimple',
            name: 'crashSimple',
            component: CrashSimple,
        }
    ],
});

export default router;
