#!/bin/bash
#!/
cd "$(dirname "$0")"
cd ..

docker run \
    --volume ${PWD}:/home/cross/project \
    ragnaroek/rust-raspberry:1.26.0 \
    build --release
