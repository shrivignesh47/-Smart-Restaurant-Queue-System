module.exports = app => {
    const users = require("../controllers/user.controller.js");
    const auth = require("../controllers/auth.controller.js");
    const { verifyToken } = require("../middleware/authJwt.js");

    var router = require("express").Router();

    // Auth Routes
    router.post("/auth/send-otp", auth.sendOtp);
    router.post("/auth/verify-otp", auth.verifyOtpAndLogin);
    router.post("/auth/login", auth.login); // Username/Password login

    // User Routes (Protected)
    router.post("/users", [verifyToken], users.create);
    router.get("/users", [verifyToken], users.findAll);
    router.put("/users/:id/admin-profile", [verifyToken], users.updateAdminProfile); // Must be before generic :id
    router.get("/users/:id", [verifyToken], users.findOne);
    router.put("/users/:id", [verifyToken], users.update);
    router.delete("/users/:id", [verifyToken], users.delete);

    app.use('/api', router);
};
