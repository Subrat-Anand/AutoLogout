const express = require('express')
const {SignUp, LogIn, logout} = require('../controller/auth.controller')
const isAuth = require('../middleware/isAuth')
const authRouter = express.Router()

authRouter.post('/signUp', SignUp)
authRouter.post('/login', LogIn)
authRouter.post('/logout', logout)

module.exports = authRouter