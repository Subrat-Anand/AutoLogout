const express = require('express')
const getCurrentUser = require('../controller/currentUser.controller')
const isAuth = require('../middleware/isAuth')
const getCurrentUserRouter = express.Router()


getCurrentUserRouter.get('/current', isAuth, getCurrentUser)

module.exports = getCurrentUserRouter