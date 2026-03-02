#!/bin/bash

# kk哥的个人博客测试脚本

echo "🧪 开始测试kk哥的个人博客..."

# 检查服务器是否在运行
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 服务器正在运行"
else
    echo "❌ 服务器未运行，正在启动..."
    node server.js &
    sleep 3
fi

# 测试主页
echo "📝 测试主页..."
if curl -s http://localhost:3000 | grep -q "kk哥的博客"; then
    echo "✅ 主页加载成功"
else
    echo "❌ 主页加载失败"
fi

# 测试API接口
echo "📝 测试API接口..."
if curl -s http://localhost:3000/api/guestbook > /dev/null; then
    echo "✅ 留言板API正常"
else
    echo "❌ 留言板API异常"
fi

# 测试健康检查
echo "📝 测试健康检查..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ 健康检查正常"
else
    echo "❌ 健康检查异常"
fi

echo ""
echo "🎉 测试完成！"
echo "🌐 访问地址：http://localhost:3000"
echo "📊 查看日志：tail -f /tmp/kk-website.log"