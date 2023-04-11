#!/bin/sh

export SERVER=52.193.174.71
export USER=ec2-user
export HOME=/home/$USER
export ROOT=`pwd`

# create project folder
ssh $USER@$SERVER "sudo mkdir -p $HOME/azusa_$1 && sudo chown $USER:$USER $HOME/azusa_$1"

# copy files to remote, then move to webserver
scp -r dist/* $USER@$SERVER:$HOME/azusa_$1
ssh $USER@$SERVER "sudo rm -fR /usr/share/nginx/html/azusa/azusa_$1 && sudo mv -fv $HOME/azusa_$1 /usr/share/nginx/html/azusa"
ssh $USER@$SERVER "sudo ls -lh /usr/share/nginx/html/azusa/azusa_$1"

# create vhosts config
ssh $USER@$SERVER "sudo mkdir -p $HOME/azusa_conf && sudo chown $USER:$USER $HOME/azusa_conf"

export DOMAIN=rev-kitten.com
export SUB=azusa-$1
export PROJ=azusa_$1
export uri=\$uri
export PORT=8095
envsubst < vhost.conf.template > $SUB.$DOMAIN.conf
scp $ROOT/$SUB.$DOMAIN.conf $USER@$SERVER:$HOME/azusa_conf
ssh $USER@$SERVER "sudo cp $HOME/azusa_conf/* /etc/nginx/conf.d/. && sudo certbot run -d $SUB.$DOMAIN -n && sudo service nginx restart "
rm $SUB.$DOMAIN.conf

export DOMAIN=archi-twin.com
export SUB=airp-$1
export PROJ=azusa_$1
export uri=\$uri
export PORT=8095
envsubst < vhost.conf.template > $SUB.$DOMAIN.conf
scp $ROOT/$SUB.$DOMAIN.conf $USER@$SERVER:$HOME/azusa_conf
ssh $USER@$SERVER "sudo cp $HOME/azusa_conf/* /etc/nginx/conf.d/. && sudo certbot run -d $SUB.$DOMAIN -n && sudo service nginx restart "
rm $SUB.$DOMAIN.conf

