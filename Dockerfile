FROM node:alpine as builder
WORKDIR /usr/src
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run build

FROM builder aS runtime
WORKDIR /usr/src
RUN npm install -g pnpm
COPY --from=builder /usr/src/dist ./dist
COPY --from=builder /usr/src/node_modules ./node_modules
ENV HOST=0.0.0.0 
ENV PORT=3000 
ENV NODE_ENV=production
EXPOSE $PORT
CMD node ./dist/server/entry.mjs