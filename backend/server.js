require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const corsOptions = {
    origin: 'http://localhost:4200'
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const User = require("./app/models/user.model.js");
const sql = require("./app/models/db.js");

const systemStats = {
    startTime: Date.now(),
    requestCount: 0,
    errorCount: 0,
    logs: []
};

const activityLog = []; // Real-time activity stream

app.use((req, res, next) => {
    if (req.path.includes('/system-stats')) return next();

    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = {
            id: Date.now() + Math.random(),
            timestamp: new Date(),
            method: req.method,
            path: req.originalUrl || req.path,
            status: res.statusCode,
            duration
        };
        systemStats.logs.unshift(log);
        if (systemStats.logs.length > 50) systemStats.logs.pop();

        systemStats.requestCount++;
        if (res.statusCode >= 400) systemStats.errorCount++;

        if (res.statusCode >= 200 && res.statusCode < 300) {
            let activity = null;
            if (req.method === 'POST' && req.originalUrl.includes('/restaurants')) {
                activity = { title: 'New Restaurant Joined', desc: 'A new restaurant partner registered', type: 'create' };
            } else if (req.method === 'POST' && req.originalUrl.includes('/auth/signup')) {
                activity = { title: 'New User Account', desc: 'A new user registered on the platform', type: 'user' };
            } else if (req.method === 'PUT' && req.originalUrl.includes('/settings')) {
                activity = { title: 'System Settings Updated', desc: 'Admin updated system configuration', type: 'update' };
            }

            if (activity) {
                activityLog.unshift({ ...activity, id: Date.now(), time: new Date() });
                if (activityLog.length > 20) activityLog.pop();
            }
        }
    });
    next();
});


app.get('/', (req, res) => {
    res.json({ message: "Welcome to Smart Restaurant Queue System API." });
});

app.get('/api/admin/system-stats', (req, res) => {
    const memory = process.memoryUsage();

    const getCount = (table) => new Promise(resolve => {
        sql.query(`SELECT COUNT(*) as c FROM ${table}`, (err, r) => resolve(err ? 0 : r[0].c));
    });

    Promise.all([
        getCount('restaurants'),
        getCount('users'),
        getCount('reservations') // Assuming table name
    ]).then(([restCount, userCount, resCount]) => {
        res.json({
            uptime: Math.floor((Date.now() - systemStats.startTime) / 1000),
            requestCount: systemStats.requestCount,
            errorCount: systemStats.errorCount,
            memory: {
                rss: Math.round(memory.rss / 1024 / 1024),
                heapUsed: Math.round(memory.heapUsed / 1024 / 1024)
            },
            logs: systemStats.logs,
            recentActivities: activityLog,
            dbCounts: {
                restaurants: restCount,
                users: userCount,
                reservations: resCount
            }
        });
    });
});
const Restaurant = require("./app/models/restaurant.model.js");
const Table = require("./app/models/table.model.js");
const Queue = require("./app/models/queue.model.js");
const Reservation = require("./app/models/reservation.model.js");

User.initTable();
Restaurant.initTable();
Table.initTable();
Queue.initTable();
Reservation.initTable();

require("./app/routes/test.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/restaurant.routes")(app);
require("./app/routes/table.routes")(app);
require("./app/routes/queue.routes")(app);
require("./app/routes/reservation.routes")(app);
require("./app/routes/scanner.routes")(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
