FROM node:alpine AS builder
ARG VITE_API_URL
ARG WEBSOCKET_URL

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ENV VITE_API_URL=${VITE_API_URL}
ENV WEBSOCKET_URL=${WEBSOCKET_URL}

RUN npm run build

FROM node:slim


ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json vite.config.js ./

RUN npm install --only=production --no-audit 

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 8080
CMD [ "npm", "start" ]