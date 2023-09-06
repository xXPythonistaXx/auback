FROM node:16.13.1 as build
WORKDIR /app
COPY package*.json ./
RUN yarn install --ignore-engines
COPY . .
RUN yarn build

FROM node:16.13.1
WORKDIR /app
COPY package.json ./
RUN yarn install --production --ignore-engines
COPY --from=build /app/dist ./dist

EXPOSE 80
CMD yarn start:prod
