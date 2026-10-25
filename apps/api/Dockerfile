FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN npm ci --workspace=apps/api --include-workspace-root=false

COPY apps/api ./apps/api

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=apps/api"]
