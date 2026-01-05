module.exports = app => {
    const restaurants = require("../controllers/restaurant.controller.js");
    const { verifyToken, isAdmin } = require("../middleware/authJwt.js");

    var router = require("express").Router();

    // Public routes
    router.get("/restaurants", restaurants.findAll);
    router.get("/restaurants/slug/:slug", restaurants.findBySlug);
    router.get("/restaurants/:id", restaurants.findOne);

    // Admin and Restaurant Admin routes
    router.post("/restaurants", [verifyToken, isAdmin], restaurants.create);
    router.put("/restaurants/:id", [verifyToken, isRestaurantAdmin], restaurants.update);
    router.delete("/restaurants/:id", [verifyToken, isAdmin], restaurants.delete);
    router.get("/restaurants/:id/stats", [verifyToken, isRestaurantAdmin], restaurants.getStats);

    // Scanner Access Key Management (Restaurant Admin only)
    router.put("/restaurants/:id/scanner-key", [verifyToken, isRestaurantAdmin], restaurants.updateScannerKey);
    router.get("/restaurants/:id/scanner-key", [verifyToken, isRestaurantAdmin], restaurants.getScannerKey);

    app.use('/api', router);
};
