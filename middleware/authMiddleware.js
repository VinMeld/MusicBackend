const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
JWT_SECRET = process.env.JWT_SECRET;
const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new Error('Not authorized to access this route', 401));
    }
    try {
        //Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        //Get user from token
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (err) {
        console.log(err);
        return next(new Error('Not authorized to access this route', 401));
    }
});
module.exports = { protect };