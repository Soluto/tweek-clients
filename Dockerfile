FROM node:6.10.1-slim

ADD js/react-tweek/package.json js/react-tweek/yarn.lock /tmp/react-tweek/
RUN cd /tmp/react-tweek && yarn install
RUN mkdir -p /opt/react-tweek && cd /opt/react-tweek && ln -s /tmp/react-tweek/node_modules 

ADD js/tweek-repo/package.json js/tweek-repo/yarn.lock /tmp/tweek-repo/
RUN cd /tmp/tweek-repo && yarn install
RUN mkdir -p /opt/tweek-repo && cd /opt/tweek-repo && ln -s /tmp/tweek-repo/node_modules 

ADD js/tweek-rest/package.json js/tweek-rest/yarn.lock /tmp/tweek-rest/
RUN cd /tmp/tweek-rest && yarn install
RUN mkdir -p /opt/tweek-rest && cd /opt/tweek-rest && ln -s /tmp/tweek-rest/node_modules 

ADD ./js /opt

WORKDIR /opt
CMD ["tail", "-f", "/dev/null"]
