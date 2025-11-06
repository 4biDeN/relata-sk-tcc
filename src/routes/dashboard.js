const db = require("../configs/pg");

module.exports = (app) => {
    app.get('/dashboard/metrics', async (req, res, next) => {
        try {
            const { rows } = await db.query('SELECT * FROM v_dashboard_metrics');
            res.json(rows[0] || {
                totals: { total: 0, open: 0, resolved: 0 },
                by_status: [],
                by_priority: [],
                last_30_days: [],
                avg_open_hours: 0
            });
        } catch (e) {
            next(e);
        }
    });
};
