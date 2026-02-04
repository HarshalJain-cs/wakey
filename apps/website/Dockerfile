FROM node:20-alpine

WORKDIR /app

# Copy the entire monorepo (needed for workspace resolution)
COPY . .

# Navigate to website and install dependencies
WORKDIR /app/apps/website

# Install dependencies with npm
RUN npm install --legacy-peer-deps

# Expose port
EXPOSE 3001

# Set environment variable for production
ENV NODE_ENV=production

# Start the server
CMD ["npm", "run", "server"]
