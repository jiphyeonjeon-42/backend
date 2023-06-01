FROM node:20-alpine
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"
RUN npm install --global pnpm
COPY . .
RUN pnpm install

ENTRYPOINT [ "/entrypoint.sh" ]
CMD [ "up" ]
