const svc = require('../services/notificationsService');
const db = require('../configs/pg');

function getAuthIds(req) {
    const u = req.user || req.auth || {};

    const parseNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    };

    const userId = 
        parseNum(u.sub)

    const userTypeId =
        parseNum(u.role)

    return { userId, userTypeId };
}


function toArray(val, fallback = []) {
    if (val == null) return fallback;
    if (Array.isArray(val)) return val.filter(Boolean).map(String);
    const s = String(val).trim();
    if (!s) return fallback;
    return s.split(',').map(v => v.trim()).filter(Boolean);
}

async function enqueue(req, res, next) {
    try {
        const { userId } = getAuthIds(req);
        const result = await svc.enqueueNotificacao(req.body, { userId });
        res.status(201).json(result);
    } catch (e) { next(e); }
}

async function list(req, res, next) {

    const { userId, userTypeId } = getAuthIds(req);
    try {
        const { userId, userTypeId } = getAuthIds(req);

        const canal = String(req.query.canal || 'in_app').trim();

        const includeStatus = toArray(
            req.query.includeStatus != null ? req.query.includeStatus : req.query.status,
            ['queued', 'sent', 'read']
        );

        const tipo = toArray(req.query.tipo, []);

        const ocorrenciaIdRaw = req.query.ocorrenciaId ?? req.query.ocorrencia_id ?? null;
        const ocorrenciaId = Number.isFinite(Number(ocorrenciaIdRaw)) ? Number(ocorrenciaIdRaw) : null;

        const cursorRaw = req.query.cursor ?? null;
        const cursor = cursorRaw ? new Date(cursorRaw) : null;

        const limit = Math.min(Number(req.query.limit || 50) || 50, 100);

        const result = await svc.listNotificacoes(
            userId,
            userTypeId,
            { canal, includeStatus, tipo, ocorrenciaId, cursor, limit }
        );

        res.json(result);
    } catch (e) { next(e); }
}

async function getById(req, res, next) {
    try {
        const { userId, userTypeId } = getAuthIds(req);
        const row = await svc.getNotificacaoById(Number(req.params.id), { userId, userTypeId });
        if (!row) return res.status(404).end();
        res.json(row);
    } catch (e) { next(e); }
}

async function unread(req, res, next) {
    try {
        const { userId, userTypeId } = getAuthIds(req);
        const count = await svc.unreadCount(userId, userTypeId, { canal: req.query.canal || 'in_app' });
        res.json({ unread: count });
    } catch (e) { next(e); }
}

async function markRead(req, res, next) {
    try {
        const { userId, userTypeId } = getAuthIds(req);
        const row = await svc.markNotificacaoRead(Number(req.params.id), { userId, userTypeId });
        if (!row) return res.status(404).end();
        res.json(row);
    } catch (e) { next(e); }
}

async function markAllRead(req, res, next) {
    try {
        const { userId, userTypeId } = getAuthIds(req);
        await svc.markAllNotificacoesRead({ userId, userTypeId, canal: req.body?.canal || 'in_app' });
        res.status(204).end();
    } catch (e) { next(e); }
}

async function subscribe(req, res, next) {
    try {
        const { userId } = getAuthIds(req);
        const { endpoint, keys } = req.body || {};
        if (!userId || !endpoint || !keys) return res.status(400).json({ error: 'invalid payload' });
        await db.query(
            `insert into t_webpush_subscription(user_id, endpoint, keys)
       values ($1,$2,$3)
       on conflict (user_id, endpoint) do update set keys=excluded.keys`,
            [userId, endpoint, keys]
        );
        res.status(201).json({ ok: true });
    } catch (e) { next(e); }
}

module.exports = {
    enqueue,
    list,
    getById,
    unread,
    markRead,
    markAllRead,
    subscribe,
};
