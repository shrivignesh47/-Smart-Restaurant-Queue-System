const sql = require("./db.js");

// Constructor
const Table = function (table) {
    this.restaurant_id = table.restaurant_id;
    this.name = table.name;
    this.capacity = table.capacity;
    this.type = table.type || 'Standard';
    this.status = table.status || 'Available';
    this.features = table.features ? (typeof table.features === 'string' ? table.features : JSON.stringify(table.features)) : '[]';
    this.booked_by = table.booked_by || null;
    this.ticket_id = table.ticket_id || null;
};

Table.create = (newTable, result) => {
    sql.query("INSERT INTO tables SET ?", newTable, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, { id: res.insertId, ...newTable });
    });
};

Table.getAllByRestaurant = (restaurantId, result) => {
    sql.query("SELECT * FROM tables WHERE restaurant_id = ?", [restaurantId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        result(null, res);
    });
};

Table.updateById = (id, table, result) => {
    sql.query(
        "UPDATE tables SET name = ?, capacity = ?, type = ?, status = ?, features = ?, booked_by = ?, ticket_id = ? WHERE id = ?",
        [table.name, table.capacity, table.type, table.status, JSON.stringify(table.features), table.booked_by, table.ticket_id, id],
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

            result(null, { id: id, ...table });
        }
    );
};

Table.updateStatus = (id, data, result) => {
    let query = "UPDATE tables SET status = ?";
    let params = [data.status];

    if (data.status === 'Available') {
        query += ", booked_by = NULL, ticket_id = NULL";
    } else {
        if (data.booked_by !== undefined) {
            query += ", booked_by = ?";
            params.push(data.booked_by);
        }
        if (data.ticket_id !== undefined) {
            query += ", ticket_id = ?";
            params.push(data.ticket_id);
        }
    }

    query += " WHERE id = ?";
    params.push(id);

    sql.query(query, params, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }
        result(null, { id: id, ...data });
    });
};

Table.remove = (id, result) => {
    sql.query("DELETE FROM tables WHERE id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};

Table.bulkCreate = (restaurantId, specs, result) => {
    // We need to fetch existing tables to find the next index for each type
    sql.query("SELECT name, type FROM tables WHERE restaurant_id = ?", [restaurantId], (err, existingTables) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        const getPrefix = (type) => type === 'VIP' ? 'VT-' : 'NT-';

        const getNextIndex = (type) => {
            const prefix = getPrefix(type);
            const relevantTables = existingTables.filter(t => t.name.startsWith(prefix));
            if (relevantTables.length === 0) return 1;

            const indices = relevantTables.map(t => {
                const match = t.name.match(new RegExp(`${prefix.replace('-', '\\-')}(\\d+)`));
                return match ? parseInt(match[1]) : 0;
            });
            return Math.max(...indices) + 1;
        };

        let currentIndices = {
            'VIP': getNextIndex('VIP'),
            'Normal': getNextIndex('Normal')
        };

        let tablesToCreate = [];
        for (const spec of specs) {
            const type = spec.type || 'Normal';
            const prefix = getPrefix(type);

            for (let i = 0; i < spec.count; i++) {
                const name = `${prefix}${currentIndices[type] || getNextIndex(type)}`;
                if (!currentIndices[type]) currentIndices[type] = getNextIndex(type) + 1;
                else currentIndices[type]++;

                tablesToCreate.push([
                    restaurantId,
                    name,
                    spec.capacity,
                    type,
                    'Available',
                    '[]'
                ]);
            }
        }

        if (tablesToCreate.length === 0) {
            result(null, { message: "No tables to create" });
            return;
        }

        sql.query(
            "INSERT INTO tables (restaurant_id, name, capacity, type, status, features) VALUES ?",
            [tablesToCreate],
            (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                    return;
                }
                result(null, { message: `${res.affectedRows} tables created successfully` });
            }
        );
    });
};

Table.getAvailableForSlot = (restaurantId, date, time, result) => {
    // A table is available if it's not present in 'Confirmed' or 'Pending' reservations for that date/time
    const query = `
        SELECT t.* FROM tables t
        WHERE t.restaurant_id = ?
        AND t.id NOT IN (
            SELECT r.table_id FROM reservations r
            WHERE r.restaurant_id = ?
            AND r.reservation_date = ?
            AND r.reservation_time = ?
            AND r.status IN ('Confirmed', 'Pending', 'Seated')
            AND r.table_id IS NOT NULL
        )
    `;
    sql.query(query, [restaurantId, restaurantId, date, time], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        result(null, res);
    });
};

Table.initTable = (result) => {
    const query = `
    CREATE TABLE IF NOT EXISTS tables (
      id INT AUTO_INCREMENT PRIMARY KEY,
      restaurant_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      capacity INT NOT NULL,
      type VARCHAR(50) DEFAULT 'Standard',
      status VARCHAR(50) DEFAULT 'Available',
      features TEXT,
      booked_by VARCHAR(255),
      ticket_id VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_restaurant (restaurant_id)
    ) ENGINE=InnoDB;
  `;
    sql.query(query, (err, res) => {
        if (err) {
            console.log("error creating tables table: ", err);
            if (result) result(err, null);
            return;
        }
        console.log("Tables table created or already exists.");

        // Check if we need to add booked_by and ticket_id columns (migration)
        const columnsToAdd = [
            { name: 'booked_by', type: 'VARCHAR(255)' },
            { name: 'ticket_id', type: 'VARCHAR(50)' }
        ];

        columnsToAdd.forEach(col => {
            sql.query(`ALTER TABLE tables ADD COLUMN ${col.name} ${col.type}`, (alterErr) => {
                if (alterErr && alterErr.code !== 'ER_DUP_FIELDNAME') {
                    console.error(`Error adding ${col.name} to tables:`, alterErr);
                }
            });
        });

        if (result) result(null, res);
    });
};

module.exports = Table;
