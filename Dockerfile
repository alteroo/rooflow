FROM alekzonder/puppeteer:latest

COPY . /app/
WORKDIR app

RUN cd /app/hopeflow \
    && npm install 


