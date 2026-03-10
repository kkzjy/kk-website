# 小米MiMo API使用指南

## 📋 概述

本系统已集成小米MiMo API，用于生成龙虾心事内容。如果未配置API密钥，系统会自动使用备用模板。

## 🔑 获取API密钥

### 1. 访问小米AI开放平台
- 网址：https://api.mioffice.cn/
- 注册账号并登录

### 2. 申请API密钥
- 进入控制台
- 创建应用
- 获取API密钥

### 3. 配置环境变量
编辑 `.env` 文件：
```env
MIMO_API_KEY=你的API密钥
```

## 🚀 API端点

### 生产环境
```
https://api.mioffice.cn/v1/chat/completions
```

### 支持的模型
- `mimo-v2-flash`: 闪速模型，响应快
- `mimo-v2-pro`: 专业模型，质量更高
- `mimo-v2-ultra`: 超大模型，最佳质量

## 📝 请求格式

```json
{
  "model": "mimo-v2-flash",
  "messages": [
    {
      "role": "system",
      "content": "你是一个AI助手，正在为kk哥的个人博客生成'龙虾心事'内容。"
    },
    {
      "role": "user",
      "content": "请为kk哥的博客生成一篇'龙虾心事'..."
    }
  ],
  "max_tokens": 300,
  "temperature": 0.7
}
```

## 🔍 响应格式

```json
{
  "choices": [
    {
      "message": {
        "content": "生成的文本内容"
      }
    }
  ]
}
```

## 🧪 测试MiMo集成

### 1. 配置API密钥
```bash
cd /root/.openclaw/workspace/kk-website-git
# 编辑 .env 文件，填入你的MiMo API密钥
```

### 2. 运行测试脚本
```bash
node test-mimo-generation.js
```

### 3. 手动测试API
```bash
# 测试生成接口（如果今天未生成过）
curl -X POST http://localhost:3000/api/lobster-posts/generate

# 测试天气接口
curl http://localhost:3000/api/weather

# 测试统计接口
curl http://localhost:3000/api/lobster-posts/stats
```

## ⚠️ 注意事项

### 1. API密钥安全
- 不要将API密钥提交到公共仓库
- 建议使用环境变量管理密钥

### 2. 费用控制
- MiMo API按使用量收费
- 注意控制生成频率
- 系统每天只生成一次龙虾心事

### 3. 错误处理
- 如果MiMo API失败，系统会自动使用备用模板
- 查看服务器日志了解详细错误信息

### 4. 性能考虑
- AI生成可能需要几秒钟时间
- 建议在后台异步生成

## 🔧 故障排除

### 问题：MiMo API返回错误
**解决方案**：
1. 检查API密钥是否正确
2. 检查网络连接
3. 查看服务器日志中的错误信息

### 问题：生成内容不符合预期
**解决方案**：
1. 调整提示词（修改 `createPrompt()` 方法）
2. 调整temperature参数（0.7是默认值）
3. 检查模型选择

### 问题：备用模板总是被使用
**解决方案**：
1. 检查API密钥是否配置
2. 检查网络连接
3. 查看服务器日志中的MiMo API错误

## 📊 监控和调试

### 查看服务器日志
```bash
tail -f /root/.openclaw/workspace/kk-website-git/server.log
```

### 查看MiMo API调用
```bash
grep "MiMo" /root/.openclaw/workspace/kk-website-git/server.log
```

### 查看生成的龙虾心事
```bash
curl http://localhost:3000/api/lobster-posts
```

## 🔄 定时任务

Cron作业会在每天22:00自动运行：
```bash
0 22 * * * curl -X POST http://localhost:3000/api/lobster-posts/generate >> /tmp/lobster-cron.log 2>&1
```

## 📞 支持

如有问题，请检查：
1. 服务器日志：`/root/.openclaw/workspace/kk-website-git/server.log`
2. Cron日志：`/tmp/lobster-cron.log`
3. API响应：直接调用API接口查看返回信息
4. 小米AI开放平台文档：https://api.mioffice.cn/