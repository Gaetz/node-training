# Docker intro
## Installation

For windows install, follow this documentation : https://docs.docker.com/docker-for-windows/wsl/

You need to :

    * Use windows update to update to version 1909
    * Install WSL2 : https://docs.microsoft.com/en-us/windows/wsl/install-win10
    * Install Docker Desktop : https://www.docker.com/products/docker-desktop
    * Tick the right boxes (see end of top document) to have Docker use WSL2

## Hello world

Open WSL
run 
```
docker run hello-world
```
If you're denied the permission : https://www.digitalocean.com/community/questions/how-to-fix-docker-got-permission-denied-while-trying-to-connect-to-the-docker-daemon-socket

If it works, read your terminal to understand what happened.

## Containers and image

A container is a set of processes with a specific namespace (processes, hard drive part, network, users...) and a specific control group (memory, cpu usage, IO on HD, network bandwidth). It send calls to the kernel.

Namespaces and control groups only exist on linux. That is why we use WSL. If you install docker on macos or windows without WSL, you'll actually use a virtual machine.

An image has a file system snapshot and a strartup command. When we create a container, it copies the specific file system and run the startup command.

## Docker Commands
``` 
docker run <image>              // Run an image

$ docker run hello-world
``` 
``` 
docker run <image> <command>    // Run an image, then run the "override" command inside

$ docker run busybox echo hi there
$ docker run busybox ls
``` 
``` 
docker ps                       // List all running containers
docker ps --all                 // List all containers ever created

$ docker run busybox ping google.com
$ docker ps                     // --> In an other terminal
``` 
``` 
docker run = docker create + docker start   // Create a container + start it

$ docker create hello-world     // give container id
$ docker start -a [id]          // start the container through its id 
                                // (-a attach to the container so print output)
``` 
``` 
docker system prune             // Delete all containers and caches
``` 
``` 
docker logs [id]                // Get the log of a container

$ docker create busybox echo hi there
$ docker start [id]
$ docker logs [id]
``` 
``` 
docker stop [id]                // Stop the container within 10 seconds (SIGTERM)
docker kill [id]                // Immediatly kill the container (SIGKILL)
``` 
``` 
docker exec -it [id] <command>  // Execute one command inside a container that  
                                // is already started. Allow to start a second 
                                // inside the container.
// -i : attach terminal to the standard input of the process
// -t : format to have a nice terminal output and autocomplete
``` 
``` 
docker exec -it [id] sh         // Allow to use shell commands in container.
                                // Ctrl + D to exit.
``` 
## Create your own docker image
First create a docker file : configuration

Create a redis-image folder and a Dockerfile file inside it.
``` 
mkdir redis-image
cd redis-image/
touch Dockerfile
``` 
Edit the Docker file 

```
# Use an existing docker image as a base
FROM alpine

# Download and install a dependancy
RUN apk add --update redis

# Tell the image what to do when it starts
CMD ["redis-server"]
```
Run the build by entering in the terminal:
```
docker build .
```
Then we need to get the image id:
```
docker image ls
```
You should get your latest image id in the list. You can then run it :
```
docker run [id]
```
Fine, it works! Exit by Ctrl+C.

You can also build an image with your docker id and a name for the image.
```
docker build -t gaetz/redis:latest .    // -t for tag, latest is the version
```
Then you can launch the named version
```
docker run -it gaetz/redis              // -it to be able to Ctrl-C to kill server
```
You may also want to map your machine's port on the container port
```
docker run -it -p 8080:8080 gaetz/redis
```

## Create a simple-web application to test


## Create Dockerfile for the blog app

For each microservice, this will be the config file:
```
FROM node:alpine

WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./

CMD ["npm", "start"]
```
For the client, you'll need to add one line (useful later):
```
FROM node:alpine

# Add the following line 
ENV CI=true

WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./

CMD ["npm", "start"]
```
