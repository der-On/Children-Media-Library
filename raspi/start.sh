#!/bin/bash

cd "$(dirname "$0")"
cd ..

sleep 5
./raspi/bin/cli scan

# Disable annoying dialogs about crashes in chromium
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' /home/pi/.config/chromium/Default/Preferences
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' /home/pi/.config/chromium/Default/Preferences

# "Disable screen screensaver and screenblanking
xset s noblank
xset s off
xset -dpms

./raspi/bin/server &
SERVER_PID=$!
/usr/bin/chromium-browser --noerrdialogs --disable-session-crashed-bubble --disable-infobars --disable-pinch --overscoll-history-navigation=0 --kiosk http://localhost:8000
kill $SERVER_PID
