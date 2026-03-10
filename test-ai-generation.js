const AIService = require('./aiService');

async function testAIGeneration() {
    const aiService = new AIService();
    
    console.log('🧪 测试AI龙虾心事生成...\n');
    
    try {
        // 测试基本生成
        console.log('1. 测试基本AI生成:');
        const thought = await aiService.generateLobsterThought(new Date());
        console.log('标题:', thought.title);
        console.log('内容:', thought.content);
        console.log('');
        
        // 测试带天气的生成
        console.log('2. 测试带天气的AI生成:');
        const thoughtWithWeather = await aiService.generateThoughtWithWeather(new Date());
        console.log('标题:', thoughtWithWeather.title);
        console.log('内容:', thoughtWithWeather.content);
        console.log('');
        
        // 测试天气获取
        console.log('3. 测试天气获取:');
        const weather = await aiService.getWeather();
        console.log('天气信息:', weather);
        console.log('');
        
        console.log('✅ 所有测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

testAIGeneration();