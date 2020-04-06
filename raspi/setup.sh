#!/bin/bash

cd "$(dirname "$0")"
cd ..


echo "Seting up autostart on boot to desktop ..."
mkdir -p ~/.config/autostart
echo "[Desktop Entry]
Type=Application
Exec=$PWD/raspi/start.sh
Hidden=false
X-GNOME-Autostart-enabled=true
Name[en_US]=AutoChildrenAudioLibrary
Name=AutoChildrenAudioLibrary
Comment=Start Children Audio Library when GNOME starts" > ~/.config/autostart/autoChildrenAudioLibrary.desktop

echo "Disabling screen screensaver and screenblanking ..."
sudo echo "" >> /etc/lightdm/lightdm.conf
sudo echo "[SeatDefaults]" >> /etc/lightdm/lightdm.conf
sudo echo "xserver-command=X -s 0 -dpms" >> /etc/lightdm/lightdm.conf
sudo echo "@xset s noblank" >> /etc/xdg/lxsession/LXDE-pi/autostart
sudo echo "@xset s off" >> /etc/xdg/lxsession/LXDE-pi/autostart
sudo echo "@xset -dpms" >> /etc/xdg/lxsession/LXDE-pi/autostart

echo "Setup complete."
