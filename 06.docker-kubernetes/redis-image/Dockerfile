# Use an existing docker image as a base
FROM alpine
# Alpine is a 5Mb linux distribution we will use as an operating system

# Download and install a dependancy
RUN apk add --update redis
# apk is a package manager we use to install the redis package

# Tell the image what to do when it starts
CMD ["redis-server"]