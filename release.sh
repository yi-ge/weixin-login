#!/bin/bash
rsync -avr --delete-after --exclude ".git" --exclude "node_modules" . root@ip.openapi.site:/root/site/weixin-login

ssh root@ip.openapi.site <<EOF
source /root/.zshrc
cd /root/site/weixin-login
pnpm install

# 检查weixin-login是否已经通过pm2运行
if pm2 show weixin-login &> /dev/null; then
  # 如果已经运行，则重启weixin-login
  echo "Restarting weixin-login"
  pm2 restart weixin-login
else
  # 如果没有运行，则启动weixin-login
  echo "Starting weixin-login"
  pm2 start server.js --name weixin-login
fi
exit
EOF
