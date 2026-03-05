const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticate = require('../authenticate');

router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
    } catch (err) {
        next(err);
    }
});

router.post('/signup', async (req, res, next) => {
    try {
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            const err = new Error('User already exists!');
            err.status = 409;
            throw err;
        }
        const newUser = await User.create(req.body);
        const token = authenticate.getToken({ _id: newUser._id });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
            success: true,
            token: token,
            status: 'Registration Successful!',
            user: { _id: newUser._id, username: newUser.username, admin: newUser.admin }
        });
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            const err = new Error('User not found!');
            err.status = 404;
            throw err;
        }

        const isMatch = await user.comparePassword(req.body.password);
        if (!isMatch) {
            const err = new Error('Incorrect password!');
            err.status = 401;
            throw err;
        }

        const token = authenticate.getToken({ _id: user._id });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
            success: true,
            token: token,
            status: 'Login Successful!',
            user: { _id: user._id, username: user.username, admin: user.admin }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
