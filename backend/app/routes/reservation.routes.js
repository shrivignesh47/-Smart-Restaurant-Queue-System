module.exports = app => {
    const reservations = require("../controllers/reservation.controller.js");
    const { verifyToken, isRestaurantAdmin } = require("../middleware/authJwt");
    var router = require("express").Router();

    // Create a new Reservation
    router.post("/", reservations.create);

    // Retrieve all Reservations for a restaurant
    router.get("/restaurant/:restaurantId", reservations.findAllByRestaurant);

    // Retrieve all Reservations for a user
    router.get("/user/:userId", [verifyToken], reservations.findAllByUser);

    // Update a Reservation
    router.put("/:id", [verifyToken, isRestaurantAdmin], reservations.update);

    // Update a Reservation status
    router.patch("/:id/status", [verifyToken], reservations.updateStatus);

    // Delete a Reservation
    router.delete("/:id", [verifyToken, isRestaurantAdmin], reservations.delete);

    app.use('/api/reservations', router);
};
