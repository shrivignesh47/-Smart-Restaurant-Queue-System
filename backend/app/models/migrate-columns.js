require('dotenv').config();
const sql = require("./db.js");

// Migration to add password and restaurant_id columns
const migrateColumns = () => {
    console.log("Starting column migration...\n");

    // Add both columns in one query
    const alterQuery = `
        ALTER TABLE users
        ADD COLUMN password VARCHAR(255),
        ADD COLUMN restaurant_id INT
    `;

    sql.query(alterQuery, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("✓ Columns already exist");
                process.exit(0);
            } else {
                console.error("✗ Migration failed:", err.message);
                process.exit(1);
            }
        } else {
            console.log("✓ Migration successful!");
            console.log("✓ Added password column");
            console.log("✓ Added restaurant_id column");
            console.log("\nNext step: Run create-admin.js to create default admin user");
            process.exit(0);
        }
    });
};

// Run migration
migrateColumns();
