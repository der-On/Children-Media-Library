FROM rust:1.42.0

VOLUME ['/usr/src/myapp']

WORKDIR /usr/src/myapp

RUN cargo install cargo-watch

CMD ["sh", "./start.sh"]
