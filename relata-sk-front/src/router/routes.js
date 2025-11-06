const routes = [
    {
        path: '/',
        component: () => import('src/layouts/MainLayout.vue'),
        children: [
            { path: '', redirect: '/login' },

            {
                path: 'login',
                name: 'login',
                component: () => import('src/pages/LoginPage.vue'),
                meta: { public: true },
            },
            {
                path: 'register',
                name: 'register',
                component: () => import('src/pages/RegisterPage.vue'),
                meta: { public: true },
            },
            {
                path: 'forgot',
                name: 'forgot',
                component: () => import('src/pages/ForgotPasswordPage.vue'),
                meta: { public: true },
            },
        ],
    },

    {
        path: '/home',
        component: () => import('src/layouts/MainLayoutCliente.vue'),
        meta: { roles: [1] },
        children: [
            { path: '', redirect: '/home/ocorrencias' },
            {
                path: 'ocorrencias',
                name: 'cliente.ocorrencias',
                component: () => import('src/pages/cliente/OcorrenciaLista.vue'),
            },
            {
                path: 'ocorrencias/nova',
                name: 'cliente.ocorrencias.nova',
                component: () => import('src/pages/cliente/OcorrenciaRegistrar.vue'),
            },
            {
                path: 'ocorrencias/:id',
                name: 'cliente.ocorrencias.detalhe',
                component: () => import('src/pages/cliente/OcorrenciaDetalhe.vue'),
            },
            {
                path: 'ocorrencias/perto',
                name: 'cliente.ocorrencias.perto',
                component: () => import('src/pages/cliente/OcorrenciasPerto.vue'),
            },
            {
                path: 'notificacoes',
                name: 'cliente.notificacoes',
                component: () => import('src/pages/cliente/NotificationsCliente.vue'),
                props: { scope: 'client' },
            },
        ],
    },

    {
        path: '/admin',
        component: () => import('src/layouts/AdminLayout.vue'),
        meta: { requiresAuth: true, roles: [2, 3, 4] },
        children: [
            {
                path: '', redirect: { name: 'admin.ocorrencias', }
            },
            {
                path: 'ocorrencias',
                name: 'admin.ocorrencias',
                component: () => import('src/pages/admin/OcorrenciasAdminList.vue'),
            },
            {
                path: 'ocorrencias/:id',
                name: 'admin.ocorrencia.detalhe',
                component: () => import('src/pages/admin/OcorrenciaAdminDetalhe.vue'),
            },
            {
                path: 'usuarios',
                name: 'admin.usuarios',
                component: () => import('src/pages/admin/UsuariosAdmin.vue'),
            },
            {
                path: 'notificacoes',
                name: 'admin.notificacoes',
                component: () => import('src/pages/admin/NotificationsAdmin.vue'),
                props: { scope: 'admin' },
            },
            {
                path: 'dashboard',
                name: 'admin.dashboard',
                component: () => import('src/pages/admin/DashboardPage.vue'),
                props: { scope: 'admin' },
            },
            {
                path: 'mapaocorrencias',
                name: 'admin.mapa',
                component: () => import('src/pages/admin/MapaOcorrencias.vue'),
                props: { scope: 'admin' },
            },
        ],
    },
]

export default routes
