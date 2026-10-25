FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN npm ci --workspace=apps/web --include-workspace-root=false

COPY apps/web ./apps/web

ENV NODE_ENV=development

EXPOSE 5173

CMD ["npm", "run", "dev", "--workspace=apps/web", "--", "--host", "0.0.0.0"]
