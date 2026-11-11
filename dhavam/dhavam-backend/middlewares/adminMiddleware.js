
const jwt = require("jsonwebtoken");

const adminMiddleware = (req, res, next) => {
    console.log("Inside adminMiddleware");

    const authHeader = req.headers.authorization;

    // Check whether the Authorization header exists
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authorization header is missing. Please log in again.",
        });
    }

    // Check the Bearer token format
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
        return res.status(401).json({
            success: false,
            message: "Invalid authorization header format.",
        });
    }

    const token = parts[1];

    try {
        const jwtResponse = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
console.log("Frontend token email:", jwtResponse.email);
console.log("Frontend token role:", jwtResponse.role);

        req.payload = jwtResponse.email;
        req.role = jwtResponse.role;

        if (jwtResponse.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin authorization required.",
            });
        }

        return next();
    } catch (error) {
        console.error("Admin authentication error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token. Please log in again.",
        });
    }
};

module.exports = adminMiddleware;
