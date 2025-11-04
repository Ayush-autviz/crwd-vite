# Stage 1: Build the app
FROM node:20-alpine AS builder
 
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
 
# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine
 
# Copy the build output to Nginx HTML directory
COPY --from=builder /app/dist /usr/share/nginx/html
# (If React uses `build` instead of `dist`, adjust accordingly)
# COPY --from=builder /app/build /usr/share/nginx/html
 
# Copy a custom Nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf
 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]