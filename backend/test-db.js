// Test database connection and add column
const sql = require('./app/models/db.js');

console.log('Testing database connection...');

// First, test if we can query
sql.query('SHOW TABLES', (err, tables) => {
    if (err) {
        console.error('❌ Cannot connect to database:', err.message);
        process.exit(1);
    }

    console.log('✓ Connected to database');
    console.log('Tables:', tables.map(t => Object.values(t)[0]).join(', '));

    // Check if column exists
    sql.query('DESCRIBE restaurants', (err, columns) => {
        if (err) {
            console.error('❌ Error describing table:', err.message);
            process.exit(1);
        }

        const hasColumn = columns.some(col => col.Field === 'scanner_access_key');

        if (hasColumn) {
            console.log('✓ Column scanner_access_key already exists!');
            process.exit(0);
        } else {
            console.log('Adding scanner_access_key column...');

            // Add the column
            sql.query(
                'ALTER TABLE restaurants ADD COLUMN scanner_access_key VARCHAR(20) DEFAULT NULL, ADD COLUMN scanner_key_updated_at TIMESTAMP NULL',
                (err) => {
                    if (err) {
                        console.error('❌ Error adding column:', err.message);
                        process.exit(1);
                    }
                    console.log('✅ Column added successfully!');
                    process.exit(0);
                }
            );
        }
    });
});
