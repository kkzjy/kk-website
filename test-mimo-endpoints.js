const axios = require('axios');
require('dotenv').config();

async function testMiMoEndpoints() {
    const apiKey = process.env.MIMO_API_KEY;
    
    if (!apiKey) {
        console.log('❌ 未配置MIMO_API_KEY');
        return;
    }
    
    const endpoints = [
        'https://api.mioffice.cn/v1/chat/completions',
        'https://api.xiaomi.com/mimo/v1/chat/completions',
        'https://mimo-api.xiaomi.com/v1/chat/completions'
    ];
    
    const testPayload = {
        model: 'mimo-v2-flash',
        messages: [
            {
                role: 'system',
                content: '你是一个AI助手'
            },
            {
                role: 'user',
                content: '你好'
            }
        ],
        max_tokens: 50
    };
    
    console.log('🧪 测试MiMo API端点...\n');
    
    for (const endpoint of endpoints) {
        console.log(`测试端点: ${endpoint}`);
        
        try {
            const response = await axios.post(endpoint, testPayload, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            console.log('✅ 成功！');
            console.log('响应:', response.data);
            console.log('');
            return;
            
        } catch (error) {
            console.log('❌ 失败:');
            if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
                console.log('  域名无法解析');
            } else if (error.code === 'ECONNREFUSED') {
                console.log('  连接被拒绝');
            } else if (error.code === 'ETIMEDOUT') {
                console.log('  连接超时');
            } else if (error.response) {
                console.log(`  HTTP ${error.response.status}: ${error.response.statusText}`);
                console.log('  响应数据:', error.response.data);
            } else {
                console.log(`  错误: ${error.message}`);
            }
            console.log('');
        }
    }
    
    console.log('所有端点测试完成');
}

testMiMoEndpoints();