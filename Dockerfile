# Stage 1: Build the application
FROM oven/bun:latest as build

# Set the working directory inside the container
WORKDIR /app

# Copy the package files
COPY bun.lockb package.json /app/

# Install dependencies
RUN bun install

# Copy the rest of the application source code
COPY . /app


RUN bunx prisma generate
RUN bunx prisma migrate deploy 

