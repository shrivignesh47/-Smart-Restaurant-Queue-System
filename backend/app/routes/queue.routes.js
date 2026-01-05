module.exports = app => {
    const queue = require("../controllers/queue.controller.js");
    const { verifyToken } = require("../middleware/authJwt");
    var router = require("express").Router();

    // Join the Queue
    router.post("/", queue.create);

    // Retrieve all Queue entries for a restaurant
    router.get("/restaurant/:restaurantId", queue.findAllByRestaurant);

    // Update a Queue status (At least authenticated, or staff)
    router.patch("/:id/status", [verifyToken], queue.updateStatus);

    app.use('/api/queue', router);
};
