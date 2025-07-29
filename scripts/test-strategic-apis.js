import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 開始測試策略相關 API...\n');

  try {
    // 1. 測試取得策略目標
    console.log('1️⃣ 測試 GET /api/strategic-objectives?year=2024');
    const strategicResponse = await fetch(`${BASE_URL}/api/strategic-objectives?year=2024`);
    const strategicData = await strategicResponse.json();
    console.log(`✅ 策略目標數量: ${strategicData.length}`);
    if (strategicData.length > 0) {
      console.log(`   範例: ${strategicData[0].name}`);
    }
    console.log('');

    // 2. 測試取得子策略目標
    if (strategicData.length > 0) {
      const firstStrategicId = strategicData[0].id;
      console.log(`2️⃣ 測試 GET /api/sub-strategic-objectives/${firstStrategicId}?year=2024`);
      const subResponse = await fetch(`${BASE_URL}/api/sub-strategic-objectives/${firstStrategicId}?year=2024`);
      const subData = await subResponse.json();
      console.log(`✅ 子策略目標數量: ${subData.length}`);
      if (subData.length > 0) {
        console.log(`   範例: ${subData[0].name}`);
      }
      console.log('');

      // 3. 測試取得風險類型
      console.log('3️⃣ 測試 GET /api/risk-categories?year=2024');
      const riskResponse = await fetch(`${BASE_URL}/api/risk-categories?year=2024`);
      const riskData = await riskResponse.json();
      console.log(`✅ 風險類型數量: ${riskData.length}`);
      if (riskData.length > 0) {
        console.log(`   範例: ${riskData[0].name}`);
      }
      console.log('');

      // 4. 測試取得連動關係
      if (subData.length > 0) {
        const firstSubId = subData[0].id;
        console.log(`4️⃣ 測試 GET /api/strategic-mappings/${firstStrategicId}/${firstSubId}?year=2024`);
        const mappingResponse = await fetch(`${BASE_URL}/api/strategic-mappings/${firstStrategicId}/${firstSubId}?year=2024`);
        const mappingData = await mappingResponse.json();
        console.log(`✅ 連動關係數量: ${mappingData.length}`);
        if (mappingData.length > 0) {
          console.log(`   對應風險類型: ${mappingData[0].riskCategoryName}`);
        }
        console.log('');
      }

      // 5. 測試取得所有連動關係
      console.log('5️⃣ 測試 GET /api/strategic-mappings?year=2024');
      const allMappingsResponse = await fetch(`${BASE_URL}/api/strategic-mappings?year=2024`);
      const allMappingsData = await allMappingsResponse.json();
      console.log(`✅ 總連動關係數量: ${allMappingsData.length}`);
      if (allMappingsData.length > 0) {
        console.log(`   範例: ${allMappingsData[0].strategicObjectiveName} -> ${allMappingsData[0].subStrategicObjectiveName} -> ${allMappingsData[0].riskCategoryName}`);
      }
      console.log('');
    }

    console.log('🎉 所有 API 測試完成！');

  } catch (error) {
    console.error('❌ API 測試失敗:', error.message);
    console.log('\n💡 請確認：');
    console.log('   1. 伺服器是否正在運行 (npm run dev)');
    console.log('   2. 伺服器是否在 http://localhost:3000');
    console.log('   3. 資料庫連線是否正常');
  }
}

testAPI(); 