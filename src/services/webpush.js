// src/services/webpush.js
const webpush = require('web-push');
const { pool } = require('../configs/pg');

const VAPID_PUBLIC = process.env.VAPID_PUBLIC;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE;
const VAPID_CONTACT = process.env.VAPID_CONTACT || 'mailto:admin@example.com';

const PUSH_ENABLED = Boolean(VAPID_PUBLIC && VAPID_PRIVATE);

if (PUSH_ENABLED) {
    try {
        webpush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC, VAPID_PRIVATE);
        console.log('[webpush] habilitado');
    } catch (err) {
        console.warn('[webpush] falha ao configurar VAPID, push desabilitado:', err.message);
    }
} else {
    console.warn('[webpush] VAPID_PUBLIC/PRIVATE não definidos — push desabilitado');
}

async function sendWebPush(userId, payload) {
    if (!PUSH_ENABLED) return false;

    const { rows } = await pool.query(
        'select endpoint, keys from t_webpush_subscription where user_id=$1',
        [userId]
    );

    const msg = JSON.stringify(payload);
    for (const s of rows) {
        try {
            await webpush.sendNotification(
                { endpoint: s.endpoint, keys: s.keys },
                msg
            );
        } catch (err) {
            console.warn('[webpush] erro ao enviar', err && err.statusCode, err && err.message);
        }
    }
    return true;
}

module.exports = { sendWebPush, PUSH_ENABLED };
