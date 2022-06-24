#!/bin/bash

cd "$(dirname "$0")"
cd ..

git pull
rm -rf ~/.cache/chromium/Default
./raspi/setup.sh
shutdown -r now