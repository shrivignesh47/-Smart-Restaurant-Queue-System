require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const corsOptions = {
    origin: 'http://localhost:4200'
};

app.use(cors(corsOptions));

// Parse requests of content-type - application/json
app.use(express.json({ limit: '50mb' }));

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Simple route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Smart Restaurant Queue System API." });
});

// Initialize Database Tables
const User = require("./app/models/user.model.js");
const Restaurant = require("./app/models/restaurant.model.js");
const Table = require("./app/models/table.model.js");
const Queue = require("./app/models/queue.model.js");
const Reservation = require("./app/models/reservation.model.js");

User.initTable();
Restaurant.initTable();
Table.initTable();
Queue.initTable();
Reservation.initTable();

// Import routes              
require("./app/routes/test.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/restaurant.routes")(app);
require("./app/routes/table.routes")(app);
require("./app/routes/queue.routes")(app);
require("./app/routes/reservation.routes")(app);
require("./app/routes/scanner.routes")(app);

// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
