module.exports = app => {
    const tables = require("../controllers/table.controller.js");
    const { verifyToken, isRestaurantAdmin } = require("../middleware/authJwt.js");
    var router = require("express").Router();

    // Public routes
    router.get("/available", tables.findAvailable);
    router.get("/restaurant/:restaurantId", tables.findAllByRestaurant);

    // Protected management routes
    router.post("/", [verifyToken, isRestaurantAdmin], tables.create);
    router.post("/bulk", [verifyToken, isRestaurantAdmin], tables.bulkCreate);
    router.put("/:id", [verifyToken, isRestaurantAdmin], tables.update);
    router.patch("/:id/status", [verifyToken], tables.updateStatus); // Allow staff to update status
    router.delete("/:id", [verifyToken, isRestaurantAdmin], tables.delete);

    app.use('/api/tables', router);
};
