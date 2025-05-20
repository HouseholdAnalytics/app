FROM node:18-alpine as frontend-build

WORKDIR /app/frontend

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:18-alpine as backend-build

WORKDIR /app/backend

COPY server/package*.json ./
COPY server/yarn.lock ./

RUN apk add --no-cache make gcc g++ python3 git

RUN yarn install

COPY server/ .

RUN yarn build

FROM node:18-alpine

RUN apk add --no-cache nginx

COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

WORKDIR /app/backend

COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/package.json .
COPY --from=backend-build /app/backend/yarn.lock .

RUN yarn install --production

COPY nginx.conf /etc/nginx/http.d/default.conf

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]