FROM node:8.14.0-alpine

COPY ./hopeflow hopeflow

# Download hugo
# no more ADD, hopefully reduce the docker layers
# ADD https://github.com/spf13/hugo/releases/download/v${HUGO_VERSION}/${HUGO_TARBALL_NAME}.tar.gz /usr/local/
# install firebase-tools and hugo in one command, makes for a smaller image
# according to https://semaphoreci.com/blog/2016/12/13/lightweight-docker-images-in-5-steps.html
RUN cd hopeflow \
    && apk add --update ca-certificates wget \
    && update-ca-certificates \
    && rm -rf /var/cache/apk/* \
    && npm install 
