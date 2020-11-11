import mongoose from 'mongoose'
import { Password } from '../services/password'

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
            delete ret.password
            delete ret.__v
        }
    }
})

// This function will run before each save.
// "this" inside the function is the document we will save.
// We don't use arrow notation for function because it would
// override the 'this' keyword.
userSchema.pre('save', async function(done) {
    // Only hass the password if it is modified
    if(this.isModified('password')) {
        const hashed = Password.toHash(this.get('password'))
        this.set('password', hashed)
    }
    done()
})

// Used to force javascript to type our user attributes
interface UserAttrs {
    email: string
    password: string
}

// Used to force typescript add a build function in the User model
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc
}

// User type-safe factory
// We will be able to use User.build({ email: '...', password: '...' })
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs)
}

// Describes the properties a user document will have
interface UserDoc extends mongoose.Document {
    email: string
    password: string
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }