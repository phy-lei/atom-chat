#!/bin/sh

# Your API Key for OpenAI
openai_api_key=$OPENAI_API_KEY
nextauth_url=$NEXTAUTH_URL
nextauth_secret=$NEXTAUTH_SECRET
upstash_redis_rest_url=$UPSTASH_REDIS_REST_URL
upstash_redis_rest_token=$UPSTASH_REDIS_REST_TOKEN
github_id=$GITHUB_ID
github_secret=$GITHUB_SECRET
pusher_app_id=$PUSHER_APP_ID
public_next_pusher_app_key=$PUBLIC_NEXT_PUSHER_APP_KEY
pusher_app_secret=$PUSHER_APP_SECRET
public_next_pusher_cluster=$PUBLIC_NEXT_PUSHER_CLUSTER
github_access_token=$GITHUB_ACCESS_TOKEN
public_owner_email=$PUBLIC_OWNER_EMAIL


for file in $(find ./dist -type f -name "*.mjs"); do
  sed "s/({}).OPENAI_API_KEY/\"$openai_api_key\"/g;
  s/({}).NEXTAUTH_URL/\"$nextauth_url\"/g;
  s/({}).NEXTAUTH_SECRET/\"$nextauth_secret\"/g;
  s/({}).UPSTASH_REDIS_REST_URL/\"$upstash_redis_rest_url\"/g;
  s/({}).UPSTASH_REDIS_REST_TOKEN/\"$upstash_redis_rest_token\"/g;
  s/({}).GITHUB_SECRET/\"$github_secret\"/g;
  s/({}).GITHUB_ID/\"$github_id\"/g;
  s/({}).PUSHER_APP_ID/\"$pusher_app_id\"/g;
  s/({}).PUBLIC_NEXT_PUSHER_APP_KEY/\"$public_next_pusher_app_key\"/g;
  s/({}).PUSHER_APP_SECRET/\"$pusher_app_secret\"/g;
  s/({}).PUBLIC_NEXT_PUSHER_CLUSTER/\"$public_next_pusher_cluster\"/g;
  s/({}).GITHUB_ACCESS_TOKEN/\"$github_access_token\"/g;
  s/({}).PUBLIC_OWNER_EMAIL/\"$public_owner_email\"/g" $file > tmp
  mv tmp $file
done

rm -rf tmp
