module.exports = app => {
    const queue = require("../controllers/queue.controller.js");
    const { verifyToken } = require("../middleware/authJwt");
    var router = require("express").Router();

    router.post("/", queue.create);

    router.get("/restaurant/:restaurantId", queue.findAllByRestaurant);

    router.get("/:id", queue.findOne);

    router.patch("/:id/status", [verifyToken], queue.updateStatus);

    app.use('/api/queue', router);
};
