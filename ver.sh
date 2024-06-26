#!/bin/sh
# We generally release by TAG or LATEST

touch ./public/version.txt
touch ./src/assets/version.js

# latest TAG
export TAG_LATEST=$(git tag | tail -n1 | cut -w -f1)

# use export TAG=<v#.#.#_rc###> to set TAG, otherwise use latest
if [ -z "$TAG" ]; then
    git checkout $TAG_LATEST
    echo "Checking out ..." $TAG_LATEST
    echo $TAG_LATEST '| '$(git log | head -n1 | cut -d" " -f2) >./public/version.txt
    echo 'export const APP_VERSION="'$TAG_LATEST '| '$(git log | head -n1 | cut -d" " -f2)'"' >./src/assets/version.js

else
    git checkout $TAG
    echo "Checking out ..." $TAG
    echo $TAG '| '$(git log | head -n1 | cut -d" " -f2) >./public/version.txt
    echo 'export const APP_VERSION="'$TAG '| '$(git log | head -n1 | cut -d" " -f2)'"' >./src/assets/version.js

fi