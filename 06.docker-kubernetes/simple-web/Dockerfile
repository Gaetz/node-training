# In hub.docker.com you can find various images with some software preinstalled
FROM node:alpine 

# Specify working directory
WORKDIR /usr/app

# Copy package.json to the container in order to run npm install
COPY ./package.json ./
RUN npm install
# Copy other files from current folder to the container current folder
COPY ./ ./

CMD ["npm", "start"]