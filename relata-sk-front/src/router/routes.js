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
    ],
  },
  {
    path: '/admin',
    component: () => import('src/layouts/AdminLayout.vue'),
    meta: { roles: [2, 3, 4] },
    children: [
      {
        path: '',
        redirect: '/admin/ocorrencias',
      },
      {
        path: 'ocorrencias',
        name: 'admin.ocorrencias',
        component: () => import('src/pages/admin/OcorrenciasAdminList.vue'),
      },
    ],
  },
]

export default routes
