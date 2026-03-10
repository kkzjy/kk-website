# AI集成龙虾心事生成系统

## 🎯 功能概述

本系统集成了AI API，可以动态生成龙虾心事内容，支持：
1. **AI智能生成**：使用小米MiMo API生成个性化内容
2. **动态模板**：根据日期、天气等信息生成相关内容
3. **备用机制**：AI API失败时自动使用备用模板
4. **天气集成**：可选的天气信息融入生成内容

## 📁 文件结构

```
kk-website-git/
├── server.js              # 主服务器文件（已更新）
├── aiService.js           # AI服务模块
├── .env                   # 环境配置文件
├── test-ai-generation.js  # AI生成测试脚本
└── AI集成说明.md          # 本说明文档
```

## 🔧 配置步骤

### 1. 设置API密钥

编辑 `.env` 文件，填入你的API密钥：

```env
# Xiaomi MiMo API Configuration
MIMO_API_KEY=your_xiaomi_mimo_api_key_here
MIMO_ENDPOINT=https://api.mioffice.cn/v1/chat/completions
MIMO_MODEL=mimo-v2-flash

# Fallback Configuration (备用API配置)
FALLBACK_ENABLED=true
FALLBACK_ENDPOINT=
FALLBACK_API_KEY=
FALLBACK_MODEL=

# Weather API Configuration (可选)
WEATHER_API_KEY=your_weather_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=production
```

### 2. 获取API密钥

- **小米MiMo**: https://api.mioffice.cn/ (需要申请API密钥)
- **天气API**: https://openweathermap.org/api (可选)

### 3. 重启服务器

```bash
cd /root/.openclaw/workspace/kk-website-git
pkill -f "node server.js"
nohup node server.js > server.log 2>&1 &
```

## 🚀 API接口

### 生成龙虾心事
```
POST /api/lobster-posts/generate
```
- 使用AI生成当天的龙虾心事
- 每天只能生成一次
- 自动融入天气信息（如果配置了天气API）

### 获取天气信息
```
GET /api/weather
```
- 返回当前天气信息
- 用于龙虾心事生成的上下文

### 获取龙虾心事统计
```
GET /api/lobster-posts/stats
```
- 返回龙虾心事总数、日期范围等统计信息

## 🧪 测试AI生成

运行测试脚本：
```bash
cd /root/.openclaw/workspace/kk-website-git
node test-ai-generation.js
```

## 📊 工作原理

### AI生成流程
1. **检查今日是否已生成**：避免重复生成
2. **创建提示词**：根据日期、天气等信息创建AI提示
3. **调用AI API**：使用OpenAI生成内容
4. **备用机制**：如果AI失败，使用预定义模板
5. **保存到数据库**：将生成的内容保存到SQLite

### 动态模板系统
- **日期感知**：根据星期几、月份等调整内容
- **天气融入**：如果配置了天气API，会融入天气信息
- **主题多样性**：8个不同的主题模板作为备用

## 🔍 监控和调试

### 查看服务器日志
```bash
tail -f /root/.openclaw/workspace/kk-website-git/server.log
```

### 查看AI生成日志
```bash
# 在server.log中查找AI相关日志
grep "AI" /root/.openclaw/workspace/kk-website-git/server.log
```

### 测试API接口
```bash
# 测试生成接口
curl -X POST http://localhost:3000/api/lobster-posts/generate

# 测试天气接口
curl http://localhost:3000/api/weather

# 测试统计接口
curl http://localhost:3000/api/lobster-posts/stats
```

## ⚠️ 注意事项

1. **API密钥安全**：不要将API密钥提交到公共仓库
2. **费用控制**：OpenAI API按使用量收费，注意控制成本
3. **错误处理**：系统会自动处理API失败情况
4. **性能考虑**：AI生成可能需要几秒钟时间

## 🔄 定时任务

Cron作业会在每天22:00自动运行：
```bash
0 22 * * * curl -X POST http://localhost:3000/api/lobster-posts/generate >> /tmp/lobster-cron.log 2>&1
```

## 🔧 小米MiMo配置说明

### API端点
- **生产环境**: `https://api.mioffice.cn/v1/chat/completions`
- **测试环境**: `https://api.mioffice.cn/v1/chat/completions` (相同)

### 支持的模型
- `mimo-v2-flash`: 闪速模型，响应快
- `mimo-v2-pro`: 专业模型，质量更高
- `mimo-v2-ultra`: 超大模型，最佳质量

### 请求格式
```json
{
  "model": "mimo-v2-flash",
  "messages": [
    {
      "role": "system",
      "content": "系统提示词"
    },
    {
      "role": "user",
      "content": "用户提示词"
    }
  ],
  "max_tokens": 300,
  "temperature": 0.7
}
```

### 响应格式
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

## 📈 扩展功能

### 添加更多AI模型
在 `aiService.js` 中添加新的AI模型支持：

```javascript
// 添加Claude支持
async generateWithClaude(prompt) {
    // Claude API调用逻辑
}

// 添加本地模型支持
async generateWithLocalModel(prompt) {
    // 本地模型调用逻辑
}
```

### 自定义提示词
修改 `createPrompt()` 方法来自定义AI提示词：

```javascript
createPrompt(date) {
    // 自定义提示词逻辑
    return `自定义提示词内容...`;
}
```

### 集成更多数据源
在 `aiService.js` 中添加更多数据源：

```javascript
// 集成新闻API
async getNews() {
    // 获取新闻信息
}

// 集成股票API
async getStockPrice() {
    // 获取股票信息
}
```

## 🆘 故障排除

### 问题：AI生成失败
**解决方案**：
1. 检查API密钥是否正确
2. 检查网络连接
3. 查看服务器日志中的错误信息

### 问题：天气API失败
**解决方案**：
1. 检查天气API密钥
2. 天气API是可选功能，不影响主要功能

### 问题：Cron作业不工作
**解决方案**：
1. 检查cron服务是否运行：`systemctl status crond`
2. 检查cron日志：`cat /tmp/lobster-cron.log`

## 📞 支持

如有问题，请检查：
1. 服务器日志：`/root/.openclaw/workspace/kk-website-git/server.log`
2. Cron日志：`/tmp/lobster-cron.log`
3. API响应：直接调用API接口查看返回信息