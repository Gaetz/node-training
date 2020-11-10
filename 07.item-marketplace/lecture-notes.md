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

Previous configuration for local access. Nevertheless, local access can become slow on a laptop computer. We'll leverage google cloud to test our application.



