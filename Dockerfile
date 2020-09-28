FROM node:14-slim
WORKDIR /opt

COPY lerna.json package.json yarn.lock ./
COPY js/react-tweek/package.json ./js/react-tweek/
COPY js/tweek-client/package.json ./js/tweek-client/
COPY js/tweek-local-cache/package.json ./js/tweek-local-cache/

RUN yarn

COPY . .

RUN yarn build

CMD yarn test
