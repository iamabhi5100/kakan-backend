# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the NestJS app
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only the necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Expose the port your app runs on
EXPOSE 3000

# Start the app
CMD ["node", "dist/main"]