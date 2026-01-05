const sql = require("./db.js");

// Constructor
const User = function (user) {
    this.name = user.name;
    this.role = user.role;
    this.contact_info = user.contact_info;
    this.created_at = new Date();
};

User.create = (newUser, result) => {
    sql.query("INSERT INTO users SET ?", newUser, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("created user: ", { id: res.insertId, ...newUser });
        result(null, { id: res.insertId, ...newUser });
    });
};

User.findByContactInfo = (contact_info, result) => {
    sql.query("SELECT * FROM users WHERE contact_info = ?", [contact_info], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            console.log("found user: ", res[0]);
            result(null, res[0]);
            return;
        }

        // not found User with the contact_info
        result({ kind: "not_found" }, null);
    });
};

User.getAll = (role, result) => {
    let query = "SELECT * FROM users";
    if (role) {
        query += " WHERE role = ?";
    }

    sql.query(query, role ? [role] : [], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        console.log("users: ", res);
        result(null, res);
    });
};

User.findById = (id, result) => {
    sql.query(`SELECT * FROM users WHERE id = ${id}`, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            const user = res[0];

            // Parse dietary_preferences from JSON string to array
            if (user.dietary_preferences) {
                try {
                    user.dietary_preferences = JSON.parse(user.dietary_preferences);
                } catch (e) {
                    // If it's not valid JSON, leave it as is
                    console.log("dietary_preferences is not JSON, keeping as string");
                }
            }

            console.log("found user: ", user);
            result(null, user);
            return;
        }

        // not found User with the id
        result({ kind: "not_found" }, null);
    });
};

User.updateById = (id, user, result) => {
    // Convert arrays to JSON strings for storage
    const dietary_preferences = Array.isArray(user.dietary_preferences)
        ? JSON.stringify(user.dietary_preferences)
        : user.dietary_preferences;

    // Convert date to MySQL DATE format (YYYY-MM-DD)
    let date_of_birth = user.date_of_birth;
    if (date_of_birth) {
        const date = new Date(date_of_birth);
        if (!isNaN(date.getTime())) {
            // Format as YYYY-MM-DD
            date_of_birth = date.toISOString().split('T')[0];
        }
    }

    sql.query(
        `UPDATE users SET
            name = ?,
            email = ?,
            date_of_birth = ?,
            gender = ?,
            street_address = ?,
            city = ?,
            state = ?,
            pin_code = ?,
            country = ?,
            dietary_preferences = ?,
            food_allergies = ?,
            email_notifications = ?,
            sms_notifications = ?
        WHERE id = ?`,
        [
            user.name,
            user.email,
            date_of_birth,  // Use the formatted date
            user.gender,
            user.street_address,
            user.city,
            user.state,
            user.pin_code,
            user.country,
            dietary_preferences,  // Use the converted value
            user.food_allergies,
            user.email_notifications,
            user.sms_notifications,
            id
        ],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }

            if (res.affectedRows == 0) {
                // not found User with the id
                result({ kind: "not_found" }, null);
                return;
            }

            console.log("updated user: ", { id: id, ...user });
            result(null, { id: id, ...user });
        }
    );
};

// Update Admin Profile (username, name, password)
User.updateAdminProfile = (id, updates, result) => {
    const bcrypt = require('bcryptjs');

    // Build dynamic query based on what's being updated
    const fields = [];
    const values = [];

    if (updates.name) {
        fields.push('name = ?');
        values.push(updates.name);
    }

    if (updates.contact_info) {
        fields.push('contact_info = ?');
        values.push(updates.contact_info);
    }

    if (updates.password) {
        // Hash the new password
        const hashedPassword = bcrypt.hashSync(updates.password, 10);
        fields.push('password = ?');
        values.push(hashedPassword);
    }

    if (fields.length === 0) {
        result({ kind: "no_updates" }, null);
        return;
    }

    values.push(id); // Add ID for WHERE clause

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    sql.query(query, values, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }

        console.log("updated admin profile for user: ", id);
        result(null, { id: id, ...updates });
    });
};

User.remove = (id, result) => {
    sql.query("DELETE FROM users WHERE id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        if (res.affectedRows == 0) {
            // not found User with the id
            result({ kind: "not_found" }, null);
            return;
        }

        console.log("deleted user with id: ", id);
        result(null, res);
    });
};

// SQL to create table if it doesn't exist (Helper for initialization)
User.initTable = (result) => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      role VARCHAR(50) DEFAULT 'Customer',
      contact_info VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255),
      restaurant_id INT,
      
      -- Personal Information
      email VARCHAR(255),
      date_of_birth DATE,
      gender VARCHAR(20),
      
      -- Address Information
      street_address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      pin_code VARCHAR(10),
      country VARCHAR(100) DEFAULT 'India',
      
      -- Preferences
      dietary_preferences TEXT,
      food_allergies TEXT,
      email_notifications BOOLEAN DEFAULT TRUE,
      sms_notifications BOOLEAN DEFAULT TRUE,
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      INDEX idx_role (role),
      INDEX idx_restaurant (restaurant_id)
    ) ENGINE=InnoDB;
  `;
    sql.query(query, (err, res) => {
        if (err) {
            console.log("error creating table: ", err);
            if (result) result(err, null);
            return;
        }
        console.log("Users table created or already exists.");
        if (result) result(null, res);
    });
};

module.exports = User;
