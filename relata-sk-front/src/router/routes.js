const routes = [
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/login' },
      { path: 'login', component: () => import('src/pages/LoginPage.vue') },
      { path: 'register', component: () => import('src/pages/RegisterPage.vue') },
      { path: 'forgot', component: () => import('src/pages/ForgotPasswordPage.vue') },
    ],
  },

  {
    path: '/home',
    component: () => import('src/layouts/MainLayoutCliente.vue'),
    meta: { requiresAuth: true, role: 'cliente' },
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
        path: '/home/ocorrencias/:id',
        component: () => import('pages/cliente/OcorrenciaDetalhe.vue'),
      },
      {
        path: '/home/ocorrencias/perto',
        name: 'cliente.ocorrencias.perto',
        component: () => import('src/pages/cliente/OcorrenciasPerto.vue'),
      },
    ],
  },
]

export default routes
