# syntax=docker/dockerfile:1
FROM node:26-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=NODE_AUTH_TOKEN,required=true \
    TOKEN="$(cat /run/secrets/NODE_AUTH_TOKEN)" && \
    printf '@agile-data:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=%s\n' "$TOKEN" > /tmp/advent.npmrc && \
    NPM_CONFIG_USERCONFIG=/tmp/advent.npmrc npm ci && rm /tmp/advent.npmrc
COPY . .
RUN npm run build

FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
