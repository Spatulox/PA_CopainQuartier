FROM node:alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:slim

ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json ./

RUN npm install --only=production --no-audit 

COPY --from=builder /usr/src/app/dist ./dist
COPY /usr/src/app/img ./img
COPY /usr/src/app/java ./java

EXPOSE 8080
CMD [ "node", "dist/src/main.js" ]