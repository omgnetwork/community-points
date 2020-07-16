FROM node:12-alpine

RUN apk update && apk add make git g++ python

COPY . /home/contracts

WORKDIR /home/contracts

RUN rm -Rf ./node_modules
RUN rm -Rf ./build

RUN npm install

RUN npx truffle version

RUN npx truffle compile
