FROM node:16

EXPOSE 9002

# RUN apk update && \
#     apk add --no-cache bash
# RUN apk add --no-cache imagemagick ghostscript poppler-utils

# RUN apk add g++ make py3-pip

WORKDIR /app
COPY ./ ./
RUN mkdir uploads

RUN yarn install
RUN yarn build

#====================================RUN=============================================== 
CMD ["yarn", "start:production"]