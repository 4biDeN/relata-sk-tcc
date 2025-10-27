FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY quasar.config.* ./
COPY index.html ./
RUN npm install
RUN npm install socket.io-client jwt-decode

COPY . .

ARG VITE_API_BASE=http://localhost:3000
ARG VITE_WS_URL=http://localhost:3000
ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_WS_URL=${VITE_WS_URL}

RUN npx quasar build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist/spa ./
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
