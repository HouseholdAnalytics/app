#!/bin/sh

mkdir -p /run/nginx

cd /app/backend
echo "Starting backend server..."
node dist/main.js &

sleep 5

echo "Starting nginx..."
nginx -g 'daemon off;' 