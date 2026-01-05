const Reservation = require("../models/reservation.model.js");
const User = require("../models/user.model.js");

exports.create = (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    const phone = req.body.customer_phone;

    // Helper function to create the reservation
    const createReservationWithUser = (userId) => {
        const reservation = new Reservation({
            restaurant_id: req.body.restaurant_id,
            customer_name: req.body.customer_name,
            customer_email: req.body.customer_email,
            customer_phone: phone,
            party_size: req.body.party_size,
            reservation_date: req.body.reservation_date,
            reservation_time: req.body.reservation_time,
            table_id: req.body.table_id,
            status: req.body.status,
            special_requests: req.body.special_requests,
            payment_status: req.body.payment_status,
            payment_amount: req.body.payment_amount,
            user_id: userId
        });

        Reservation.create(reservation, (err, data) => {
            if (err)
                res.status(500).send({ message: err.message || "Error creating reservation." });
            else res.send(data);
        });
    };

    // If user_id is provided from frontend (logged in user), use it directly
    if (req.body.user_id) {
        createReservationWithUser(req.body.user_id);
        return;
    }

    // Find if user exists by phone
    User.findByContactInfo(phone, (err, user) => {
        if (err) {
            if (err.kind === "not_found") {
                // If user doesn't exist, create a simplified account
                const newUser = {
                    name: req.body.customer_name,
                    contact_info: phone,
                    email: req.body.customer_email,
                    role: "Customer"
                };

                User.create(newUser, (createErr, createdUser) => {
                    if (createErr) {
                        console.error("[Reservation Controller] Error auto-creating user:", createErr);
                        // Still create reservation even if user creation fails (fallback)
                        createReservationWithUser(null);
                    } else {
                        createReservationWithUser(createdUser.id);
                    }
                });
            } else {
                console.error("[Reservation Controller] Error finding user:", err);
                createReservationWithUser(null);
            }
        } else if (user) {
            // User exists, link to it
            createReservationWithUser(user.id);
        }
    });
};

exports.findAllByRestaurant = (req, res) => {
    Reservation.getAllByRestaurant(req.params.restaurantId, (err, data) => {
        if (err)
            res.status(500).send({ message: err.message || "Error retrieving reservations." });
        else res.send(data);
    });
};

exports.findAllByUser = (req, res) => {
    User.findById(req.params.userId, (userErr, user) => {
        const phone = user ? user.contact_info : null;
        Reservation.getAllByUser(req.params.userId, phone, (err, data) => {
            if (err)
                res.status(500).send({ message: err.message || "Error retrieving user reservations." });
            else res.send(data);
        });
    });
};

exports.updateStatus = (req, res) => {
    if (!req.body.status) {
        res.status(400).send({ message: "Status is required!" });
        return;
    }

    Reservation.findById(req.params.id, (err, reservation) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Reservation not found.` });
            } else {
                res.status(500).send({ message: "Error retrieving reservation." });
            }
            return;
        }

        // Authorization logic
        const isAdmin = req.userRole === 'Admin';
        const isManager = (req.userRole === 'RestaurantAdmin' || req.userRole === 'Admin') && (isAdmin || req.restaurantId == reservation.restaurant_id);
        const isOwner = req.userId == reservation.user_id && req.body.status === 'Cancelled';

        if (!isAdmin && !isManager && !isOwner) {
            return res.status(403).send({ message: "You are not authorized to perform this action." });
        }

        if (req.body.status === 'Cancelled') {
            const cancelledBy = req.body.cancelled_by || (isOwner ? 'Customer' : 'Restaurant');
            const reason = req.body.cancellation_reason || 'No reason provided';

            Reservation.cancel(req.params.id, cancelledBy, reason, (err, data) => {
                if (err) {
                    res.status(500).send({ message: "Error cancelling reservation." });
                } else res.send(data);
            });
            return;
        }

        // Only managers/admins can update to other statuses
        if (!isAdmin && !isManager) {
            return res.status(403).send({ message: "Only managers can update reservation status." });
        }

        Reservation.updateStatus(req.params.id, req.body.status, (err, data) => {
            if (err) {
                res.status(500).send({ message: "Error updating reservation status." });
            } else res.send(data);
        });
    });
};

exports.update = (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    Reservation.updateById(req.params.id, req.body, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Reservation not found with id ${req.params.id}.` });
            } else {
                res.status(500).send({ message: "Error updating reservation with id " + req.params.id });
            }
        } else res.send(data);
    });
};

exports.delete = (req, res) => {
    Reservation.findById(req.params.id, (err, reservation) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Reservation not found.` });
            } else {
                res.status(500).send({ message: "Error retrieving reservation." });
            }
            return;
        }

        // Authorization logic: Only Admin or relevant Restaurant Manager
        const isAdmin = req.userRole === 'Admin';
        const isManager = (req.userRole === 'RestaurantAdmin' || req.userRole === 'Admin') && (isAdmin || req.restaurantId == reservation.restaurant_id);

        if (!isAdmin && !isManager) {
            return res.status(403).send({ message: "You are not authorized to delete this reservation." });
        }

        Reservation.remove(req.params.id, (removeErr, data) => {
            if (removeErr) {
                if (removeErr.kind === "not_found") {
                    res.status(404).send({ message: `Not found Reservation with id ${req.params.id}.` });
                } else {
                    res.status(500).send({ message: "Could not delete Reservation with id " + req.params.id });
                }
            } else res.send({ message: `Reservation was deleted successfully!` });
        });
    });
};
