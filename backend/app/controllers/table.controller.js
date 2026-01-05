const Table = require("../models/table.model.js");

exports.create = (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    const table = new Table({
        restaurant_id: req.body.restaurant_id,
        name: req.body.name,
        capacity: req.body.capacity,
        type: req.body.type,
        status: req.body.status,
        features: req.body.features
    });

    Table.create(table, (err, data) => {
        if (err)
            res.status(500).send({ message: err.message || "Error creating table." });
        else res.send(data);
    });
};

exports.findAllByRestaurant = (req, res) => {
    Table.getAllByRestaurant(req.params.restaurantId, (err, data) => {
        if (err)
            res.status(500).send({ message: err.message || "Error retrieving tables." });
        else res.send(data);
    });
};

exports.update = (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    Table.updateById(req.params.id, req.body, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Table not found with id ${req.params.id}.` });
            } else {
                res.status(500).send({ message: "Error updating table with id " + req.params.id });
            }
        } else res.send(data);
    });
};

exports.updateStatus = (req, res) => {
    Table.updateStatus(req.params.id, req.body, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Table not found with id ${req.params.id}.` });
            } else {
                res.status(500).send({ message: "Error updating table status." });
            }
        } else res.send(data);
    });
};

exports.delete = (req, res) => {
    Table.remove(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({ message: `Table not found with id ${req.params.id}.` });
            } else {
                res.status(500).send({ message: "Could not delete table with id " + req.params.id });
            }
        } else res.send({ message: `Table was deleted successfully!` });
    });
};

exports.bulkCreate = (req, res) => {
    if (!req.body || !req.body.specs || !req.body.restaurant_id) {
        res.status(400).send({ message: "Specs and restaurant_id are required!" });
        return;
    }

    Table.bulkCreate(req.body.restaurant_id, req.body.specs, (err, data) => {
        if (err)
            res.status(500).send({ message: err.message || "Error bulk creating tables." });
        else res.send(data);
    });
};

exports.findAvailable = (req, res) => {
    const { restaurantId, date, time } = req.query;
    if (!restaurantId || !date || !time) {
        res.status(400).send({ message: "restaurantId, date, and time are required!" });
        return;
    }

    Table.getAvailableForSlot(restaurantId, date, time, (err, data) => {
        if (err)
            res.status(500).send({ message: err.message || "Error retrieving available tables." });
        else res.send(data);
    });
};
