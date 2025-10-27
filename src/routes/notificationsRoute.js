const notificationsController = require("../controllers/notificationsController");
const requireAuth = require("../auth/requireAuth");

module.exports = (app) => {
    app.post(
        "/notificacoes",
        requireAuth,
        notificationsController.enqueue
    );

    app.get(
        "/notificacoes",
        requireAuth,
        notificationsController.list
    );

    app.get(
        "/notificacoes/:id",
        requireAuth,
        notificationsController.getById
    );

    app.get(
        "/notificacoes/unread/count",
        requireAuth,
        notificationsController.unread
    );

    app.post(
        "/notificacoes/:id/read",
        requireAuth,
        notificationsController.markRead
    );

    app.post(
        "/notificacoes/read_all",
        requireAuth,
        notificationsController.markAllRead
    );

    app.post(
        "/notificacoes/subscribe",
        requireAuth,
        notificationsController.subscribe
    );
};
