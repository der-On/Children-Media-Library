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

echo "Seting up autostart on boot to desktop ..."
echo "[Desktop Entry]
Type=Application
Exec=$PWD/raspi/start.sh
Hidden=false
X-GNOME-Autostart-enabled=true
Name[en_US]=AutoChildrenAudioLibrary
Name=AutoChildrenAudioLibrary
Comment=Start Children Audio Library when GNOME starts" > ~/.config/autostart/AutoChildrenAudioLibrary.desktop
