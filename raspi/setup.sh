#!/bin/bash

cd "$(dirname "$0")"
cd ..

EXEC_SCRIPT="${PWD}/raspi/start.sh"
ACTIVE_DISPLAY="${DISPLAY}"
EXEC_SCRIPT_ESCAPED=(${EXEC_SCRIPT//\//'\/'})

echo "Setting up autostart on boot to desktop ..."
# remove legacy autostart desktop shortcut
rm -rf ~/.config/autostart/autoChildrenAudioLibrary.desktop
sudo cp raspi/childrenAudioLibrary.service.template /lib/systemd/system/childrenAudioLibrary.service
sudo sed -i "s/ACTIVE_DISPLAY/${ACTIVE_DISPLAY}/" /lib/systemd/system/childrenAudioLibrary.service
sudo sed -i "s/EXEC_SCRIPT/${EXEC_SCRIPT_ESCAPED}/" /lib/systemd/system/childrenAudioLibrary.service

sudo systemctl enable childrenAudioLibrary.service

echo "Setup complete."
