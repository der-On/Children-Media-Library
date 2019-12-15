FROM rust:1.38.0

VOLUME ['/usr/src/myapp']

WORKDIR /usr/src/myapp

RUN cargo install cargo-watch

RUN apt-get update && apt-get install pulseaudio -y

CMD ["sh", "./start.sh"]
