FROM buildkite/docker-puppeteer:v1.11.0

COPY . /app/
WORKDIR app

RUN cd /app/hopeflow \
    && npm install 


