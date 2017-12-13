#!/bin/bash

cd "$(dirname "$0")"
cd ..

git pull
npm install
pm2 reload "children-audio-library"
