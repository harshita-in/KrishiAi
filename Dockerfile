FROM node:20-alpine AS build

WORKDIR /app

COPY frontend/farmer-portal/package*.json ./frontend/farmer-portal/
RUN cd frontend/farmer-portal && npm ci

COPY frontend/farmer-portal ./frontend/farmer-portal

WORKDIR /app/frontend/farmer-portal
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/frontend/farmer-portal/build ./build

ENV NODE_ENV=production
ENV PORT=7860

EXPOSE 7860

CMD ["serve", "-s", "build", "-l", "7860"]
