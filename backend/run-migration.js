const sql = require('./app/models/db.js');

console.log('Running migration to add scanner_access_key column...');

// Add scanner_access_key column
sql.query(
    `ALTER TABLE restaurants 
   ADD COLUMN scanner_access_key VARCHAR(20) DEFAULT NULL,
   ADD COLUMN scanner_key_updated_at TIMESTAMP NULL`,
    (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ Column already exists!');
            } else {
                console.error('❌ Error:', err.message);
            }
        } else {
            console.log('✅ Migration completed successfully!');
        }
        process.exit(0);
    }
);
