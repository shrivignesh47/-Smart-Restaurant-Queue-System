const sql = require('./db.js');

// Daily Access Key Model
const DailyAccessKey = function (key) {
    this.restaurant_id = key.restaurant_id;
    this.access_key = key.access_key;
    this.valid_date = key.valid_date;
    this.expires_at = key.expires_at;
    this.created_by = key.created_by;
};

// Generate a random 8-character alphanumeric key
DailyAccessKey.generateKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
    let key = '';
    for (let i = 0; i < 8; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
};

// Create or update daily access key for a restaurant
DailyAccessKey.createOrUpdate = (restaurantId, createdBy, result) => {
    const today = new Date().toISOString().split('T')[0];
    const accessKey = DailyAccessKey.generateKey();
    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);

    // First, deactivate any existing keys for today
    sql.query(
        `UPDATE daily_access_keys 
     SET is_active = FALSE 
     WHERE restaurant_id = ? AND valid_date = ?`,
        [restaurantId, today],
        (err) => {
            if (err) {
                console.error('Error deactivating old keys:', err);
                result(err, null);
                return;
            }

            // Insert new key
            sql.query(
                `INSERT INTO daily_access_keys 
         (restaurant_id, access_key, valid_date, expires_at, created_by, is_active) 
         VALUES (?, ?, ?, ?, ?, TRUE)`,
                [restaurantId, accessKey, today, expiresAt, createdBy],
                (err, res) => {
                    if (err) {
                        console.error('Error creating access key:', err);
                        result(err, null);
                        return;
                    }

                    result(null, {
                        id: res.insertId,
                        restaurant_id: restaurantId,
                        access_key: accessKey,
                        valid_date: today,
                        expires_at: expiresAt,
                        is_active: true
                    });
                }
            );
        }
    );
};

// Get today's active key for a restaurant
DailyAccessKey.getTodayKey = (restaurantId, result) => {
    const today = new Date().toISOString().split('T')[0];

    sql.query(
        `SELECT * FROM daily_access_keys 
     WHERE restaurant_id = ? 
     AND valid_date = ? 
     AND is_active = TRUE 
     AND expires_at > NOW()
     ORDER BY created_at DESC 
     LIMIT 1`,
        [restaurantId, today],
        (err, res) => {
            if (err) {
                console.error('Error fetching daily key:', err);
                result(err, null);
                return;
            }

            if (res.length) {
                result(null, res[0]);
            } else {
                result({ kind: 'not_found' }, null);
            }
        }
    );
};

// Validate an access key
DailyAccessKey.validate = (accessKey, result) => {
    const today = new Date().toISOString().split('T')[0];

    sql.query(
        `SELECT dak.*, r.name as restaurant_name, r.slug as restaurant_slug
     FROM daily_access_keys dak
     JOIN restaurants r ON dak.restaurant_id = r.id
     WHERE dak.access_key = ? 
     AND dak.valid_date = ? 
     AND dak.is_active = TRUE 
     AND dak.expires_at > NOW()`,
        [accessKey, today],
        (err, res) => {
            if (err) {
                console.error('Error validating key:', err);
                result(err, null);
                return;
            }

            if (res.length) {
                result(null, res[0]);
            } else {
                result({ kind: 'invalid_key' }, null);
            }
        }
    );
};

// Log scanner activity
DailyAccessKey.logActivity = (activityData, result) => {
    sql.query(
        `INSERT INTO scanner_activity_log 
     (restaurant_id, reservation_id, access_key_id, action, ip_address, user_agent, success, error_message) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            activityData.restaurant_id,
            activityData.reservation_id,
            activityData.access_key_id,
            activityData.action,
            activityData.ip_address,
            activityData.user_agent,
            activityData.success,
            activityData.error_message
        ],
        (err, res) => {
            if (err) {
                console.error('Error logging activity:', err);
                if (result) result(err, null);
                return;
            }
            if (result) result(null, { id: res.insertId });
        }
    );
};

module.exports = DailyAccessKey;
