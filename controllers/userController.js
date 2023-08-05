const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

//@desc Create user
//@route POST /api/users
//@access Public
const registerUser = asyncHandler (async (req, res) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password){
        res.status(400).json({
            success: false,
            error: 'Please provide name, email and password'
        });
        throw new Error('Please provide name, email and password');
    }
    // check if user already exists
    const user = await User.findOne({email});
    if(user){
        res.status(400).json({
            success: false,
            error: 'User already exists'
        });
        throw new Error('User already exists');
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // create user
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword
    });
    // Check if it was created
    if(newUser){
        res.status(201).json({
            success: true,
            name: newUser.name,
            email: newUser.email,
            id: newUser._id,
            token: generateToken(newUser)
        });
    } else {
        res.status(400).json({
            success: false,
            error: 'User could not be created'
        });
    }
    res.send({message: 'Register User'});
});
//@desc Authenticate User
//@route POST /api/users/login
//@access Public
const loginUser = asyncHandler (async (req, res) => {
    const {email, password} = req.body;
    // check if user exists
    const user = await User.findOne({email});
    if(!user){
        res.status(400).json({
            success: false,
            error: 'User does not exist'
        });
        throw new Error('User does not exist');
    }
    // check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        res.status(400).json({
            success: false,
            error: 'Incorrect password'
        });
        throw new Error('Incorrect password');
    }
    // create JWT
    // return jsonwebtoken
    res.status(200).json({
        success: true,
        token: generateToken(user),
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
}); 
//@desc Get user data
//@route GET /api/users/me
//@access Private
const getMe = asyncHandler (async (req, res) => {
    res.status(200).json(
        req.user
    );
});
//Generage JWT
const generateToken = (user) => {
    return jwt.sign({id: user._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}
//@desc Get name by id
//@route GET /api/users/:id
//@access Public
const getUserById = asyncHandler (async (req, res) => {
    // return all names by id
    const user = await User.findById(req.params.id);
    let username = "";
    if(user){
        username = user.name;
    }
    if(!user){
        res.status(400).json({
            success: false,
            error: 'User does not exist'
        });
        throw new Error('User does not exist');
    }
    res.status(200).json(username);
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getUserById
}