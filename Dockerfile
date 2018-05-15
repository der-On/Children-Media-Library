FROM rust:1.23.0

VOLUME ['/usr/src/myapp']

WORKDIR /usr/src/myapp

CMD ["sh", "./start.sh"]
