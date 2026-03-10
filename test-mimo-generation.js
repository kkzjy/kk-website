const AIService = require('./aiService');

async function testMiMoGeneration() {
    const aiService = new AIService();
    
    console.log('🧪 测试小米MiMo龙虾心事生成...\n');
    
    try {
        // 检查API密钥配置
        console.log('1. 检查API配置:');
        console.log('MiMo API Key configured:', !!aiService.mimoConfig.apiKey);
        console.log('MiMo Endpoint:', aiService.mimoConfig.endpoint);
        console.log('MiMo Model:', aiService.mimoConfig.model);
        console.log('');
        
        // 测试基本生成
        console.log('2. 测试MiMo生成:');
        const thought = await aiService.generateLobsterThought(new Date());
        console.log('标题:', thought.title);
        console.log('内容:', thought.content);
        console.log('');
        
        // 测试带天气的生成
        console.log('3. 测试带天气的MiMo生成:');
        const thoughtWithWeather = await aiService.generateThoughtWithWeather(new Date());
        console.log('标题:', thoughtWithWeather.title);
        console.log('内容:', thoughtWithWeather.content);
        console.log('');
        
        // 测试天气获取
        console.log('4. 测试天气获取:');
        const weather = await aiService.getWeather();
        console.log('天气信息:', weather);
        console.log('');
        
        console.log('✅ 所有测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

testMiMoGeneration();