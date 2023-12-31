import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/TimelineQuest-ithelp-sample/',
    plugins: [
        vue(),
        Components({
            dirs: ['src/components'],
            resolvers: [IconsResolver()],
        }),
        Icons({
            autoInstall: true,
        }),
    ],
    resolve: {
        alias: [{ find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) }],
    },
    test: {
        globals: true,
        environment: 'jsdom',
    },
});
