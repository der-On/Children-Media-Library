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
