module.exports = app => {
    const reservations = require("../controllers/reservation.controller.js");
    const { verifyToken, isRestaurantAdmin } = require("../middleware/authJwt");
    var router = require("express").Router();

    router.post("/", reservations.create);

    router.get("/restaurant/:restaurantId", reservations.findAllByRestaurant);

    router.get("/user/:userId", [verifyToken], reservations.findAllByUser);

    router.put("/:id", [verifyToken, isRestaurantAdmin], reservations.update);

    router.patch("/:id/status", [verifyToken], reservations.updateStatus);

    router.delete("/:id", [verifyToken, isRestaurantAdmin], reservations.delete);

    app.use('/api/reservations', router);
};
