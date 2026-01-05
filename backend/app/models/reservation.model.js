const sql = require("./db.js");

// Constructor
const Reservation = function (reservation) {
    this.restaurant_id = reservation.restaurant_id;
    this.customer_name = reservation.customer_name;
    this.customer_email = reservation.customer_email;
    this.customer_phone = reservation.customer_phone;
    this.party_size = reservation.party_size;
    this.reservation_date = reservation.reservation_date;
    this.reservation_time = reservation.reservation_time;
    this.table_id = reservation.table_id || null;
    this.status = reservation.status || 'Pending';
    this.special_requests = reservation.special_requests;
    this.payment_status = reservation.payment_status || 'Unpaid';
    this.payment_amount = reservation.payment_amount || 0;
    this.user_id = reservation.user_id || null;
    this.cancelled_by = reservation.cancelled_by || null;
    this.cancellation_reason = reservation.cancellation_reason || null;
    this.created_at = new Date();
};

Reservation.create = (newReservation, result) => {
    sql.query("INSERT INTO reservations SET ?", newReservation, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, { id: res.insertId, ...newReservation });
    });
};

Reservation.findById = (id, result) => {
    sql.query(`SELECT * FROM reservations WHERE id = ${id}`, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.length) {
            result(null, res[0]);
            return;
        }
        result({ kind: "not_found" }, null);
    });
};

Reservation.getAllByRestaurant = (restaurantId, result) => {
    sql.query(
        "SELECT * FROM reservations WHERE restaurant_id = ? ORDER BY reservation_date ASC, reservation_time ASC",
        [restaurantId],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }
            result(null, res);
        }
    );
};

Reservation.getAllByUser = (userId, phone, result) => {
    sql.query(
        "SELECT r.*, res.name as restaurant_name FROM reservations r LEFT JOIN restaurants res ON r.restaurant_id = res.id WHERE r.user_id = ? OR (r.customer_phone = ? AND r.customer_phone IS NOT NULL AND r.customer_phone != '') ORDER BY r.reservation_date DESC, r.reservation_time DESC",
        [userId, phone],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }
            result(null, res);
        }
    );
};

Reservation.updateStatus = (id, status, result) => {
    sql.query(
        "UPDATE reservations SET status = ? WHERE id = ?",
        [status, id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }
            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }
            result(null, { id: id, status: status });
        }
    );
};

Reservation.cancel = (id, cancelledBy, reason, result) => {
    sql.query(
        "UPDATE reservations SET status = 'Cancelled', cancelled_by = ?, cancellation_reason = ? WHERE id = ?",
        [cancelledBy, reason, id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }
            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }
            result(null, { id: id, status: 'Cancelled', cancelled_by: cancelledBy, cancellation_reason: reason });
        }
    );
};

Reservation.updateById = (id, reservation, result) => {
    sql.query(
        "UPDATE reservations SET customer_name = ?, customer_email = ?, customer_phone = ?, party_size = ?, reservation_date = ?, reservation_time = ?, table_id = ?, status = ?, special_requests = ?, payment_status = ?, payment_amount = ?, user_id = ?, cancelled_by = ?, cancellation_reason = ? WHERE id = ?",
        [
            reservation.customer_name,
            reservation.customer_email,
            reservation.customer_phone,
            reservation.party_size,
            reservation.reservation_date,
            reservation.reservation_time,
            reservation.table_id,
            reservation.status,
            reservation.special_requests,
            reservation.payment_status,
            reservation.payment_amount,
            reservation.user_id,
            reservation.cancelled_by,
            reservation.cancellation_reason,
            id
        ],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }
            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }
            result(null, { id: id, ...reservation });
        }
    );
};

Reservation.remove = (id, result) => {
    sql.query("DELETE FROM reservations WHERE id = ?", [id], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        if (res.affectedRows == 0) {
            // not found Reservation with the id
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};

Reservation.initTable = (result) => {
    const query = `
    CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      restaurant_id INT NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255),
      customer_phone VARCHAR(50),
      party_size INT NOT NULL,
      reservation_date DATE NOT NULL,
      reservation_time TIME NOT NULL,
      table_id INT,
      status VARCHAR(50) DEFAULT 'Pending',
      special_requests TEXT,
      payment_status VARCHAR(50) DEFAULT 'Unpaid',
      payment_amount DECIMAL(10, 2) DEFAULT 0,
      user_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_restaurant (restaurant_id),
      INDEX idx_date (reservation_date)
    ) ENGINE=InnoDB;
  `;
    sql.query(query, (err, res) => {
        if (err) {
            console.log("error creating reservations table: ", err);
            if (result) result(err, null);
            return;
        }

        // Add missing columns if they don't exist
        const columns = [
            { name: "payment_status", def: "VARCHAR(50) DEFAULT 'Unpaid'" },
            { name: "payment_amount", def: "DECIMAL(10, 2) DEFAULT 0" },
            { name: "user_id", def: "INT" },
            { name: "cancelled_by", def: "VARCHAR(50)" },
            { name: "cancellation_reason", def: "TEXT" }
        ];

        columns.forEach(col => {
            sql.query(`ALTER TABLE reservations ADD COLUMN ${col.name} ${col.def}`, (colErr) => {
                if (colErr && colErr.errno !== 1060 && colErr.code !== 'ER_DUP_FIELDNAME') {
                    console.log(`Note: Column ${col.name} addition skipped: ${colErr.message}`);
                }
            });
        });

        console.log("Reservations table created or already exists.");
        if (result) result(null, res);
    });
};

module.exports = Reservation;
