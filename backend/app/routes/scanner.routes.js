module.exports = app => {
    const scanner = require("../controllers/scanner.controller.js");

    var router = require("express").Router();

    // Public endpoints (no authentication required)

    // Validate access key
    router.post("/validate-key", scanner.validateKey);

    // Check-in reservation via QR code
    router.post("/check-in", scanner.checkIn);

    // Get reservation details (requires valid access key in query)
    router.get("/reservation/:id", scanner.getReservation);

    // Get daily stats (requires valid access key in query)
    router.get("/stats", scanner.getDailyStats);

    app.use('/api/scanner', router);
};
