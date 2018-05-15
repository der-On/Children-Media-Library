#!/bin/bash

cd "$(dirname "$0")"
cd ..

./raspi/bin/server &
SERVER_PID=$!
/usr/bin/chromium-browser --noerrdialogs --disable-session-crashed-bubble --disable-infobars --disable-pinch --overscoll-history-navigation=0 --kiosk http://localhost:8000
kill $SERVER_PID
