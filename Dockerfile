# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.16.0

# Base image
FROM node:${NODE_VERSION}-alpine
WORKDIR /usr/src/app

# Install bash (required for some npm scripts)
RUN apk add --no-cache bash

# Copy package.json and install all dependencies (including devDependencies)
COPY package.json ./
RUN npm install

# Install Prisma CLI globally for development
RUN npm install -g prisma

# Copy all source files
COPY . .

# Make sure the non-root node user can write to the working directory
RUN chown -R node:node /usr/src/app
USER node

# Set environment variables (can be overridden via docker-compose)
ENV NODE_ENV=development
ENV MONGODB_URL=${MONGODB_URL}
ENV POSTGRES_URL=${POSTGRES_URL}

# Generate Prisma clients (optional, keep in dev for hot reload)
RUN npm run generate:mongo
RUN npm run generate:postgres

# Expose Next.js dev server port
EXPOSE 3000

# Run Next.js in development mode
CMD ["npm", "run", "dev"]
