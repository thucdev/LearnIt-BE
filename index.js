const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')

const authRouter = require('./routes/auth')
const postRouter = require('./routes/post')

const connectDB = async () => {
    try {
        await mongoose.connect(
            `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.wz5en.mongodb.net/mern-learnit?retryWrites=true&w=majority`,
            {
                // useCreateIndex: true,
                // useNewUrlParser: true,
                // useUnifiedTopology: true,
                // useFindAndModify: false
            }
        )

        console.log('MongoDb connected')
    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
}
connectDB()
const app = express()
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)
//for my server
// app.use('/api/post', postRouter)

const port = 5000

app.listen(port, () => console.log(`Server is running on port: ${port} `))
