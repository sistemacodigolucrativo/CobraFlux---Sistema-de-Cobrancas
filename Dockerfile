FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ENV VITE_APP_MODE=production
RUN npm run build
EXPOSE 8080
CMD ["npm","run","server"]
