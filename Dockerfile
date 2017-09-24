FROM node:8.5.0-slim

COPY lerna.json package.json yarn.lock /opt/
COPY js/react-tweek/package.json js/react-tweek/yarn.lock /opt/js/react-tweek/
COPY js/tweek-client/package.json js/tweek-client/yarn.lock /opt/js/tweek-client/
COPY js/tweek-local-cache/package.json js/tweek-local-cache/yarn.lock /opt/js/tweek-local-cache/

WORKDIR /opt
RUN yarn && yarn bootstrap

COPY . /opt/

RUN yarn build

CMD yarn test
