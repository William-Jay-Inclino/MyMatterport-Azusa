#!/bin/sh
# Slack integration
export WALDO=xoxb-1021674286866-4384944516769-jGUp42OiJ9EGQfeeNo5M7WeS
export CHANNELS=azusa
export DOMAIN=rev-kitten.com

# We generally release by TAG or LATEST
export TAG_LATEST=$(git tag | tail -n1 | cut -w -f1)


# use export TAG=<v#.#.#_rc###> to set TAG, otherwise use latest
if [ -z "$TAG" ]; then
    export TAG=$TAG_LATEST
fi

# default is dev
if [ -z "$1" ]; then
    export URL=https://$CHANNELS-dev.$DOMAIN
else
    export URL=https://$CHANNELS-$1.$DOMAIN
fi

# save project directory, for restore later
export ROOT=`pwd`

# logs and quotes
export LOGS=`git log --pretty='format:%C(yellow)%d %C(auto)%h %s (%an, %ah)' --simplify-merges| head -n20`
export Q=`curl https://api.quotable.io/random\?tags\=technology | jq '. | (.content + " (" + .author + ")" )'`
export COMMENT="@here _*Good day!*_%0A _ $Q _%0A%0A*$URL is now: $TAG*%0A%0A*New Release:* $TAG%0A%0A*What's Done:*%0A\`\`\`$LOGS\`\`\`"

# go back to project root
cd $ROOT

# post message and upload file
curl -d "type=mrkdwn" -d "text=$COMMENT" -d "channel=$CHANNELS" -H "Content-Type: application/x-www-form-urlencoded" -H "Authorization: Bearer $WALDO" -X POST https://slack.com/api/chat.postMessage

# display comment and go back to develop
echo $COMMENT
git checkout develop


