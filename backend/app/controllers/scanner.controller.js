const Restaurant = require('../models/restaurant.model.js');
const Reservation = require('../models/reservation.model.js');

// Validate static access key (public endpoint)
exports.validateKey = (req, res) => {
    const { accessKey } = req.body;

    if (!accessKey) {
        return res.status(400).send({ message: 'Access key is required' });
    }

    // Find restaurant by scanner access key
    Restaurant.findByAccessKey(accessKey, (err, restaurant) => {
        if (err) {
            if (err.kind === 'not_found') {
                return res.status(401).send({
                    message: 'Invalid access key',
                    valid: false
                });
            }
            return res.status(500).send({
                message: 'Error validating access key'
            });
        }

        res.send({
            valid: true,
            restaurant: {
                id: restaurant.id,
                name: restaurant.name,
                slug: restaurant.slug
            }
        });
    });
};

// Check-in reservation via QR code
exports.checkIn = (req, res) => {
    const { accessKey, reservationId } = req.body;

    if (!accessKey || !reservationId) {
        return res.status(400).send({
            message: 'Access key and reservation ID are required'
        });
    }

    // First validate the access key
    Restaurant.findByAccessKey(accessKey, (err, restaurant) => {
        if (err) {
            return res.status(401).send({
                message: 'Invalid access key'
            });
        }

        // Get reservation details
        Reservation.findById(reservationId, (err, reservation) => {
            if (err) {
                if (err.kind === 'not_found') {
                    return res.status(404).send({
                        message: 'Reservation not found'
                    });
                }
                return res.status(500).send({
                    message: 'Error retrieving reservation'
                });
            }

            // Verify reservation belongs to this restaurant
            if (reservation.restaurant_id !== restaurant.id) {
                return res.status(403).send({
                    message: 'This reservation does not belong to your restaurant'
                });
            }

            // Check if already seated or cancelled
            if (reservation.status === 'Seated') {
                return res.status(400).send({
                    message: 'This reservation is already checked in',
                    reservation
                });
            }

            if (reservation.status === 'Cancelled') {
                return res.status(400).send({
                    message: 'This reservation has been cancelled'
                });
            }

            // Update reservation status to Seated
            Reservation.updateStatus(
                reservationId,
                'Seated',
                (err, data) => {
                    if (err) {
                        return res.status(500).send({
                            message: 'Error updating reservation status'
                        });
                    }

                    res.send({
                        message: 'Customer checked in successfully',
                        reservation: {
                            ...data,
                            status: 'Seated',
                            customer_name: reservation.customer_name,
                            party_size: reservation.party_size,
                            reservation_time: reservation.reservation_time,
                            // Ensure other fields are preserved in response if needed
                            table_no: reservation.table_no // If available in fetch, though findById might not join tables. 
                            // Actually strictly relying on what we have is safer.
                        }
                    });
                }
            );
        });
    });
};

// Get reservation details (for preview before check-in)
exports.getReservation = (req, res) => {
    const { accessKey } = req.query;
    const reservationId = req.params.id;

    if (!accessKey) {
        return res.status(400).send({ message: 'Access key is required' });
    }

    // Validate access key
    Restaurant.findByAccessKey(accessKey, (err, restaurant) => {
        if (err) {
            return res.status(401).send({ message: 'Invalid access key' });
        }

        // Get reservation
        Reservation.findById(reservationId, (err, data) => {
            if (err) {
                if (err.kind === 'not_found') {
                    return res.status(404).send({ message: 'Reservation not found' });
                }
                return res.status(500).send({ message: 'Error retrieving reservation' });
            }

            // Verify restaurant match
            if (data.restaurant_id !== restaurant.id) {
                return res.status(403).send({
                    message: 'This reservation does not belong to your restaurant'
                });
            }

            res.send(data);
        });
    });
};

// Get today's reservations and seated guests using access key
exports.getDailyStats = (req, res) => {
    const { accessKey } = req.query;

    if (!accessKey) {
        return res.status(400).send({ message: 'Access key is required' });
    }

    // Validate access key
    Restaurant.findByAccessKey(accessKey, (err, restaurant) => {
        if (err) {
            return res.status(401).send({ message: 'Invalid access key' });
        }

        // We need custom queries here to get formatted data for the staff view
        const sql = require("../models/db.js");
        const today = new Date().toISOString().slice(0, 10);

        // Query 1: Get Confirmed Reservations for Today
        const confirmedQuery = `
            SELECT r.id, r.customer_name, r.customer_email, r.customer_phone, r.party_size, r.reservation_date, r.reservation_time, r.special_requests, r.status, t.name as table_no
            FROM reservations r
            LEFT JOIN tables t ON r.table_id = t.id
            WHERE r.restaurant_id = ? 
            AND r.status = 'Confirmed' 
            AND (
                r.reservation_date > CURDATE() 
                OR (r.reservation_date = CURDATE() AND r.reservation_time >= CURTIME())
            )
            ORDER BY r.reservation_date ASC, r.reservation_time ASC`;

        // Query 2: Get Currently Seated Guests
        const seatedQuery = `
            SELECT r.id, r.customer_name, r.customer_phone, r.party_size, r.reservation_date, r.reservation_time, r.special_requests, t.name as table_no 
            FROM reservations r
            LEFT JOIN tables t ON r.table_id = t.id
            WHERE r.restaurant_id = ? 
            AND r.status = 'Seated' 
            ORDER BY r.updated_at DESC`;

        Promise.all([
            new Promise((resolve, reject) => {
                sql.query(confirmedQuery, [restaurant.id], (err, res) => err ? reject(err) : resolve(res));
            }),
            new Promise((resolve, reject) => {
                sql.query(seatedQuery, [restaurant.id], (err, res) => err ? reject(err) : resolve(res));
            })
        ]).then(([confirmed, seated]) => {
            res.send({
                confirmed,
                seated
            });
        }).catch(err => {
            console.error(err);
            res.status(500).send({ message: "Error fetching daily stats" });
        });
    });
};

module.exports = exports;
