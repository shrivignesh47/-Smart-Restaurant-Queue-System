module.exports = app => {
    const express = require('express');
    const router = express.Router();

    // Test route
    router.get("/test", (req, res) => {
        res.json({ message: "Backend is connected successfully!" });
    });

    app.use('/api', router);
};
