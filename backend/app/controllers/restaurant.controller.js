const Restaurant = require("../models/restaurant.model.js");
const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");

exports.create = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    const slug = req.body.slug || req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const restaurant = new Restaurant({
        name: req.body.name,
        slug: slug,
        description: req.body.description,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pin_code: req.body.pin_code,
        phone: req.body.phone,
        email: req.body.email,
        logo_url: req.body.logo_url,
        cover_image_url: req.body.cover_image_url,
        cuisine_type: req.body.cuisine_type,
        opening_time: req.body.opening_time,
        closing_time: req.body.closing_time,
        status: req.body.status || 'active',
        created_by: req.userId // From JWT middleware
    });

    Restaurant.create(restaurant, (err, restaurantData) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Restaurant."
            });
            return;
        }

        if (req.body.managerUsername && req.body.managerPassword) {
            const hashedPassword = bcrypt.hashSync(req.body.managerPassword, 10);

            const managerUser = {
                name: req.body.name + " Manager",
                role: 'RestaurantAdmin',
                contact_info: req.body.managerUsername,
                password: hashedPassword,
                restaurant_id: restaurantData.id,
                created_at: new Date()
            };

            const sql = require("../models/db.js");
            sql.query("INSERT INTO users SET ?", managerUser, (userErr, userRes) => {
                if (userErr) {
                    console.error("Error creating manager user:", userErr);
                    // We still return the restaurant data but maybe with an info message
                    res.send({
                        ...restaurantData,
                        managerCreated: false,
                        managerError: "Failed to create manager user. It might already exist."
                    });
                } else {
                    res.send({
                        ...restaurantData,
                        managerCreated: true,
                        managerUsername: req.body.managerUsername
                    });
                }
            });
        } else {
            res.send(restaurantData);
        }
    });
};

exports.findAll = (req, res) => {
    const filters = {
        status: req.query.status,
        city: req.query.city
    };

    Restaurant.getAll(filters, (err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving restaurants."
            });
        } else {
            res.send(data);
        }
    });
};

exports.findOne = (req, res) => {
    Restaurant.findById(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Restaurant with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Restaurant with id " + req.params.id
                });
            }
        } else {
            res.send(data);
        }
    });
};

exports.findBySlug = (req, res) => {
    Restaurant.findBySlug(req.params.slug, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Restaurant with slug ${req.params.slug}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Restaurant with slug " + req.params.slug
                });
            }
        } else {
            res.send(data);
        }
    });
};

