const mysql = require('mysql2/promise');

async function runMigration() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Shrivignesh@37',
            database: 'restaurant_queue_db'
        });

        console.log('✓ Connected to database');

        // Check if column exists
        const [columns] = await connection.query('DESCRIBE restaurants');
        const hasColumn = columns.some(col => col.Field === 'scanner_access_key');

        if (hasColumn) {
            console.log('✓ Column scanner_access_key already exists!');
        } else {
            console.log('Adding scanner_access_key column...');
            await connection.query(
                'ALTER TABLE restaurants ADD COLUMN scanner_access_key VARCHAR(20) DEFAULT NULL, ADD COLUMN scanner_key_updated_at TIMESTAMP NULL'
            );
            console.log('✅ Column added successfully!');
        }

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

runMigration();
