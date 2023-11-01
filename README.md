# chat-atom

一个拥有权限的即时聊天应用，使用 github 作为第三方登录，redis 作为消息记录存储库，pusher 作为消息推送，同时还有个 chat gpt 的聊天机器人，能担任许多角色。

## 本地运行

### 前置环境

1. **Node**: 检查您的开发环境和部署环境是否都使用 `Node v18` 或更高版本。你可以使用 [nvm](https://github.com/nvm-sh/nvm) 管理本地多个 `node` 版本。
   ```bash
    node -v
   ```
2. **PNPM**: 我们推荐使用 [pnpm](https://pnpm.io/) 来管理依赖，如果你从来没有安装过 pnpm，可以使用下面的命令安装：

   ```bash
    npm i -g pnpm
   ```

### 起步运行

3. 安装依赖
   ```bash
    pnpm install
   ```
4. 复制 `.env.example` 文件，重命名为 `.env`，并按照 example 给的提示去申请各个 key
   ```bash
    OPENAI_API_KEY=sk-xxx...
   ```
5. 运行应用，本地项目运行在 `http://localhost:4321/`
   ```bash
    pnpm run dev
   ```

## 部署

### 部署在 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fphy-lei%2Fatom-chat)

### 部署在 Netlify

[![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https%3A%2F%2Fgithub.com%2Fphy-lei%2Fatom-chat)

### 部署在 Docker

**使用 Docker compose**

```yml
version: '3'

services:
  chatgpt-demo:
    image: phylei/atom-chat:latest
    container_name: atom-chat
    restart: always
    ports:
      - '3000:3000'
    environment:
      - NEXTAUTH_URL
      - NEXTAUTH_SECRET
      - UPSTASH_REDIS_REST_URL
      - UPSTASH_REDIS_REST_TOKEN
      - GITHUB_ID
      - GITHUB_SECRET
      - PUSHER_APP_ID
      - PUBLIC_NEXT_PUSHER_APP_KEY
      - PUSHER_APP_SECRET
      - PUBLIC_NEXT_PUSHER_CLUSTER
      - GITHUB_ACCESS_TOKEN
      - PUBLIC_OWNER_EMAIL
      - OPENAI_API_KEY
      - OPENAI_API_BASE_URL
```

```bash
# start
docker compose up -d
# down
docker-compose down
```

## 环境变量

配置本地或者部署的环境变量

| 名称 | 描述 | 默认 |
| --- | --- | --- |
| `OPENAI_API_KEY` | 你的 OpenAI API Key | `null` |
| `OPENAI_API_BASE_URL` | 请求 OpenAI API 的自定义 Base URL. | `https://api.openai.com（非必需）` |
| `OPENAI_API_MODEL` | 使用的 OpenAI 模型。[模型列表](https://platform.openai.com/docs/api-reference/models/list) | `gpt-3.5-turbo（非必需）` |
| `NEXTAUTH_URL` | 你的 站点域名 | `null` |
| `NEXTAUTH_SECRET` | 生成站点密钥[模型列表](https://next-auth.js.org/configuration/options) | `null` |
| `UPSTASH_REDIS_REST_URL` | [upStash redis](https://console.upstash.com/) | `null` |
| `UPSTASH_REDIS_REST_TOKEN` | [upStash redis](https://console.upstash.com/) | `null` |
| `GITHUB_ID` | [Github OAuth](https://github.com/settings/developers)  | `null` |
| `GITHUB_SECRET` | [Github OAuth](https://github.com/settings/developers) | `null` |
| `PUSHER_APP_ID` | [pusher](https://dashboard.pusher.com/) | `null` |
| `PUBLIC_NEXT_PUSHER_APP_KEY` | [pusher](https://dashboard.pusher.com/) | `null` |
| `PUSHER_APP_SECRET` | [pusher](https://dashboard.pusher.com/) | `null` |
| `PUBLIC_NEXT_PUSHER_CLUSTER` | [pusher](https://dashboard.pusher.com/) | `null` |
| `GITHUB_ACCESS_TOKEN` | github access token 上传图片图床 | `null` |
| `PUBLIC_OWNER_EMAIL` | 你的 email gpt权限 | `null` |
