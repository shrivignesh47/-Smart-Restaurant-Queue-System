const User = require("../models/user.model.js");

exports.create = (req, res) => {
    const bcrypt = require("bcryptjs");

    if (!req.body || !req.body.contact_info) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    let hashedPassword = null;
    if (req.body.password) {
        hashedPassword = bcrypt.hashSync(req.body.password, 10);
    }

    const user = {
        name: req.body.name,
        role: req.body.role || "Customer",
        contact_info: req.body.contact_info,
        password: hashedPassword,
        restaurant_id: req.body.restaurant_id || null,
        created_at: new Date()
    };

    User.create(user, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the User."
            });
        else {
            const { password, ...userWithoutPassword } = data;
            res.send(userWithoutPassword);
        }
    });
};

exports.findAll = (req, res) => {
    const role = req.query.role;
    User.getAll(role, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving users."
            });
        else res.send(data);
    });
};

exports.findOne = (req, res) => {
    User.findById(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found User with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving User with id " + req.params.id
                });
            }
        } else res.send(data);
    });
};

exports.update = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    User.updateById(
        req.params.id,
        req.body,  // Pass the entire body instead of creating a new User object
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found User with id ${req.params.id}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating User with id " + req.params.id
                    });
                }
            } else res.send(data);
        }
    );
};

exports.delete = (req, res) => {
    User.remove(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found User with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Could not delete User with id " + req.params.id
                });
            }
        } else res.send({ message: `User was deleted successfully!` });
    });
};

exports.updateAdminProfile = (req, res) => {
    console.log('[AdminProfile] Update request received');
    console.log('[AdminProfile] User ID from params:', req.params.id);
    console.log('[AdminProfile] User ID from token:', req.userId);
    console.log('[AdminProfile] User role:', req.userRole);
    console.log('[AdminProfile] Request body:', req.body);

    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    const userId = req.params.id;
    if (req.userId != userId && req.userRole !== 'Admin') {
        console.log('[AdminProfile] Access denied - user can only update own profile');
        res.status(403).send({
            message: "You can only update your own profile!"
        });
        return;
    }

    const updates = {
        name: req.body.name,
        contact_info: req.body.contact_info,
        password: req.body.password
    };

    console.log('[AdminProfile] Updates to apply:', updates);

    User.updateAdminProfile(userId, updates, (err, data) => {
        if (err) {
            console.log('[AdminProfile] Error:', err);
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found User with id ${userId}.`
                });
            } else if (err.kind === "no_updates") {
                res.status(400).send({
                    message: "No fields to update!"
                });
            } else {
                res.status(500).send({
                    message: "Error updating profile with id " + userId
                });
            }
        } else {
            console.log('[AdminProfile] Update successful:', data);
            res.send({
                message: "Profile updated successfully!",
                data: data
            });
        }
    });
};
