import { createVitePlugins } from './build/vite/plugins';
import { resolve } from 'path';
import { ConfigEnv, loadEnv, UserConfig } from 'vite';
import { wrapperEnv } from './build/utils';

const pathResolve = (dir: string) => {
  return resolve(process.cwd(), '.', dir);
};

// https://vitejs.dev/config/
export default function ({ command, mode }: ConfigEnv): UserConfig {
  const isProduction = command === 'build';
  const root = process.cwd();
  const env = loadEnv(mode, root);
  const viteEnv = wrapperEnv(env);
  return {
    root,
    resolve: {
      alias: [
        {
          find: 'vue-i18n',
          replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
        },
        // @/xxxx => src/xxxx
        {
          find: /@\//,
          replacement: pathResolve('src') + '/',
        },
        // #/xxxx => types/xxxx
        {
          find: /#\//,
          replacement: pathResolve('types') + '/',
        },
      ],
    },
    server: {
      host: true,
      hmr: true,
      cors:true,
      proxy: {
        '/api': {
            target: 'http://16.162.106.158:8000',
            changeOrigin: true,
            // rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    plugins: createVitePlugins(viteEnv, isProduction),
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          //生产环境时移除console
          drop_console: false,
          drop_debugger: false,
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 配置 nutui 全局 scss 变量
          additionalData: `@import "@nutui/nutui/dist/styles/variables.scss";@import '@/styles/mixin.scss'; @import '@/styles/vant.scss';`,
        },
      },
    },
  };
}
