#!/bin/bash

cd "$(dirname "$0")"
cd ..

docker run \
    --volume ${PWD}:/home/cross/project \
    ragnaroek/rust-raspberry:1.26.0 \
    build --release

cp -R target/arm-unknown-linux-gnueabihf/release/cli ./raspi/bin/cli
cp -R target/arm-unknown-linux-gnueabihf/release/server ./raspi/bin/server
