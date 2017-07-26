FROM node:6.10.1-slim

ADD js/react-tweek/package.json /tmp/react-tweek/package.json
RUN cd /tmp/react-tweek && yarn install
RUN mkdir -p /opt/react-tweek && cd /opt/react-tweek && ln -s /tmp/react-tweek/node_modules 

ADD js/tweek-local-cache/package.json js/tweek-local-cache/yarn.lock /tmp/tweek-local-cache/
RUN cd /tmp/tweek-local-cache && yarn install
RUN mkdir -p /opt/tweek-local-cache && cd /opt/tweek-local-cache && ln -s /tmp/tweek-local-cache/node_modules 

ADD js/tweek-client/package.json js/tweek-client/yarn.lock /tmp/tweek-client/
RUN cd /tmp/tweek-client && yarn install
RUN mkdir -p /opt/tweek-client && cd /opt/tweek-client && ln -s /tmp/tweek-client/node_modules 

ADD ./js /opt

WORKDIR /opt
CMD ["tail", "-f", "/dev/null"]
