#!/bin/bash

yarn
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc

yarn && yarn build

if [[ $(node -p -e "require('./js/tweek-client/package.json').version") != $(npm show tweek-client version) ]]; then
    echo "publish tweek-client"
    cd js/tweek-client && npm publish && cd ../..
fi

if [[ $(node -p -e "require('./js/tweek-local-cache/package.json').version") != $(npm show tweek-local-cache version) ]]; then
    echo "publish tweek-local-cache"
    cd js/tweek-local-cache && npm publish && cd ../..
fi

if [[ $(node -p -e "require('./js/react-tweek/package.json').version") != $(npm show react-tweek version) ]]; then
    echo "publish react-tweek"
    cd js/react-tweek && npm publish && cd ../..
fi
