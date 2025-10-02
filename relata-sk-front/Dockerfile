FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY quasar.config.* ./
COPY index.html ./

RUN npm install

COPY . .

ARG VITE_API_BASE=http://api_app:3000/api
ENV VITE_API_BASE=${VITE_API_BASE}

RUN npx quasar build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist/spa ./
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
