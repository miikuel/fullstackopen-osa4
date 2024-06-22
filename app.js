const express = require('express')
const app = express()
const config = require('./utils/config')
const blogsRouter = require('./controllers/blogs')
const cors = require('cors')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
// const middleware = require('./utils/middleware')
// const logger = require('./utils/logger')


const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl)

app.use(cors())
app.use(express.json())
app.use('/api/blogs', blogsRouter)

module.exports = app



