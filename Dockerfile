FROM alekzonder/puppeteer:latest

COPY --chown=pptruser:pptruser . ./app
WORKDIR /app

RUN cd /app/hopeflow \
    && npm install 


