# Use the official Node.js image as the base image
FROM --platform=linux/arm64 node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY dist ./dist
COPY .env ./
COPY swagger.json ./

# Install dependencies
RUN npm install

# Expose the port specified in the .env file (default: 80)
EXPOSE 80

# Command to run the application
CMD ["npm", "run", "start"]