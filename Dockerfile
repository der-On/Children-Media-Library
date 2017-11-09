FROM node:8.9

VOLUME ['/home/node/app']

User node

WORKDIR /home/node/app

CMD ["sh", "./start.sh"]
