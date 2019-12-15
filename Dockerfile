FROM rust:1.39.0

VOLUME ['/usr/src/myapp']

WORKDIR /usr/src/myapp

RUN apt-get update && apt-get install pulseaudio libasound2-dev -y
RUN cargo install cargo-watch

CMD ["sh", "./start.sh"]
