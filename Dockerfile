FROM node:alpine as builder
WORKDIR /usr/src
COPY . .

FROM node:alpine
WORKDIR /usr/src
RUN npm install -g pnpm
COPY --from=builder /usr/src ./
COPY --from=builder /usr/src/hack ./
RUN pnpm install
ENV HOST=0.0.0.0
ENV PORT=3000 
ENV NODE_ENV=production
EXPOSE $PORT
CMD ["/bin/sh", "docker-entrypoint.sh"]