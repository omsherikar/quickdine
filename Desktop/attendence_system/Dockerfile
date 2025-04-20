FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY nest-cli.json ./

# Build the application
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"] 