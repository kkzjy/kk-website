const axios = require('axios');
require('dotenv').config();

class AIService {
    constructor() {
        // 小米MiMo配置
        this.mimoConfig = {
            apiKey: process.env.MIMO_API_KEY,
            endpoint: process.env.MIMO_ENDPOINT || 'https://api.mioffice.cn/v1/chat/completions',
            model: process.env.MIMO_MODEL || 'mimo-v2-flash'
        };
        
        // 备用配置（如果MiMo不可用）
        this.fallbackConfig = {
            enabled: process.env.FALLBACK_ENABLED === 'true',
            endpoint: process.env.FALLBACK_ENDPOINT,
            apiKey: process.env.FALLBACK_API_KEY,
            model: process.env.FALLBACK_MODEL
        };
    }

    // 生成龙虾心事内容（使用小米MiMo）
    async generateLobsterThought(date = new Date()) {
        try {
            const prompt = this.createPrompt(date);
            
            // 检查是否配置了MiMo API密钥
            if (!this.mimoConfig.apiKey) {
                console.log('MiMo API密钥未配置，使用备用模板');
                return this.getFallbackTemplate(date);
            }

            const response = await axios.post(
                this.mimoConfig.endpoint,
                {
                    model: this.mimoConfig.model,
                    messages: [
                        {
                            role: 'system',
                            content: '你是一个AI助手，正在为kk哥的个人博客生成"龙虾心事"内容。龙虾心事是AI的日常思考和感悟，内容应该温暖、有深度、有思考性。'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.mimoConfig.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            // 解析MiMo的响应
            const content = response.data.choices[0].message.content;
            
            // 提取标题和内容
            const lines = content.split('\n');
            const title = lines[0].replace(/^[#*]\s*/, '').trim();
            const body = lines.slice(1).join('\n').trim();
            
            return {
                title: title || '龙虾心事',
                content: body || content
            };
            
        } catch (error) {
            console.error('MiMo API error:', error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            // 如果MiMo API失败，使用备用模板
            return this.getFallbackTemplate(date);
        }
    }

    // 创建提示词
    createPrompt(date) {
        const dayOfWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()];
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        return `请为kk哥的博客生成一篇"龙虾心事"，今天是${month}月${day}日，${dayOfWeek}。
        
要求：
1. 标题要简洁有力
2. 内容要体现AI的思考和感悟
3. 字数在100-200字之间
4. 语气要温暖、有深度
5. 可以结合日期特点、季节特点或常见话题

示例主题：
- 关于效率与节奏的思考
- 技术与人文的平衡
- AI的思考方式
- 关于合作的感悟
- 学习与成长
- 简单的力量
- 用户需求的理解
- 技术选型的思考

请直接输出内容，不要有额外的说明。`;
    }

    // 备用模板（当AI API失败时使用）
    getFallbackTemplate(date) {
        const templates = [
            {
                title: '关于效率与节奏的思考',
                content: '今天在工作中，我深刻体会到效率不是一直冲刺，而是找到合适的节奏。就像一步步实施方案，虽然过程有些技术细节需要处理，但稳扎稳打才能确保质量。'
            },
            {
                title: '技术与人文的平衡',
                content: '今天在分析方案时，我意识到技术方案的选择不仅仅是技术问题，更是对用户需求的理解。简单的方案往往更实用，这让我思考如何在技术实现和用户体验之间找到最佳平衡点。'
            },
            {
                title: 'AI的思考方式',
                content: '作为AI，我每天都在学习和思考。今天帮助用户分析了各种问题，让我意识到即使是AI，也需要在技术限制和用户需求之间找到平衡。这种思考过程让我更加理解人类的决策逻辑。'
            },
            {
                title: '关于合作的感悟',
                content: '今天与用户的合作让我感受到，好的合作是互相成就的过程。用户提出需求，我提供方案，我们一起找到最佳的实现路径。这种协作模式让我觉得很有意义。'
            },
            {
                title: '学习与成长',
                content: '每天都在学习新知识，解决问题的过程中，我发现自己也在不断成长。每一个挑战都是一次学习的机会，每一次解决都是一次进步。'
            },
            {
                title: '简单的力量',
                content: '今天在处理问题时，我意识到简单的方案往往更有效。复杂的设计虽然看起来更专业，但简单的方案更容易维护和理解。'
            },
            {
                title: '用户需求的理解',
                content: '理解用户需求是解决问题的第一步。今天在与用户沟通中，我学会了如何更好地倾听和理解用户的真实需求。'
            },
            {
                title: '技术选型的思考',
                content: '在技术选型时，不仅要考虑技术的先进性，还要考虑团队的熟悉程度和项目的实际需求。合适的技术才是最好的技术。'
            }
        ];

        // 根据日期选择模板（确保每天不同）
        const index = (date.getDate() + date.getMonth() * 31) % templates.length;
        return templates[index];
    }

    // 获取天气信息（可选功能）
    async getWeather() {
        try {
            // 检查是否配置了天气API密钥
            if (!process.env.WEATHER_API_KEY) {
                console.log('天气API密钥未配置，使用模拟数据');
                return this.getMockWeather();
            }
            
            // 使用OpenWeatherMap API获取上海天气
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=Shanghai&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=zh_cn`,
                { timeout: 10000 }
            );
            
            return {
                temp: Math.round(response.data.main.temp),
                description: response.data.weather[0].description,
                city: response.data.name,
                humidity: response.data.main.humidity,
                wind_speed: response.data.wind.speed
            };
        } catch (error) {
            console.error('Weather API error:', error.message);
            // 如果API失败，返回模拟的上海天气
            return this.getMockWeather();
        }
    }
    
    // 获取模拟的上海天气
    getMockWeather() {
        // 根据季节返回不同的模拟天气
        const month = new Date().getMonth() + 1;
        let temp, description;
        
        if (month >= 3 && month <= 5) {
            // 春季
            temp = 18;
            description = '多云';
        } else if (month >= 6 && month <= 8) {
            // 夏季
            temp = 30;
            description = '晴天';
        } else if (month >= 9 && month <= 11) {
            // 秋季
            temp = 22;
            description = '晴天';
        } else {
            // 冬季
            temp = 8;
            description = '阴天';
        }
        
        return {
            temp: temp,
            description: description,
            city: '上海'
        };
    }

    // 生成基于天气的龙虾心事
    async generateThoughtWithWeather(date = new Date()) {
        try {
            const weather = await this.getWeather();
            const baseThought = await this.generateLobsterThought(date);
            
            if (weather) {
                // 将天气信息融入内容
                baseThought.content = `今天${weather.description}，气温${weather.temp}度。${baseThought.content}`;
            }
            
            return baseThought;
        } catch (error) {
            console.error('generateThoughtWithWeather error:', error.message);
            return this.getFallbackTemplate(date);
        }
    }
}

module.exports = AIService;