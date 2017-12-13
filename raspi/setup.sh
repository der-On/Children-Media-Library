#!/bin/bash

cd "$(dirname "$0")"
cd ..

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get update
sudo apt-get install nodejs
sudo npm install npm pm2 -g
npm install
