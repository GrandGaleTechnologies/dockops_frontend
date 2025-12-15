# Use Node 22.17.1 for the build stage
FROM node:22.17.1-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Accept Railway's env vars at build time
ARG VITE_SERVER_API
ENV VITE_SERVER_API=$VITE_SERVER_API

# Build the Vite app
RUN yarn run build

# --- Production stage ---
FROM node:22.17.1-alpine AS production

WORKDIR /app

# Install serve for static file hosting
RUN yarn global add serve

# Copy build output from build stage
COPY --from=build /app/dist ./dist

# Expose port for Railway
EXPOSE 8080

# Serve the built app
CMD ["serve", "-s", "dist", "-l", "8080"]
