#!/bin/bash

yarn
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc

if [[ $(node -p -e "require('./js/tweek-client/package.json').version") != $(npm show tweek-client version) ]]; then
    echo "publish tweek-client"
    cd js/tweek-client && yarn && npm run build && npm publish && cd ../..
fi

if [[ $(node -p -e "require('./js/tweek-local-cache/package.json').version") != $(npm show tweek-local-cache version) ]]; then
    echo "publish tweek-local-cache"
    cd js/tweek-client && yarn && npm run build && cd ../..
    cd js/tweek-local-cache && yarn && npm run build && npm publish && cd ../..
fi

if [[ $(node -p -e "require('./js/react-tweek/package.json').version") != $(npm show react-tweek version) ]]; then
    echo "publish react-tweek"
    cd js/react-tweek && yarn && npm run build && npm publish && cd ../..
fi