exports.update = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    if (req.userRole === "RestaurantAdmin" && req.params.id != req.restaurantId) {
        return res.status(403).send({
            message: "Unauthorized! You can only update your own restaurant."
        });
    }

    Restaurant.findById(req.params.id, (err, existingData) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Restaurant with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Restaurant with id " + req.params.id
                });
            }
            return;
        }

        let slug = existingData.slug;
        if (req.body.name && req.body.name !== existingData.name) {
            slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        }
        if (req.body.slug) {
            slug = req.body.slug;
        }

        let galleryImages = req.body.gallery_images !== undefined ? req.body.gallery_images : existingData.gallery_images;
        if (Array.isArray(galleryImages)) {
            galleryImages = JSON.stringify(galleryImages);
        }

        let menuImages = req.body.menu_images !== undefined ? req.body.menu_images : existingData.menu_images;
        if (Array.isArray(menuImages)) {
            menuImages = JSON.stringify(menuImages);
        }

        const restaurant = {
            name: req.body.name || existingData.name,
            slug: slug,
            description: req.body.description !== undefined ? req.body.description : existingData.description,
            address: req.body.address !== undefined ? req.body.address : existingData.address,
            city: req.body.city !== undefined ? req.body.city : existingData.city,
            state: req.body.state !== undefined ? req.body.state : existingData.state,
            pin_code: req.body.pin_code !== undefined ? req.body.pin_code : existingData.pin_code,
            phone: req.body.phone !== undefined ? req.body.phone : existingData.phone,
            email: req.body.email !== undefined ? req.body.email : existingData.email,
            logo_url: req.body.logo_url !== undefined ? req.body.logo_url : existingData.logo_url,
            cover_image_url: req.body.cover_image_url !== undefined ? req.body.cover_image_url : existingData.cover_image_url,
            cuisine_type: req.body.cuisine_type !== undefined ? req.body.cuisine_type : existingData.cuisine_type,
            opening_time: req.body.opening_time !== undefined ? req.body.opening_time : existingData.opening_time,
            closing_time: req.body.closing_time !== undefined ? req.body.closing_time : existingData.closing_time,
            status: req.body.status !== undefined ? req.body.status : existingData.status,
            theme_color: req.body.theme_color !== undefined ? req.body.theme_color : existingData.theme_color,
            tagline: req.body.tagline !== undefined ? req.body.tagline : existingData.tagline,
            gallery_images: galleryImages,
            menu_images: menuImages,
            accept_queue: req.body.accept_queue !== undefined ? req.body.accept_queue : existingData.accept_queue,
            accept_reservations: req.body.accept_reservations !== undefined ? req.body.accept_reservations : existingData.accept_reservations,
            is_paid_reservation: req.body.is_paid_reservation !== undefined ? req.body.is_paid_reservation : existingData.is_paid_reservation,
            reservation_fee: req.body.reservation_fee !== undefined ? req.body.reservation_fee : existingData.reservation_fee
        };

        Restaurant.updateById(req.params.id, restaurant, (updateErr, data) => {
            if (updateErr) {
                console.error("[Restaurant Controller] Update Error:", updateErr);
                res.status(500).send({
                    message: "Error updating Restaurant with id " + req.params.id,
                    error: updateErr.message
                });
            } else {
                res.send(data);
            }
        });
    });
};

exports.delete = (req, res) => {
    Restaurant.remove(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Restaurant with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Could not delete Restaurant with id " + req.params.id
                });
            }
        } else {
            res.send({ message: `Restaurant was deleted successfully!` });
        }
    });
};

exports.getStats = (req, res) => {
    if (req.userRole === "RestaurantAdmin" && req.params.id != req.restaurantId) {
        return res.status(403).send({
            message: "Unauthorized! You can only view statistics for your own restaurant."
        });
    }

    Restaurant.getStats(req.params.id, (err, data) => {
        if (err) {
            res.status(500).send({
                message: "Error retrieving statistics for Restaurant with id " + req.params.id
            });
        } else {
            res.send(data);
        }
    });
};

exports.updateScannerKey = (req, res) => {
    const restaurantId = req.params.id;
    const { scannerKey } = req.body;

    if (!scannerKey || scannerKey.length < 6) {
        return res.status(400).send({
            message: "Scanner key must be at least 6 characters long"
        });
    }

    const sql = require("../models/db.js");
    sql.query(
        "UPDATE restaurants SET scanner_access_key = ?, scanner_key_updated_at = NOW() WHERE id = ?",
        [scannerKey, restaurantId],
        (err, result) => {
            if (err) {
                res.status(500).send({
                    message: "Error updating scanner access key"
                });
                return;
            }
            if (result.affectedRows == 0) {
                res.status(404).send({
                    message: "Restaurant not found"
                });
                return;
            }
            res.send({
                message: "Scanner access key updated successfully",
                scanner_access_key: scannerKey
            });
        }
    );
};
exports.getScannerKey = (req, res) => {
    if (req.userRole === "RestaurantAdmin" && req.params.id != req.restaurantId) {
        return res.status(403).send({
            message: "Unauthorized! You can only access your own restaurant's key."
        });
    }

    const query = "SELECT scanner_access_key FROM restaurants WHERE id = ?";
    const sql = require("../models/db.js");

    sql.query(query, [req.params.id], (err, result) => {
        if (err) {
            res.status(500).send({
                message: "Error retrieving scanner key"
            });
            return;
        }
        if (result.length) {
            res.send({ scanner_access_key: result[0].scanner_access_key });
        } else {
            res.status(404).send({
                message: "Restaurant not found"
            });
        }
    });
};
