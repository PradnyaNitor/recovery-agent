FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install && cd ..

# Copy source code
COPY server/src ./server/src
COPY server/tsconfig.json ./server/
COPY server/package.json ./server/

# Expose port
EXPOSE 3001

# Start server
WORKDIR /app/server
CMD ["npm", "run", "build"] && ["npm", "start"]
