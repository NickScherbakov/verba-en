FROM node:20-bookworm-slim

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Create books directory (volume mount point)
RUN mkdir -p books

EXPOSE 3000

CMD ["npm", "start"]
