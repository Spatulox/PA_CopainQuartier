FROM node:alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:slim

ARG VITE_API_URL
ENV NODE_ENV=production
ENV VITE_API_URL=${VITE_API_URL}

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json vite.config.js ./

RUN npm install --only=production --no-audit 

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 8080
CMD [ "npm", "start" ]