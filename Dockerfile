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

ENV JWTSECRET="Flaky1-Resize-Overstep"
ENV DATABASE_URL="postgresql://_fd7d226ba4ba329e:_5f4ecde4e26ec3904ca8935825903b@primary.postgressql--ds6cqb6qnbws.addon.code.run:5432/_7f9e93c113bc?sslmode=require/float"

RUN bunx prisma generate
RUN bunx prisma migrate deploy 
