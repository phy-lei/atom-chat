#!/bin/sh

filename=".env"

if [ -f "$filename" ]; then
    # 如果文件存在，则删除
    rm "$filename"
    echo "文件已存在并已删除"
    sleep 2
fi

touch "$filename"

# 定义环境变量
declare -A env_variables=(
  ["OPENAI_API_KEY"]=$OPENAI_API_KEY
  ["NEXTAUTH_URL"]=$NEXTAUTH_URL
  ["NEXTAUTH_SECRET"]=$NEXTAUTH_SECRET
  ["UPSTASH_REDIS_REST_URL"]=$UPSTASH_REDIS_REST_URL
  ["UPSTASH_REDIS_REST_TOKEN"]=$UPSTASH_REDIS_REST_TOKEN
  ["GITHUB_ID"]=$GITHUB_ID
  ["GITHUB_SECRET"]=$GITHUB_SECRET
  ["PUSHER_APP_ID"]=$PUSHER_APP_ID
  ["PUBLIC_NEXT_PUSHER_APP_KEY"]=$PUBLIC_NEXT_PUSHER_APP_KEY
  ["PUSHER_APP_SECRET"]=$PUSHER_APP_SECRET
  ["PUBLIC_NEXT_PUSHER_CLUSTER"]=$PUBLIC_NEXT_PUSHER_CLUSTER
  ["GITHUB_ACCESS_TOKEN"]=$GITHUB_ACCESS_TOKEN
  ["PUBLIC_OWNER_EMAIL"]=$PUBLIC_OWNER_EMAIL
)

# 创建env文件并写入环境变量
# 清空或创建env文件
for key in "${!env_variables[@]}"; do
  echo "$key=${env_variables[$key]}" >> .env
done