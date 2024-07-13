docker run \
   --name new-chat-v4\
   -p 3000:3000 \
   -e OPENAI_API_KEY="sk-YSeowg370BUaeRewRzjLx5xXV3EOrJJjDmGpJnnRVxIr9rxW" \
   -e BASE_URL="https://api.chatanywhere.com.cn" \
   -e CODE="18296642923" \
   -e HIDE_USER_API_KEY=1 \
   -e GOOGLE_API_KEY="AIzaSyAZ7woop3OTxWdPabIDX4JD3xRGN0KC6ws" \
   -e GOOGLE_URL="https://gemini-proxy-fei.deno.dev" \
   -e CUSTOM_MODELS="-gpt-4-32k,-gpt-4-0314,-gpt-4-0613,-gpt-4-32k-0314,-gpt-4-32k-0613,-gpt-4-turbo-priview,-gpt-3.5-turbo,-gpt-3.5-turbo-0310" \
   -e COS_APP_ID="AKIDDHBuSoxseFbibJ5oOtHWYO3UnwysdGgr" \
   -e COS_APP_SECRET="5wfMKK9pKcfZbjy4zpVyW0S1YByjYK3d" \
   -e COS_BUCKET="ai-1306275892" \
   -e COS_REGION="ap-guangzhou" \
   -e DALLE_IMAGE_PROXY="dalle-proxy-fei.deno.dev" \
   --restart=always \
   -d new-chat:v4



   docker run --name new-chat \
   -p 3001:3000 -v /data/clash/config:/app/config \
   -e OPENAI_API_KEY="sk-YSeowg370BUaeRewRzjLx5xXV3EOrJJjDmGpJnnRVxIr9rxW" \
   -e BASE_URL="https://api.chatanywhere.com.cn" \
   -e CODE="123456" \
   -e HIDE_USER_API_KEY=1 \
   -e GOOGLE_API_KEY="AIzaSyAZ7woop3OTxWdPabIDX4JD3xRGN0KC6ws" \
   -e GOOGLE_URL="https://gemini.sora-ai.chat" \
   -e CUSTOM_MODELS="-gpt-4-32k,-gpt-4-0314,-gpt-4-0613,-gpt-4-32k-0314,-gpt-4-32k-0613,-gpt-4-turbo-priview,-gpt-3.5-turbo,-gpt-3.5-turbo-0310" \
   -d new-chat:v2


   curl -H 'Content-Type: application/json' -d '{"contents":[{"parts":[{"text":"你在吗"}]}]}' -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAZ7woop3OTxWdPabIDX4JD3xRGN0KC6ws
      curl -H 'Content-Type: application/json' -d '{"contents":[{"parts":[{"text":"你在吗"}]}]}' -X POST https://gemini.sora-ai.chat/v1beta/models/gemini-pro:generateContent?key=AIzaSyAZ7woop3OTxWdPabIDX4JD3xRGN0KC6ws