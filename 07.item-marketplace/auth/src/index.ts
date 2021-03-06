import mongoose from 'mongoose'

import { app } from './app'

const start = async () => {
    if(!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined')
    }
    try {
        await mongoose.connect('mongodb://auth-mongo-srv:27017/auth', {
            useNewUrlParser:true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        console.log('Auth connected to mongodb')
    } catch(err) {
        console.log(err)
    }

    app.listen(3000, () => {
        console.log('Auth service listening on port 3000')
    })
}

start()

