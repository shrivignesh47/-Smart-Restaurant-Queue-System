const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"] || req.headers["authorization"];

    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.restaurantId = decoded.restaurant_id;
        next();
    });
};

isAdmin = (req, res, next) => {
    if (req.userRole !== "Admin") {
        return res.status(403).send({
            message: "Require Admin Role!"
        });
    }
    next();
};

isRestaurantAdmin = (req, res, next) => {
    if (req.userRole !== "Admin" && req.userRole !== "RestaurantAdmin") {
        return res.status(403).send({
            message: "Require Restaurant Admin Role!"
        });
    }
    next();
};

const authJwt = {
    verifyToken: verifyToken,
    isAdmin: isAdmin,
    isRestaurantAdmin: isRestaurantAdmin
};

module.exports = authJwt;
