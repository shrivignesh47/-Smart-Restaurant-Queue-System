const Queue = require("../models/queue.model.js");
const User = require("../models/user.model.js");

exports.create = (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    const contactInfo = req.body.contact_info;

    const joinQueueWithUser = (userId) => {
        const entry = new Queue({
            restaurant_id: req.body.restaurant_id,
            customer_name: req.body.customer_name,
            party_size: req.body.party_size,
            contact_info: contactInfo,
            status: req.body.status,
            user_id: userId
        });

        Queue.create(entry, (err, data) => {
            if (err)
                res.status(500).send({ message: err.message || "Error joining queue." });
            else res.send(data);
        });
    };

    User.findByContactInfo(contactInfo, (err, user) => {
        if (err) {
            if (err.kind === "not_found") {
                const newUser = {
                    name: req.body.customer_name,
                    contact_info: contactInfo,
                    role: "Customer"
                };

                User.create(newUser, (createErr, createdUser) => {
                    if (createErr) {
                        console.error("[Queue Controller] Error auto-creating user:", createErr);
                        joinQueueWithUser(null);
                    } else {
                        joinQueueWithUser(createdUser.id);
                    }
                });
            } else {
                console.error("[Queue Controller] Error finding user:", err);
                joinQueueWithUser(null);
            }
        } else if (user) {
            joinQueueWithUser(user.id);
        }
    });
};

exports.findAllByRestaurant = (req, res) => {
    Queue.getAllByRestaurant(req.params.restaurantId, (err, data) => {
        if (err)
            res.status(500).send({ message: err.message || "Error retrieving queue." });
        else res.send(data);
    });
};

exports.findOne = (req, res) => {
    Queue.findById(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Queue entry not found with id ${req.params.id}.` });
            } else {
                res.status(500).send({ message: "Error retrieving queue entry." });
            }
        } else res.send(data);
    });
};

exports.updateStatus = (req, res) => {
    if (!req.body.status) {
        res.status(400).send({ message: "Status is required!" });
        return;
    }

    const tableInfo = req.body.tableId ? {
        tableId: req.body.tableId,
        tableName: req.body.tableName
    } : null;

    Queue.updateStatus(req.params.id, req.body.status, tableInfo, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Queue entry not found.` });
            } else {
                res.status(500).send({ message: "Error updating queue status." });
            }
        } else res.send(data);
    });
};
