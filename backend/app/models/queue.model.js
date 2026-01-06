const sql = require("./db.js");

// Constructor
const Queue = function (entry) {
    this.restaurant_id = entry.restaurant_id;
    this.customer_name = entry.customer_name;
    this.party_size = entry.party_size;
    this.contact_info = entry.contact_info;
    this.status = entry.status || 'Waiting';
    this.position = entry.position;
    this.estimated_wait_time = entry.estimated_wait_time;
    this.user_id = entry.user_id || null;
    this.joined_at = new Date();
};

Queue.create = (newEntry, result) => {
    // First, get the current max position for this restaurant
    sql.query(
        "SELECT MAX(position) as maxPos FROM queue WHERE restaurant_id = ? AND status = 'Waiting'",
        [newEntry.restaurant_id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            const nextPosition = (res[0].maxPos || 0) + 1;
            newEntry.position = nextPosition;
            newEntry.estimated_wait_time = nextPosition * 5; // 5 mins per position

            sql.query("INSERT INTO queue SET ?", newEntry, (err, res) => {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                    return;
                }
                result(null, { id: res.insertId, ...newEntry });
            });
        }
    );
};

Queue.getAllByRestaurant = (restaurantId, result) => {
    sql.query(
        "SELECT * FROM queue WHERE restaurant_id = ? AND status NOT IN ('Seated', 'Cancelled') ORDER BY position ASC",
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

Queue.findById = (id, result) => {
    sql.query("SELECT * FROM queue WHERE id = ?", [id], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.length) {
            result(null, res[0]);
        } else {
            result({ kind: "not_found" }, null);
        }
    });
};

Queue.updateStatus = (id, status, tableInfo, result) => {
    // tableInfo can be { tableId, tableName } or null
    let updateQuery = "UPDATE queue SET status = ?";
    let params = [status];

    if (status === 'Seated' && tableInfo && tableInfo.tableId) {
        updateQuery += ", assigned_table_id = ?, assigned_table_name = ?";
        params.push(tableInfo.tableId, tableInfo.tableName || 'Table');
    }

    updateQuery += " WHERE id = ?";
    params.push(id);

    sql.query(updateQuery, params, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        if (status === 'Seated' || status === 'Cancelled') {
            sql.query("SELECT restaurant_id, position FROM queue WHERE id = ?", [id], (subErr, subRes) => {
                if (!subErr && subRes.length > 0) {
                    const { restaurant_id, position } = subRes[0];
                    sql.query(
                        "UPDATE queue SET position = position - 1, estimated_wait_time = (position - 1) * 5 WHERE restaurant_id = ? AND status = 'Waiting' AND position > ?",
                        [restaurant_id, position],
                        (shiftErr, shiftRes) => {
                            if (shiftErr) console.log("error shifting: ", shiftErr);
                        }
                    );
                }
            });
        }

        result(null, {
            id: id,
            status: status,
            assigned_table_id: tableInfo?.tableId || null,
            assigned_table_name: tableInfo?.tableName || null
        });
    });
};

Queue.initTable = (result) => {
    const query = `
    CREATE TABLE IF NOT EXISTS queue (
      id INT AUTO_INCREMENT PRIMARY KEY,
      restaurant_id INT NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      party_size INT NOT NULL,
      contact_info VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Waiting',
      position INT NOT NULL,
      estimated_wait_time INT,
      user_id INT,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_restaurant_status (restaurant_id, status)
    ) ENGINE=InnoDB;
  `;
    sql.query(query, (err, res) => {
        if (err) {
            console.log("error creating queue table: ", err);
            if (result) result(err, null);
            return;
        }
        sql.query("ALTER TABLE queue ADD COLUMN user_id INT", (colErr) => {
            if (colErr && colErr.errno !== 1060 && colErr.code !== 'ER_DUP_FIELDNAME') {
                console.log(`Note: user_id column in queue skipped: ${colErr.message}`);
            }
        });

        sql.query("ALTER TABLE queue ADD COLUMN assigned_table_id INT", (colErr) => {
            if (colErr && colErr.errno !== 1060 && colErr.code !== 'ER_DUP_FIELDNAME') {
                console.log(`Note: assigned_table_id column in queue skipped: ${colErr.message}`);
            }
        });

        sql.query("ALTER TABLE queue ADD COLUMN assigned_table_name VARCHAR(100)", (colErr) => {
            if (colErr && colErr.errno !== 1060 && colErr.code !== 'ER_DUP_FIELDNAME') {
                console.log(`Note: assigned_table_name column in queue skipped: ${colErr.message}`);
            }
        });

        console.log("Queue table created or already exists.");
        if (result) result(null, res);
    });
};

module.exports = Queue;
