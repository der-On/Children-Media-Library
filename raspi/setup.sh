#!/bin/bash

cd "$(dirname "$0")"
cd ..

echo "Installing nodejs ..."
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get update
sudo apt-get install nodejs

echo "Installing latest npm and pm2 ..."
sudo npm install npm pm2 -g

echo "Installing package dependencies ..."
npm install

echo "Seting up autostart on system boot ..."
sudo echo "sh ${PWD}/raspi/start.sh" >> /etc/xdg/lxsession/LXDE-pi/autostart
