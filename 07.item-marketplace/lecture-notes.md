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

If we add a lot of errors, the error handler will become too large and, as a consequence, unmanageable.

We will also use the package to make express handling async errors:
```
npm install express-async-errors
```

Create a new `custom-error.ts` abstract class :

```
export abstract class CustomError extends Error {
    abstract statusCode: number     // number member variable

    constructor(message:string) {
        super(message)
        Object.setPrototypeOf(this, CustomError.prototype)
    }

    abstract serializeErrors(): {   // method that returns an array of objects
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

    serializeErrors() {
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
    }

    serializeErrors() {
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
        return res.status(err.statusCode).send({ errors: err.serializeErrors() })
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
    }

    serializeErrors() {
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

Install mongoose:
```
npm install mongoose
```