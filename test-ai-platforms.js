const axios = require('axios');
require('dotenv').config();

async function testAIPlatforms() {
    const apiKey = process.env.MIMO_API_KEY;
    
    if (!apiKey) {
        console.log('❌ 未配置MIMO_API_KEY');
        return;
    }
    
    // 可能的AI平台端点
    const platforms = [
        {
            name: '小米MiMo (官方)',
            endpoint: 'https://api.mioffice.cn/v1/chat/completions',
            model: 'mimo-v2-flash'
        },
        {
            name: '小米MiMo (备用)',
            endpoint: 'https://api.xiaomi.com/ai/v1/chat/completions',
            model: 'mimo-v2-flash'
        },
        {
            name: '小米AI平台',
            endpoint: 'https://ai.xiaomi.com/v1/chat/completions',
            model: 'mimo-v2-flash'
        },
        {
            name: '小米大模型',
            endpoint: 'https://model.xiaomi.com/v1/chat/completions',
            model: 'mimo-v2-flash'
        }
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
    
    console.log('🧪 测试AI平台端点...\n');
    
    for (const platform of platforms) {
        console.log(`测试 ${platform.name}:`);
        console.log(`  端点: ${platform.endpoint}`);
        
        try {
            const response = await axios.post(platform.endpoint, testPayload, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            console.log('  ✅ 成功！');
            console.log('  响应:', response.data);
            console.log('');
            return;
            
        } catch (error) {
            console.log('  ❌ 失败:');
            if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
                console.log('    域名无法解析');
            } else if (error.response) {
                console.log(`    HTTP ${error.response.status}: ${error.response.statusText}`);
            } else {
                console.log(`    错误: ${error.message}`);
            }
            console.log('');
        }
    }
    
    console.log('所有平台测试完成');
    console.log('\n💡 建议:');
    console.log('1. 检查API密钥是否正确');
    console.log('2. 检查网络连接');
    console.log('3. 联系小米AI平台客服确认API端点');
    console.log('4. 考虑使用其他AI平台（如OpenAI、Claude等）');
}

testAIPlatforms();