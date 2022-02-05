FROM alpine:3.14
RUN apk add yarn
COPY . .
RUN yarn

ENTRYPOINT [ "/entrypoint.sh" ]
CMD [ "up" ]
