#!/bin/bash

cd "$(dirname "$0")"
cd ..

sleep 5
./raspi/bin/cli scan
./raspi/bin/server &
SERVER_PID=$!
/usr/bin/chromium-browser --noerrdialogs --disable-session-crashed-bubble --disable-infobars --disable-pinch --overscoll-history-navigation=0 --kiosk http://localhost:8000
kill $SERVER_PID
