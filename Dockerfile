# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the client app
RUN npm run build

# Expose the port your app runs on
EXPOSE 8080

# Start the server
CMD ["npm", "start"]