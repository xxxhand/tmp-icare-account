FROM node:14.17.0-alpine
RUN ["mkdir", "/usr/bin/logs"]
WORKDIR /usr/bin/app
COPY package.json yarn.lock ./
RUN yarn install && yarn cache clean
COPY . .
WORKDIR /usr/bin/app
RUN yarn build
