FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --no-package-lock --no-audit
COPY . .
ENV VITE_APP_MODE=production
RUN npm run build
EXPOSE 8080
CMD ["npm","run","server"]
