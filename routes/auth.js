const express = require('express')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const router = express.Router()
require('dotenv').config()

const verifyToken = require('../middleware/auth')
const User = require('../models/User')

//@route GET api/auth
//@desc Check if user is logged in
//@access Public
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password')
        if (!user) return res.status(400).json({ success: false, message: 'User not found' })
        res.json({ success: true, user })
    } catch (error) {
        console.log('e', error)
        res.status(500).json({ success: false, message: 'Internal error server' })
    }
})

//@route POST api/auth/register
//@desc Register user
//@access Public

router.post('/register', async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Missing username or password' })
    }

    try {
        //Check for existing user
        const user = await User.findOne({ username })
        if (user) return res.status(400).json({ success: false, message: 'Username already exist' })

        const hashedPassword = await argon2.hash(password)
        const newUser = new User({ username, password: hashedPassword })

        await newUser.save()

        //return token
        const accessToken = jwt.sign(
            {
                userId: newUser._id,
            },
            process.env.ACCESS_TOKEN_SECRET
        )
        res.json({ success: true, message: `User created successfully`, accessToken })
    } catch (error) {
        console.log('e', error)
        res.status(500).json({ success: false, message: 'Internal error server' })
    }
})

//@route POST api/auth/login
//@desc login  user
//@access Public

router.post('/login', async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Missing username or password' })
    }
    try {
        const user = await User.findOne({ username })

        if (!user) res.status(400).json({ success: false, message: 'Incorrect user' })

        //username found
        const passwordValid = await argon2.verify(user.password, password)
        if (!passwordValid) res.status(400).json({ success: false, message: 'Incorrect password' })

        //All good
        //return token
        const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET)
        res.json({ success: true, message: 'Logged in successfully', accessToken })
    } catch (error) {
        console.log('e', error)
        res.status(500).json({ success: false, message: 'Internal error server' })
    }
})

module.exports = router
