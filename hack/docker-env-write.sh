#!/bin/sh

filename=".env"

if [ -f "$filename" ]; then
    # 如果文件存在，则删除
    rm "$filename"
    echo "文件已存在并已删除"
    sleep 2
fi

touch "$filename"

echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env
echo "NEXTAUTH_URL=$NEXTAUTH_URL" >> .env
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" >> .env
echo "UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL" >> .env
echo "UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN" >> .env
echo "GITHUB_ID=$GITHUB_ID" >> .env
echo "GITHUB_SECRET=$GITHUB_SECRET" >> .env
echo "PUSHER_APP_ID=$PUSHER_APP_ID" >> .env
echo "PUBLIC_NEXT_PUSHER_APP_KEY=$PUBLIC_NEXT_PUSHER_APP_KEY" >> .env
echo "PUSHER_APP_SECRET=$PUSHER_APP_SECRET" >> .env
echo "PUBLIC_NEXT_PUSHER_CLUSTER=$PUBLIC_NEXT_PUSHER_CLUSTER" >> .env
echo "GITHUB_ACCESS_TOKEN=$GITHUB_ACCESS_TOKEN" >> .env
echo "PUBLIC_OWNER_EMAIL=$PUBLIC_OWNER_EMAIL" >> .env


