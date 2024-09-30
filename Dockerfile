FROM node:lts-alpine3.20 AS build
WORKDIR app-build
COPY . .
RUN npm install
RUN npm run build

FROM node:lts-alpine3.20

WORKDIR app
COPY --from=build /app-build/package.json .
COPY --from=build /app-build/package-lock.json .
COPY --from=build /app-build/dist/ .
RUN npm install --omit=dev
ENTRYPOINT ["node", "main.js"]