const User = require("../models/user.model.js");
const config = require("../config/auth.config.js");
const jwt = require("jsonwebtoken");

exports.sendOtp = (req, res) => {
    if (!req.body.contact_info) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    const contact_info = req.body.contact_info;

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create a temporary JWT that holds the OTP and Phone validation
    // This token is valid for 5 minutes
    const otpToken = jwt.sign(
        { contact_info: contact_info, otp: otp },
        config.secret,
        { expiresIn: 300 } // 5 minutes
    );

    // MOCK SENDING OTP
    console.log(`[MOCK SMS] Sending OTP ${otp} to ${contact_info}`);

    res.send({
        message: "OTP sent successfully!",
        otp: otp, // Returning OTP for testing
        otpToken: otpToken // Client must send this back for verification
    });
};

exports.verifyOtpAndLogin = (req, res) => {
    if (!req.body.contact_info || !req.body.otp || !req.body.otpToken) {
        res.status(400).send({
            message: "Contact info, OTP, and OTP Token are required!"
        });
        return;
    }

    const { contact_info, otp, otpToken } = req.body;

    // Verify the OTP Token
    jwt.verify(otpToken, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Invalid or expired OTP Session Token!"
            });
        }

        // Check if the token belongs to the same phone number
        if (decoded.contact_info !== contact_info) {
            return res.status(401).send({
                message: "OTP Token does not match contact info!"
            });
        }

        // Check if the OTP matches
        if (decoded.otp !== otp) {
            return res.status(401).send({
                message: "Invalid OTP!"
            });
        }

        // OTP is valid. Now handle User Login/Creation
        User.findByContactInfo(contact_info, (err, user) => {
            if (err) {
                if (err.kind === "not_found") {
                    // Create new customer
                    const newUser = new User({
                        name: "New Customer",
                        role: "Customer",
                        contact_info: contact_info
                    });

                    User.create(newUser, (err, createdUser) => {
                        if (err) {
                            res.status(500).send({ message: "Error creating new user." });
                        } else {
                            generateTokenAndResponse(createdUser, res);
                        }
                    });
                } else {
                    res.status(500).send({ message: "Error retrieving user." });
                }
            } else {
                // User exists
                generateTokenAndResponse(user, res);
            }
        });
    });
};

function generateTokenAndResponse(user, res) {
    var token = jwt.sign(
        {
            id: user.id,
            role: user.role,
            restaurant_id: user.restaurant_id
        },
        config.secret,
        { expiresIn: 86400 } // 24 hours
    );

    res.status(200).send({
        id: user.id,
        name: user.name,
        role: user.role,
        contact_info: user.contact_info,
        restaurant_id: user.restaurant_id,
        accessToken: token
    });
}

// Username/Password Login (for Admin and Restaurant users)
exports.login = (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.status(400).send({
            message: "Username and password are required!"
        });
        return;
    }

    const { username, password } = req.body;
    const bcrypt = require('bcryptjs');

    // Find user by contact_info (username)
    User.findByContactInfo(username, (err, user) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({
                    message: "User not found!"
                });
            }
            return res.status(500).send({
                message: "Error retrieving user."
            });
        }

        // Check if user has a password (Admin/RestaurantAdmin/RestaurantStaff)
        if (!user.password) {
            return res.status(400).send({
                message: "This user cannot login with password. Please use OTP login."
            });
        }

        // Verify password
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({
                message: "Invalid password!"
            });
        }

        // Generate token and send response
        generateTokenAndResponse(user, res);
    });
};
