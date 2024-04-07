FROM node:18-alpine AS base

FROM base AS deps

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn config set registry 'https://registry.npmmirror.com/' && yarn install

FROM base AS builder

# 添加镜像源，执行apk更新
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && apk update && apk add --no-cache git

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

FROM base AS runner
WORKDIR /app

# 不需要代理
# RUN apk add proxychains-ng

# 需要哪些配置就用哪些
ENV OPENAI_API_KEY=""
ENV CODE=""
ENV BASE_URL=""
ENV GOOGLE_API_KEY=""
ENV GOOGLE_URL=""
ENV HIDE_USER_API_KEY=""
ENV CUSTOM_MODELS=""

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/server ./.next/server


EXPOSE 3000


CMD ["node","server.js"]
# 不需要代理
# CMD if [ -n "$PROXY_URL" ]; then \
#     export HOSTNAME="127.0.0.1"; \
#     protocol=$(echo $PROXY_URL | cut -d: -f1); \
#     host=$(echo $PROXY_URL | cut -d/ -f3 | cut -d: -f1); \
#     port=$(echo $PROXY_URL | cut -d: -f3); \
#     conf=/etc/proxychains.conf; \
#     echo "strict_chain" > $conf; \
#     echo "proxy_dns" >> $conf; \
#     echo "remote_dns_subnet 224" >> $conf; \
#     echo "tcp_read_time_out 15000" >> $conf; \
#     echo "tcp_connect_time_out 8000" >> $conf; \
#     echo "localnet 127.0.0.0/255.0.0.0" >> $conf; \
#     echo "localnet ::1/128" >> $conf; \
#     echo "[ProxyList]" >> $conf; \
#     echo "$protocol $host $port" >> $conf; \
#     cat /etc/proxychains.conf; \
#     proxychains -f $conf node server.js; \
#     else \
#     node server.js; \
#     fi
