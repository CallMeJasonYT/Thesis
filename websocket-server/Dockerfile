FROM node:16-alpine

WORKDIR /app

# Copy package.json and package-lock.json/yarn.lock
COPY package.json ./
COPY yarn.lock ./

# Install dependencies including axios and dotenv
RUN yarn install

# Copy the rest of the application
COPY . .

# Expose the WebSocket port
EXPOSE 80

# Command to run the application
CMD ["yarn", "start"]