#!/bin/bash

cd "$(dirname "$0")"
cd ..

pm2 start --name "children-audio-library" server.js
/usr/bin/chromium-browser --noerrdialogs --disable-session-crashed-bubble --disable-infobars --disable-pinch --overscoll-history-navigation=0 --kiosk http://localhost:8000
pm2 delete "children-audio-library"
