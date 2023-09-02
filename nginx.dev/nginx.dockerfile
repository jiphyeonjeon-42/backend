FROM nginx:1.25.1-alpine

# drop symlinks, logs are bind-mounted
RUN unlink /var/log/nginx/access.log
RUN unlink /var/log/nginx/error.log

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./conf.d /etc/nginx/conf.d

