const mysql = require("mysql2");
const dbConfig = require("../config/db.config.js");

// Create a connection to the database
const connection = mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
});

// Open the MySQL connection
connection.connect(error => {
    if (error) {
        console.error("Successfully connected to the database.");
        // In a production environment, you might want to handle this differently
        // For now, we'll just log it. If the DB doesn't exist, you might need to create it.
        console.error("Error connecting check your credentials or if database exists: ", error);
        return;
    }
    console.log("Successfully connected to the database.");
});

module.exports = connection;
