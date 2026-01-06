const sql = require("./db.js");

// Restaurant Model
const Restaurant = function (restaurant) {
    this.name = restaurant.name;
    this.slug = restaurant.slug; // URL-friendly name
    this.description = restaurant.description;
    this.address = restaurant.address;
    this.city = restaurant.city;
    this.state = restaurant.state;
    this.pin_code = restaurant.pin_code;
    this.phone = restaurant.phone;
    this.email = restaurant.email;
    this.logo_url = restaurant.logo_url;
    this.cover_image_url = restaurant.cover_image_url;
    this.cuisine_type = restaurant.cuisine_type;
    this.opening_time = restaurant.opening_time;
    this.closing_time = restaurant.closing_time;
    this.status = restaurant.status || 'active'; // active, inactive, suspended
    this.created_by = restaurant.created_by; // admin user ID

    // Website Configuration Fields
    this.theme_color = restaurant.theme_color || '#ff5630';
    this.tagline = restaurant.tagline;
    this.gallery_images = restaurant.gallery_images; // Should be JSON string or will be converted by controller
    this.menu_images = restaurant.menu_images; // Should be JSON string
    this.is_paid_reservation = restaurant.is_paid_reservation || 0;
    this.reservation_fee = restaurant.reservation_fee || 0;
};

// Initialize restaurants table
Restaurant.initTable = (result) => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS restaurants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      pin_code VARCHAR(10),
      phone VARCHAR(20),
      email VARCHAR(255),
      logo_url TEXT,
      cover_image_url TEXT,
      cuisine_type VARCHAR(255),
      opening_time TIME,
      closing_time TIME,
      status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
      created_by INT,
      theme_color VARCHAR(7) DEFAULT '#ff5630',
      tagline TEXT,
      gallery_images JSON,
      menu_images JSON,
      accept_queue TINYINT(1) DEFAULT 1,
      accept_reservations TINYINT(1) DEFAULT 1,
      is_paid_reservation TINYINT(1) DEFAULT 0,
      reservation_fee DECIMAL(10, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_slug (slug),
      INDEX idx_status (status)
    ) ENGINE=InnoDB;
  `;

    sql.query(createTableQuery, (err, res) => {
        if (err) {
            console.log("error creating restaurants table: ", err);
            if (result) result(err, null);
            return;
        }

        // After table creation, ensure new columns exist for older databases
        const configColumns = [
            { name: "theme_color", def: "VARCHAR(7) DEFAULT '#ff5630'" },
            { name: "tagline", def: "TEXT" },
            { name: "gallery_images", def: "JSON" },
            { name: "menu_images", def: "JSON" },
            { name: "accept_queue", def: "TINYINT(1) DEFAULT 1" },
            { name: "accept_reservations", def: "TINYINT(1) DEFAULT 1" },
            { name: "is_paid_reservation", def: "TINYINT(1) DEFAULT 0" },
            { name: "reservation_fee", def: "DECIMAL(10, 2) DEFAULT 0" }
        ];

        let completed = 0;
        configColumns.forEach(col => {
            sql.query(`ALTER TABLE restaurants ADD COLUMN ${col.name} ${col.def}`, (colErr) => {
                if (colErr) {
                    // 1060 is "Duplicate column name", which means it's already there - we can ignore this.
                    if (colErr.errno !== 1060 && colErr.code !== 'ER_DUP_FIELDNAME') {
                        console.log(`Note: Column ${col.name} addition skipped: ${colErr.message}`);
                    }
                } else {
                    console.log(`Added missing column: ${col.name}`);
                }

                completed++;
                if (completed === configColumns.length) {
                    console.log("Restaurants table schema initialized successfully.");
                    if (result) result(null, res);
                }
            });
        });
    });
};

// Create restaurant
Restaurant.create = (newRestaurant, result) => {
    sql.query("INSERT INTO restaurants SET ?", newRestaurant, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        console.log("created restaurant: ", { id: res.insertId, ...newRestaurant });
        result(null, { id: res.insertId, ...newRestaurant });
    });
};

// Get all restaurants
Restaurant.getAll = (filters, result) => {
    let query = "SELECT * FROM restaurants";
    const conditions = [];
    const values = [];

    if (filters) {
        if (filters.status) {
            conditions.push("status = ?");
            values.push(filters.status);
        }
        if (filters.city) {
            conditions.push("city = ?");
            values.push(filters.city);
        }
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC";

    sql.query(query, values, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

// Find by ID
Restaurant.findById = (id, result) => {
    sql.query("SELECT * FROM restaurants WHERE id = ?", [id], (err, res) => {
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

// Find by slug
Restaurant.findBySlug = (slug, result) => {
    sql.query("SELECT * FROM restaurants WHERE slug = ?", [slug], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.length) {
            const restaurant = res[0];
            // Security: Mask the scanner access key for public view
            // We return a flag indicating if it exists, but not the key itself
            if (restaurant.scanner_access_key) {
                restaurant.has_scanner_key = true;
                delete restaurant.scanner_access_key;
            } else {
                restaurant.has_scanner_key = false;
            }

            result(null, restaurant);
            return;
        }
        result({ kind: "not_found" }, null);
    });
};

// Update restaurant
Restaurant.updateById = (id, restaurant, result) => {
    sql.query(
        `UPDATE restaurants SET 
            name = ?, 
            slug = ?,
            description = ?,
            address = ?,
            city = ?,
            state = ?,
            pin_code = ?,
            phone = ?,
            email = ?,
            logo_url = ?,
            cover_image_url = ?,
            cuisine_type = ?, 
            opening_time = ?, 
            closing_time = ?, 
            status = ?,
            theme_color = ?,
            tagline = ?,
            gallery_images = ?,
            menu_images = ?,
            accept_queue = ?,
            accept_reservations = ?,
            is_paid_reservation = ?,
            reservation_fee = ?
        WHERE id = ?`,
        [
            restaurant.name,
            restaurant.slug,
            restaurant.description,
            restaurant.address,
            restaurant.city,
            restaurant.state,
            restaurant.pin_code,
            restaurant.phone,
            restaurant.email,
            restaurant.logo_url,
            restaurant.cover_image_url,
            restaurant.cuisine_type,
            restaurant.opening_time,
            restaurant.closing_time,
            restaurant.status,
            restaurant.theme_color,
            restaurant.tagline,
            restaurant.gallery_images,
            restaurant.menu_images,
            restaurant.accept_queue,
            restaurant.accept_reservations,
            restaurant.is_paid_reservation,
            restaurant.reservation_fee,
            id
        ],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }
            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }
            result(null, { id: id, ...restaurant });
        }
    );
};

// Delete restaurant
Restaurant.remove = (id, result) => {
    sql.query("DELETE FROM restaurants WHERE id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }
        result(null, res);
    });
};

// Get restaurant statistics
Restaurant.getStats = (restaurantId, result) => {
    const query = `
        SELECT
            (SELECT COUNT(*) FROM users WHERE role = 'RestaurantAdmin' AND restaurant_id = ?) as admin_count,
        (SELECT COUNT(*) FROM users WHERE role = 'RestaurantStaff' AND restaurant_id = ?) as staff_count
    `;

    sql.query(query, [restaurantId, restaurantId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res[0]);
    });
};

// Find restaurant by scanner access key
Restaurant.findByAccessKey = (accessKey, result) => {
    sql.query(
        "SELECT * FROM restaurants WHERE scanner_access_key = ? AND status = 'active'",
        [accessKey],
        (err, res) => {
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
        }
    );
};

module.exports = Restaurant;
