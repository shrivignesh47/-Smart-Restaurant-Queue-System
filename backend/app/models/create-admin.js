require('dotenv').config();
const sql = require("./db.js");
const bcrypt = require('bcryptjs');

// Create default admin user
const createDefaultAdmin = () => {
    console.log("Creating default admin user...\n");

    // Check if admin already exists
    sql.query("SELECT * FROM users WHERE contact_info = 'admin'", (err, res) => {
        if (err) {
            console.error("✗ Error checking for admin:", err.message);
            process.exit(1);
            return;
        }

        if (res.length > 0) {
            console.log("✓ Default admin already exists");
            console.log("\n" + "=".repeat(60));
            console.log("ADMIN CREDENTIALS");
            console.log("=".repeat(60));
            console.log("  Username: admin");
            console.log("  Password: admin");
            console.log("  Login URL: http://localhost:4200/sysqueue/admin");
            console.log("=".repeat(60));
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
            console.log("\n" + "=".repeat(60));
            console.log("ADMIN CREDENTIALS");
            console.log("=".repeat(60));
            console.log("  Username: admin");
            console.log("  Password: admin");
            console.log("  Login URL: http://localhost:4200/sysqueue/admin");
            console.log("=".repeat(60));
            console.log("\n⚠️  IMPORTANT: Change the admin password after first login!");
            console.log("\nYou can now:");
            console.log("  1. Login to admin dashboard");
            console.log("  2. Create restaurants");
            console.log("  3. Create sub-users for restaurants");
            process.exit(0);
        });
    });
};

// Run
createDefaultAdmin();
