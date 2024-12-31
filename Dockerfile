# Base image for build stage
FROM node:20

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Install build tools for native modules (e.g., bcrypt)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Rebuild bcrypt from source
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM --platform=linux/amd64 node:20 as production

WORKDIR /app

# Copy built app from the build stage
COPY --from=build /app .

# Expose the application port
EXPOSE 3000

# Set environment variables
ENV DB_USERNAME=${DB_USERNAME} \
    DB_PASSWORD=${DB_PASSWORD} \
    ACCESS_SECRET_KEY=${ACCESS_SECRET_KEY} \
    REFRESH_SECRET_KEY=${REFRESH_SECRET_KEY} \
    S3_BUCKET_NAME=${S3_BUCKET_NAME} \
    S3_REGION=${S3_REGION} \
    S3_ACCESS_KEY=${S3_ACCESS_KEY} \
    S3_SECRET_KEY=${S3_SECRET_KEY}

# Start the application
CMD ["npm", "start"]
