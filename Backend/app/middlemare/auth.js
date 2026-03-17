const jwt = require("jsonwebtoken");
// const User = require("../Models/UserModel");
const { unprotectedRoute } = require("../utils/UnprotectedRoute");

const auth = async (req, res, next) => {
    try {
        if (unprotectedRoute.includes(req.path)) {
            return next();
        }
        const token = req.headers.authorization?.split(" ")[1];
        if(!token){
            throw new Error("No token provided");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.identity = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: error.message,
            success: false,
        })
    }
}

module.exports = auth;