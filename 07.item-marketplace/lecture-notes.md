# Item market place preparation

## Use cases

* User can list items of different categories to sale
* Other users can purchase this item
* Any user can list items for sale and purchase items
* When a user buy an item, the item is locked for him for 5 minutes
* If the item purchase is not confirmed, the item will unlock after 5 minutes
* Item prices can be edited if the item is no locked

## Views

* Items for sale
* Sign up, sign in
* Dashboard (My orders, Sell item, Log out)
* Item detail
* Item purchase confirmation
* Sell an item

## Data

User
```
email       -- string
password    -- string
```
Item
```
title       -- string
price       -- number
userId      -- ref
orderId     -- ref
```

Order
```
userId      -- ref
status      -- string (enum)
tickedId    -- ref
expiresAt   -- date
```

Charge
```
orderId     -- ref
status      -- string (enum)
amount      -- number
```

## Services
* auth          -- related to user auth
* items         -- items creation/edit, knows whether an item can be updated
* orders        -- order creation / edition
* expiration    -- watch orders, cancel them after 5 minutes
* payments      -- handle payments, cancel ordis if they fail

## Events
* UserCreated
* UserUpdated
* OrderCreated
* OrderCancelled
* OrderExpired
* ItemCreated
* ItemUpdated
* ChargeCreated

## General archirecture
* NextJS client
* Each service with express + a mongoDB database, except the expiration service, which will use a Redis in-memory database
* Each service will share a common library
* As an event bus, we'll use NATS Streaming Server
* We will use Typescript, which is a popular idiom of javascript

# Auth service

## Setup
Create an auth folder, get inside.
Run :
```
npm init -y
npm install typescript ts-node-dev express @types/express
tsc --init
mkdir src
touch src/index.ts
```

Edit your new file :
```
import express from 'express'
import { json } from 'body-parser'

const app = express()
app.use(json())

app.listen(3000, () => {
    console.log('Auth service listening on port 3000')
})
```

Edit package.json to setup the start script:
```
...
  "scripts": {
    "start": "ts-node-dev src/index.ts"
  },
...  
```

Test your app

## Deploying the auth service

Build your docker app:
```
docker build -t gaetz/items-auth .
```

Create a deployment auth-depl.yaml file in a ./infra/k8s folder:
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth
  template:
    metadata:
      labels:
        app: auth
    spec:
      containers:
        - name: auth
          image: gaetz/items-auth
---
# Default service type: clusterip service
apiVersion: v1
kind: Service
metadata:
  name: auth-srv
spec:
  selector:
    app: auth
  ports:
    - name: auth
      protocol: TCP
      port: 3000
      targetPort: 3000
