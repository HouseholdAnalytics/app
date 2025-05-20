FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL:-http://localhost:3000}

RUN yarn build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

ENV VITE_API_URL=${VITE_API_URL:-http://localhost:3000}

CMD ["/bin/sh", "-c", "envsubst '${VITE_API_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]