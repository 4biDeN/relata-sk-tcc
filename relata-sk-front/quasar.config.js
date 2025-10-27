// quasar.config.js
import { defineConfig } from '#q-app/wrappers'
import { fileURLToPath } from 'node:url'

export default defineConfig((ctx) => {
    return {
        // Boot files
        // adicione 'push' se for usar Web Push (PWA)
        boot: ['axios', 'auth', 'quasar-lang', 'socket'/*, 'push' */],

        css: ['app.scss'],

        extras: [
            'roboto-font',
            'material-icons',
        ],

        build: {
            target: {
                browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
                node: 'node20',
            },

            vueRouterMode: 'hash',

            // >>> ENVs disponíveis no front
            env: {
                // Socket.IO server (backend ws)
                WS_URL: 'http://localhost:8081',
                // API base (em dev você já tem proxy /api → 3001; em prod, ajuste para URL real)
                API_URL: '', // '' para usar o proxy '/api' no dev; em prod, setar URL completa
                // Web Push (opcional; só se for usar PWA + push)
                VAPID_PUBLIC: '' // ex.: 'BExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
            },

            vitePlugins: [
                [
                    '@intlify/unplugin-vue-i18n/vite',
                    {
                        ssr: ctx.modeName === 'ssr',
                        include: [fileURLToPath(new URL('./src/i18n', import.meta.url))],
                    },
                ],
                [
                    'vite-plugin-checker',
                    {
                        eslint: {
                            lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
                            useFlatConfig: true,
                        },
                    },
                    { server: false },
                ],
            ],
        },

        devServer: {
            open: true,
            proxy: {
                '/api': { target: 'http://localhost:3001', changeOrigin: true },
            },
        },

        framework: {
            config: {},
            plugins: ['Notify'],
        },

        animations: [],

        ssr: {
            prodPort: 3000,
            middlewares: ['render'],
            pwa: true,
        },

        // PWA: necessário para Web Push (custom service worker)
        pwa: {
            workboxMode: 'GenerateSW',
            // importa seu SW customizado com os handlers de 'push' e 'notificationclick'
            extendGenerateSWOptions(cfg) {
                cfg.importScripts = ['custom-service-worker.js']
            },
            // se quiser, pode ajustar o manifest em src-pwa/manifest.json
        },

        cordova: {},
        capacitor: { hideSplashscreen: true },

        electron: {
            preloadScripts: ['electron-preload'],
            inspectPort: 5858,
            bundler: 'packager',
            builder: { appId: 'relata-sk-front' },
        },

        bex: { extraScripts: [] },
    }
})
