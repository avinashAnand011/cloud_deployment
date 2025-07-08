# --- Stage 1: Build the Angular application ---
FROM node:18-alpine AS build

# Set the working directory inside the container for the build stage
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./

# Install Angular CLI and other dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Angular application for production
# --output-path: Specifies where the built files will be placed inside this stage's container
# --base-href: Important for correct path resolution in Angular apps
ARG API_URL=/api/items # This ARG is defined but not directly used in the build command here.
RUN npm run build -- --output-path=./dist/angular-frontend --base-href=/

# --- DEBUGGING STEP: List contents of the build output directory ---
RUN ls -l /app/dist/angular-frontend

# --- Stage 2: Serve the Angular application with Nginx ---
FROM nginx:alpine AS production

# Remove default nginx static files to avoid serving the default welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy the custom Nginx configuration from your local project into the Nginx container
# This file must be in the same directory as your Dockerfile locally
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built Angular application from the 'build' stage to Nginx's default serving directory
# Ensure '/app/dist/angular-frontend' matches the --output-path from the build stage
COPY --from=build /app/dist/angular-frontend/browser /usr/share/nginx/html

# --- DEBUGGING STEP: List contents of Nginx's serving directory ---
RUN ls -l /usr/share/nginx/html
RUN chmod -R 777 /usr/share/nginx/html
# Expose port 80, which Nginx listens on
EXPOSE 80

# Command to run Nginx in the foreground so the container stays alive
CMD ["nginx", "-g", "daemon off;"]
