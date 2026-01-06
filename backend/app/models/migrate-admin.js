require('dotenv').config();
const sql = require("./db.js");
const bcrypt = require('bcryptjs');

// Migration to add restaurant_id to users table and create default admin
const migrateAdminSystem = () => {
    console.log("Starting admin system migration...\n");

    // Step 1: Add restaurant_id column
    const addRestaurantIdQuery = `
        ALTER TABLE users
        ADD COLUMN restaurant_id INT,
        ADD FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL
    `;

    sql.query(addRestaurantIdQuery, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log("✓ restaurant_id column already exists");
                createDefaultAdmin();
            } else {
                console.error("✗ Error adding restaurant_id:", err.message);
                createDefaultAdmin(); // Try to create admin anyway
            }
        } else {
            console.log("✓ Added restaurant_id column to users table");
            createDefaultAdmin();
        }
    });
};

// Create default admin user
const createDefaultAdmin = () => {
    console.log("\nCreating default admin user...");

    // Check if admin already exists
    sql.query("SELECT * FROM users WHERE contact_info = 'admin' AND role = 'Admin'", (err, res) => {
        if (err) {
            console.error("✗ Error checking for admin:", err.message);
            process.exit(1);
            return;
        }

        if (res.length > 0) {
            console.log("✓ Default admin already exists");
            console.log("\nAdmin Credentials:");
            console.log("  Username: admin");
            console.log("  Password: admin");
            console.log("  Login URL: http://localhost:4200/sysqueue/admin");
            process.exit(0);
            return;
        }

        // Hash the password
        const hashedPassword = bcrypt.hashSync('admin', 10);

        // Create admin user
        const adminUser = {
            name: 'System Administrator',
            role: 'Admin',
            contact_info: 'admin',
            password: hashedPassword,
            email: 'admin@sysqueue.com',
            email_notifications: true,
            sms_notifications: true
        };

        sql.query("INSERT INTO users SET ?", adminUser, (err, result) => {
            if (err) {
                console.error("✗ Error creating admin:", err.message);
                process.exit(1);
                return;
            }

            console.log("✓ Default admin created successfully!");
            console.log("\n" + "=".repeat(50));
            console.log("ADMIN CREDENTIALS");
            console.log("=".repeat(50));
            console.log("  Username: admin");
            console.log("  Password: admin");
            console.log("  Login URL: http://localhost:4200/sysqueue/admin");
            console.log("=".repeat(50));
            console.log("\n⚠️  IMPORTANT: Change the admin password after first login!");
            process.exit(0);
        });
    });
};

// Run migration
migrateAdminSystem();