```

On the root folder, create a skaffold.yaml config file:
```
apiVersion: skaffold/v2alpha3
kind: Config
deploy:
  kubectl:
    manifests:
      - ./infra/k8s/*
build:
  local:
    push: false
  artifacts:
    - image: gaetz/items-auth
      context: auth
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.ts'
            dest: .
```

Then run skaffold:
```
skaffold dev
```
If skaffold crash the first time, rerun it.

## Setting up ingress-nginx

Add a route in your auth service:
```
...
app.get('/api/users/currentuser', (req, res) => {
    res.send('Hello')
})
...
```

Add a ingress-srv.yaml file into infra/k8s/ :
```
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: ingress-service
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: 'true'
spec:
  rules:
    - host: items.dev
      http:
        paths:
          - path: /api/users/?(.*)
            backend:
              serviceName: auth-srv
              servicePort: 3000
```

To access locally your application, modify /etc/hots and add `127.0.0.1  items.dev`

# Google cloud setup

Previous configuration for local access. Nevertheless, local access can become slow on a laptop computer. We'll leverage google cloud to test our application. We will use google cloud because skaffold was developped by google, so that it is very easy to use with google cloud.

Note that we'll have to use our free credit for this demo. Google cloud offer 300$ so we should stay in the free tier, so you won't pay anything. Google cloud need a manual update to start taking you money, so you don't have to worry.

To suspend or stop your VM, you can go on this page :
https://console.cloud.google.com/compute/instances

Do not forget, at the end of this course, to delete the cluster.

If you don't want to use your free credit, keep working with the local redirection.

## Google cloud project

Go to cloud.google.com/free
Create an account
Create a new project with name: items-dev
Wait for the project to complete its setup
Change to your new project

## Kubernetes setup on google cloud

Go to Kubernetes engine on the menu
Wait for the kubernetes API to start
Create a cluster, name it items-dev-cluster
Change the name of the cluster to items-dev
Select a zone near you
Select a 1.15+ version (e.g. latest)
Don't click Create.

Then go to default-pool. Use only 3 nodes. You should see your config. 
Go to Nodes.
Select Serie N1 and Type g1-small to get a small machine.
Nom click create. It will take some time.

We'll use the google cloud sdk to automatically manage kubernetes contexts for us.
Go to https://cloud.google.com/sdk/docs/quickstarts 
Choose your version of the installation. For windows + WSL2 choose Windows.
Type:
```
gcloud auth login
```
Use the link it eventually gives, connect with your google cloud account then past the verification code.

Now run:
```
gcloud init
```
If you need so, you have to Re-initilize this configuration, then choose your account, select your project, then answer yes.
Select the region you have chosen before.

If you run docker desktop, run:
```
gcloud container clusters get-credentials items-dev-cluster
```

If not:
```
gcloud components install kubectl
gcloud container clusters get-credentials items-dev-cluster
```

When you right click the Docker desktop daemon, under Kubernetes, you know see your google cloud cluster. Select it.

## Config Skaffold for google cloud

On the google cloud menu breadcumb, scroll down until Tools / Cloud Build, then enable it.

Update your skaffold.yaml file:
```
apiVersion: skaffold/v2alpha3
kind: Config
deploy:
  kubectl:
    manifests:
      - ./infra/k8s/*
build:
  # local:
  #   push: false
  googleCloudBuild:
    projectId: items-dev-295308               # Real ID of the project
  artifacts:
    - image: us.gcr.io/items-dev-295308/auth  # us.gcr.io/project/folder-name
      context: auth
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.ts'
            dest: .
```

Update the auth-depl.yaml deployment file with the new image name:
```
...
    spec:
      containers:
        - name: auth
          image: us.gcr.io/items-dev-295308/auth
---
...
```

## Config ingress-nginx for google cloud

Still connected to the google cloud context, run:
```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.40.1/deploy/static/provider/cloud/deploy.yaml
```

Go to Networking / Network service / Load balancing. Click on the randomly named load balander. Copy the ip adress of the load balancer

Open the host file (on windows if you use docker desktop : c:/windows/system32/drivers/etc/hosts) and change the redirection:
```
34.76.229.116 items.dev
```

Then Rerun skaffold:
```
skaffold dev
```

If you have a credential error, you may have to log in again:
```
gcloud auth application-default login
```

You will see google cloud build online. You can go Cloud Build history on the google cloud platform to see the same log.

Connect to items.dev/api/users/currentuser

Unfortunatly, you cannot override the certificate error with firefox. You have to use chromium/edge/chrome and type "thisisunsafe" on the error page. And you finally land on your cloud hosts application!

# Auth implementation

## Creating routes

Run:
```
express-validator
```
In the auth src folder, create a routes folder, and four files. Also update the index:

signin.ts
```
import express from 'express'

const router = express.Router()

router.post('/api/users/signin', (req, res) => {
    res.send('Hello signin')
})

export { router as signinRouter }
```

signout.ts
```
import express from 'express'

const router = express.Router()

router.post('/api/users/signout', (req, res) => {
    res.send('Hello signout')
})

export { router as signoutRouter }
```

signup.ts
```
import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router()

router.post('/api/users/signup', [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({ min:4, max: 20}).withMessage('Password must be between 4 and 20 characters')
], (req: Request, res: Response) => {
    // Error check
    const errors = validationResult(req)
    if(!errors.isEmpty) {
        // Send error object as a json array
        return res.status(400).send(errors.array())
    }

    const { email, password } = req.body
    console.log('Creating a user with email: ' + email)
    res.send({})

})

export { router as signupRouter }
```

current-user.ts
```
import express from 'express'

const router = express.Router()

router.get('/api/users/currentuser', (req, res) => {
    res.send('Hi currentuser')
})

export { router as currentUserRouter }
```

index.ts
```
import express from 'express'
import { json } from 'body-parser'

import { currentUserRouter } from './routes/current-user'
import { signinRouter } from './routes/signin'
import { signoutRouter } from './routes/signout'
import { signupRouter } from './routes/signup'

const app = express()
app.use(json())
app.use(currentUserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)

app.listen(3000, () => {
    console.log('Auth service listening on port 3000')
})
```

## Handling errors

Here we handle a specific signup error. But we will have to handle tons of different errors. We'll create a middleware to handle all errors the same way.

Create a middleware folder in the src folder. Create a error-handler.ts file:
```
import { Request, Response, NextFunction } from 'express'

export const errorHandler = (err: Error, req: Request, res: Response, next:NextFunction) => {
    console.log('Error: ', err)
    res.status(400).send({
        message: err.message
    })
}
```

Add `app.use(errorHandler)` in the index.ts file.

Go back to signup and update the error with:
```
...
    if(!errors.isEmpty) {
        throw new Error('Invalid Email or Password')
    }
...
```
Now errors will be handled the same way.

## Errors subclasses

We want to go further and have différent types of errors with different fields. We'll use typescript object oriented system.

Create a new `errors` folder in src. Add files inside:

request-validation-error.ts
```
import { ValidationError } from 'express-validator'

export class RequestValidationError extends Error {
    constructor(private errors: ValidationError[]) {
        super()
        // Because we extend a built-in class
        Object.setPrototypeOf(this, RequestValidationError.prototype)
    }
}
```

database-connection-error.ts
```
export class DatabaseConnectionError extends Error {
    reason = 'Error connecting to database'
    constructor() {
        super()
        // Because we extend a built-in class
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype)
    }
}
```

Update signup.ts:
```
...
import { RequestValidationError } from '../errors/request-validation-error'
import { DatabaseConnectionError } from '../errors/database-connection-error'
...
    // Error check
    const errors = validationResult(req)
    if(!errors.isEmpty) {
        throw new RequestValidationError(errors.array())
    }

    const { email, password } = req.body
    console.log('Creating a user with email: ' + email)
    throw new DatabaseConnectionError()
...
```

Update error-handler.ts:
```
import { Request, Response, NextFunction } from 'express'
import { RequestValidationError } from '../errors/request-validation-error'
import { DatabaseConnectionError } from '../errors/database-connection-error'

export const errorHandler = (err: Error, req: Request, res: Response, next:NextFunction) => {
    
    if(err instanceof RequestValidationError) {
        const formattedErrors = err.errors.map(error => {
            return { message: error.msg, field: error.param }
        })
        return res.status(400).send({ errors: formattedErrors })
    }

    if(err instanceof DatabaseConnectionError) {
        return res.status(500).send({ errors: [{ message: err.reason}] })
    }

    res.status(400).send({ errors: [{ message: 'Unidentified error' }] })
}
```

## Serializing errors

If we add a lot of error types, the error handler will become too large and, as a consequence, unmanageable.

We will also use the package to make express handling async errors:
```
npm install express-async-errors
```

Create a new `custom-error.ts` abstract class:
```
export abstract class CustomError extends Error {
    abstract statusCode: number     // number member variable

    constructor(message:string) {
        super(message)
        Object.setPrototypeOf(this, CustomError.prototype)
    }

    public abstract serializeErrors(): {   // method that returns an array of objects
        message: string;            // ...composed by a message string
        field?: string              // ...and an optional string field
    }[]
}
```

request-validation-error.ts:
```
import { ValidationError } from 'express-validator'
import { CustomError } from './custom-error'

export class RequestValidationError extends Error implements CustomError {
    statusCode = 400

    constructor(public errors: ValidationError[]) {
        super()
        // Because we extend a built-in class
        Object.setPrototypeOf(this, RequestValidationError.prototype)
    }

    public serializeErrors() {
        return this.errors.map( err => {
            return { message: err.msg, field: err.param }
        })
    }
}
```

database-connection-error.ts
```
import { CustomError } from './custom-error'

export class DatabaseConnectionError extends CustomError {
    statusCode = 500
    reason = 'Error connecting to database'

    constructor() {
        super('Error connecting to database')
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype)
    }

    public serializeErrors() {
        return [ {message: this.reason} ]
    }
}
```

error-handler.ts
```
import { Request, Response, NextFunction } from 'express'
import { CustomError } from '../errors/custom-error'

export const errorHandler = (err: Error, req: Request, res: Response, next:NextFunction) => {
    
    if(err instanceof CustomError) {
        const tsErr = err as CustomError
        return res.status(tsErr.statusCode).send({ errors: tsErr.serializeErrors() })
    }

    res.status(400).send({ errors: [{ message: 'Unidentified error' }] })
}
```

You can leverage our code to implement a not found error :

not-found-error.ts:
```
import { CustomError } from './custom-error'

export class NotFoundError extends CustomError {
    statusCode = 404

    constructor() {
        super('Route not found')
        Object.setPrototypeOf(this, NotFoundError.prototype)
    }

    public serializeErrors() {
        return [ { message: 'Route not found'} ]
    }
}
```

index.ts
```
import express from 'express'
import 'express-async-errors'
...
import { NotFoundError } from './errors/not-found-error'

const app = express()
app.use(json())
app.use(currentUserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)

app.all('*', async () => {
    throw new NotFoundError()
})

app.use(errorHandler)
...
```

## Database for Auth

First install mongoose:
```
npm install mongoose
npm install @types/mongoose
```

In the k8s folder, create a `auth-mongo-depl.yaml`:
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-mongo-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth-mongo
  template:
    metadata:
      labels:
        app: auth-mongo
    spec:
      containers:
        - name: auth-mongo
          image: mongo
---
apiVersion: v1
kind: Service
metadata:
  name: auth-mongo-srv
spec:
  selector:
    app: auth-mongo
  ports:
    - name: db
      protocol: TCP
      port: 27017
      targetPort: 27017
```

This will auto install the database from docker hub.

Update index.js:
```
...
import mongoose, { mongo } from 'mongoose'
...
const start = async () => {
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
```

Create a src/models folder, and a user.ts file inside:
```
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
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

// Describes the properties user documents will have
interface UserDoc extends mongoose.Document {
    email: string
    password: string
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }
```

## Creating a user

### Hashing password
First, we want the ability to hash passwords, so that we don't store them in clear in the database.

Create a auth/services/password.ts file:
```
import { scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt) 

export class Password {
    static async toHash(password: string) {
        const salt = randomBytes(8).toString('hex')
        const buffer = (await scryptAsync(password, salt, 64)) as Buffer

        return `${buffer.toString('hex')}.${salt}`
    }

    static async compare(storedPassword: string, suppliedPassword: string) {
        const [hashedPassword, salt] = storedPassword.split('.')
        const buffer = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer

        return buffer.toString('hex') === hashedPassword
    }
}
```

Update the user model so we are sure we hash the password each time we save a user.

user.ts
```
...
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
...
```

### Handling bad requests

We want to send a bad request when the user tries to create a user that already exists.

Create a new bad-request-error.ts file:
```
import { CustomError } from './custom-error'

export class BadRequestError extends CustomError {
    statusCode = 400

    constructor(public message:string) {
        super(message)
        Object.setPrototypeOf(this, BadRequestError.prototype)
    }

    public serializeErrors() {
        return [{ message: this.message }]
    }
}
```

Use it in the signup.ts file. We also add the user creation logic:
```
...
import { BadRequestError } from '../errors/bad-request-error'
...
    const { email, password} = req.body
    // Test if user already exists
    const existingUser = await User.findOne({ email })
    if(existingUser) {
        throw new BadRequestError('User ' + email + ' already exists')
    }

    // If not create a user
    const user = User.build({ email, password })
    await user.save()
    console.log('Creating user: ' + email)

    res.status(201).send(user)
...
```

### Log the user after creation with JWT

JSON Web Tokens are a classic way to handle authentification on web application. It sends a token that is usually stored in the session of the web browser or in a cookie and identify him/her to other services, by being sent with each request's header. It has a short lifespan (15 minutes). A video about JWT: https://www.youtube.com/watch?v=7Q17ubqLfaM

In our application, each service will check the token is valid. But what if we want to ban a user? The user may have a still valid token for 15 minutes. To solve this, we will send a UserBanned event to all services. Each service will store in cache a list of banned users for 15 minutes (maximum live of a token) to forbid this user may he or she comes.

In a normal web client, we can execute javascript in the client application to check the JWT and send the correct html page. We will have a first request to get the page, then a second request to execute some javascript in your browser and check auth etc. But in this application, we will use NextJS, a server-side rendering framework. Because the first page we reach by a GET request is pre-rendered, we cannot have a second request to check auth. We need a cookie to store the JWT on the first page load.

Note that with microservices, there is no perfect auth solution. We'll use one that will work in our context.

Let's start by install cookie-session, a tool to handle cookies in sessions:
```
npm install cookie-session @types/cookie-session
```

We need to update index.js:
```
...
import cookieSession from 'cookie-session'
...
const app = express()
app.set('trust proxy', true)                            // We need to trust nginx proxy
app.use(json())
app.use(cookieSession({ signed: false, secure: true })) // cookie config, jwt already encrypted
...
```

Now let's create the JWT:
```
npm install jsonwebtoken @types/jsonwebtoken
```

signup.js
```
...
import jwt from 'jsonwebtoken'
...
    // If not create a user
    const user = User.build({ email, password })
    await user.save()
    console.log('Creating user: ' + email)

    // Generate JWT and store it in a session cookie   
    const userJwt = jwt.sign({ id: user.id, email: user.email }, 'artfxsecretkey')
    req.session = { jwt: userJwt }

    res.status(201).send(user)
...
```
We'll update the secret key later.

If you send an https request with postman to signup, you will see a cookie in the result request. The session code you receive is base64 encoded. If you want to see your JWT, you can go to : https://www.base64decode.org/ to decode it. If you want to see its content : https://jwt.io/

The secret key will need to be known by all pods. It will actually be included in each container environment variables. This is why we will use kubernetes to set it.
```
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=artfxsecretkey
```

Let's update the only pod we have for now.

auth-depl.yaml
```
...
      containers:
        - name: auth
          image: us.gcr.io/items-dev-295308/auth
          env:
            - name: JWT_KEY
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: JWT_KEY
---
...
```

We can now update the hard coded secret key in signup.ts
```
...
    const userJwt = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY!)
...
```
The exclamation point means we are sure `process.env.JWT_KEY` is defined. To ensure that, we need to check the environment variable JWT_KEY exists when the app starts, that is in index.ts:
```
...
const start = async () => {
    if(!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined')
    }
...
```

We now have to remove password and __v from the user returned after signup, and also change the monge's "_id" field to a more common "id" field.We can do this in the user schema, that allow un to change the return type. We need to add a second argument.

auth/models/user.ts
```
const userSchema = new mongoose.Schema({
    ...
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
```

The signup process is finally finished!


## Signin in a user

When signing in a user, we will need to do the same email and password check we did for signup. Let's factorize it. Create a auth/middlewares/validate-request.ts file:
```
import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

import { RequestValidationError } from '../errors/request-validation-error'

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        throw new RequestValidationError(errors.array())
    }
    next()  // Next middleware or final route handler
}
```

routes/signin.ts
```
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'

import { validateRequest } from '../middlewares/validate-request'
import { User } from '../models/user'
import { BadRequestError} from '../errors/bad-request-error'
import { Password } from '../services/password'

const router = express.Router()

router.post('/api/users/signin', [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password').trim().notEmpty().withMessage('You must supply a password')
    ], 
    validateRequest,                            // an other argument before the function
    async (req: Request, res: Response) => {
        const { email, password } = req.body

        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            throw new BadRequestError('Invalid credentials')
        }

        const passwordMatch = await Password.compare(existingUser.password, password)
        if(!passwordMatch) {
            throw new BadRequestError('Invalid credentials')
        }

        const userJwt = jwt.sign({ id: existingUser.id, email: existingUser.email }, process.env.JWT_KEY!)
        req.session = { jwt: userJwt }

        res.status(200).send(existingUser)
})

export { router as signinRouter }
```

We can also update the signup process to use validateRequest.

routes/signup.ts
```
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'

import { BadRequestError } from '../errors/bad-request-error'
import { User } from '../models/user'
import { validateRequest } from '../middlewares/validate-request'

const router = express.Router()

router.post('/api/users/signup', [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password').trim().isLength({ min:4, max: 20}).withMessage('Password must be between 4 and 20 characters')
    ], 
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password} = req.body
        // Test if user already exists
        const existingUser = await User.findOne({ email })
        if(existingUser) {
            throw new BadRequestError('User ' + email + ' already exists')
        }

        // If not create a user
        const user = User.build({ email, password })
        await user.save()
        console.log('Creating user: ' + email)

        // Generate JWT and store it in a session cookie   
        const userJwt = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY!)
        req.session = { jwt: userJwt }

        res.status(201).send(user)
    })

export { router as signupRouter }
```

## Current user


