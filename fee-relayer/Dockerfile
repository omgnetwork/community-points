FROM node:10-alpine

RUN apk update && apk add --no-cache python g++ make postgresql-client

RUN addgroup -g 10000 -S omg && \
    adduser -u 10000 -S omg -G omg
USER omg
WORKDIR /home/omg

COPY . .

RUN npm install

ENTRYPOINT ["npm", "start"]
