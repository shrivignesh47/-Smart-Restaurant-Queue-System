require('dotenv').config();
const sql = require("./db.js");

// Migration to add new columns to users table
const migrateUsersTable = () => {
    console.log("Starting users table migration...");
    console.log("Adding new columns to users table...\n");

    // Single ALTER TABLE statement with all new columns
    const alterQuery = `
        ALTER TABLE users
        ADD COLUMN email VARCHAR(255),
        ADD COLUMN date_of_birth DATE,
        ADD COLUMN gender VARCHAR(20),
        ADD COLUMN street_address TEXT,
        ADD COLUMN city VARCHAR(100),
        ADD COLUMN state VARCHAR(100),
        ADD COLUMN pin_code VARCHAR(10),
        ADD COLUMN country VARCHAR(100) DEFAULT 'India',
        ADD COLUMN dietary_preferences TEXT,
        ADD COLUMN food_allergies TEXT,
        ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE,
        ADD COLUMN sms_notifications BOOLEAN DEFAULT TRUE,
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `;

    sql.query(alterQuery, (err, result) => {
        if (err) {
            // Check if error is because columns already exist
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("✓ Columns already exist. No migration needed.");
                process.exit(0);
            } else {
                console.error("✗ Migration failed:", err.message);
                console.error("\nIf columns already exist, this is normal.");
                console.error("You can verify by running: DESCRIBE users;\n");
                process.exit(1);
            }
        } else {
            console.log("✓ Migration successful!");
            console.log("✓ All new columns added to users table");
            console.log("\nNew columns added:");
            console.log("  - email");
            console.log("  - date_of_birth");
            console.log("  - gender");
            console.log("  - street_address");
            console.log("  - city");
            console.log("  - state");
            console.log("  - pin_code");
            console.log("  - country");
            console.log("  - dietary_preferences");
            console.log("  - food_allergies");
            console.log("  - email_notifications");
            console.log("  - sms_notifications");
            console.log("  - updated_at");
            process.exit(0);
        }
    });
};

// Run migration
migrateUsersTable();
