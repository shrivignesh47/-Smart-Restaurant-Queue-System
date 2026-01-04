require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const corsOptions = {
    origin: 'http://localhost:4200'
};

app.use(cors(corsOptions));

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Simple route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Smart Restaurant Queue System API." });
});

// Initialize Database Tables
const User = require("./app/models/user.model.js");
User.initTable();

// Import routes              
require("./app/routes/test.routes")(app);
require("./app/routes/user.routes")(app);

// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
