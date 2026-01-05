-- Verify users table schema
DESCRIBE users;

-- View all columns
SHOW COLUMNS FROM users;

-- Check existing users
SELECT id, name, email, contact_info, created_at FROM users;

-- View complete user data (all columns)
SELECT * FROM users;

-- Update a user's profile (example)
-- UPDATE users 
-- SET 
--     email = 'john@example.com',
--     date_of_birth = '1990-01-01',
--     gender = 'male',
--     street_address = '123 Main St',
--     city = 'Mumbai',
--     state = 'Maharashtra',
--     pin_code = '400001',
--     dietary_preferences = 'vegetarian',
--     food_allergies = 'peanuts',
--     email_notifications = TRUE,
--     sms_notifications = TRUE
-- WHERE id = 2;
