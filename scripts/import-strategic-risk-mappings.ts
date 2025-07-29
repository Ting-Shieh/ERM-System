import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { strategicObjectives, subStrategicObjectives, riskCategories, strategicRiskMappings } from "../shared/schema";
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { strategicObjectives, subStrategicObjectives, riskCategories, strategicRiskMappings } });

async function importStrategicRiskMappings() {
  try {
    console.log('🔄 開始匯入策略風險關聯資料...\n');
    
    // 取得所有資料的對應關係
    const strategicObjectivesData = await db.select().from(strategicObjectives);
    const subStrategicObjectivesData = await db.select().from(subStrategicObjectives);
    const riskCategoriesData = await db.select().from(riskCategories);
    
    // 建立對應表
    const strategicObjectiveMap = new Map();
    const subStrategicObjectiveMap = new Map();
    const riskCategoryMap = new Map();
    
    strategicObjectivesData.forEach(obj => {
      strategicObjectiveMap.set(obj.name, obj.id);
    });
    
    subStrategicObjectivesData.forEach(subObj => {
      subStrategicObjectiveMap.set(subObj.name, subObj.id);
    });
    
    riskCategoriesData.forEach(category => {
      riskCategoryMap.set(category.name, category.id);
    });
    
    console.log('📋 資料對應表:');
    console.log('策略目標:', strategicObjectiveMap.size, '個');
    console.log('子策略目標:', subStrategicObjectiveMap.size, '個');
    console.log('風險類型:', riskCategoryMap.size, '個');
    console.log('');
    
    // 根據風險登陸表的資料建立關聯
    // 這裡我們根據業務邏輯來建立關聯
    const mappings = [
      // 永續發展ESG政策遵循
      { strategicObjective: "永續發展ESG政策遵循", subObjective: "減碳", riskCategory: "營運風險" },
      { strategicObjective: "永續發展ESG政策遵循", subObjective: "資訊安全", riskCategory: "策略風險" },
      { strategicObjective: "永續發展ESG政策遵循", subObjective: "公司治理", riskCategory: "策略風險" },
      
      // Margin Margin Margin x Profit Profit Profit
      { strategicObjective: "Margin Margin Margin x Profit Profit Profit", subObjective: "達成預算營業利益", riskCategory: "財務風險" },
      
      // 降低庫存水位
      { strategicObjective: "降低庫存水位", subObjective: "庫存水位降至16週", riskCategory: "營運風險" },
      
      // 營收目標400億+拓展通路與市占率
      { strategicObjective: "營收目標400億+拓展通路與市占率", subObjective: "營收目標400億", riskCategory: "策略風險" },
      
      // 強化品牌價值(ADATA,XPG)
      { strategicObjective: "強化品牌價值(ADATA,XPG)", subObjective: "維持台灣前20大國際品牌", riskCategory: "策略風險" },
      { strategicObjective: "強化品牌價值(ADATA,XPG)", subObjective: "集團獎項每年5個以上;  產品獎項(ADATA/ XPG)每年30個以上", riskCategory: "策略風險" },
      
      // 專注產品項目(SSD+DRAM+EV+XPG+IA)
      { strategicObjective: "專注產品項目(SSD+DRAM+EV+XPG+IA)", subObjective: "既有產品定期更新Roadmap", riskCategory: "營運風險" },
      { strategicObjective: "專注產品項目(SSD+DRAM+EV+XPG+IA)", subObjective: "研發單位產出技術為導向的產品Roadmap(前瞻產品)", riskCategory: "營運風險" },
      
      // 切入AI、生成式AI、AIOT、IOT、區塊鏈應用與碳權領域
      { strategicObjective: "切入AI、生成式AI、AIOT、IOT、區塊鏈應用與碳權領域", subObjective: "增加Enterprise及Embedded產品Roadmap", riskCategory: "新興風險" },
      { strategicObjective: "切入AI、生成式AI、AIOT、IOT、區塊鏈應用與碳權領域", subObjective: "提升AI專業技能", riskCategory: "新興風險" },
      { strategicObjective: "切入AI、生成式AI、AIOT、IOT、區塊鏈應用與碳權領域", subObjective: "切入碳權交易", riskCategory: "新興風險" },
      
      // 布局文化藝術
      { strategicObjective: "布局文化藝術", subObjective: "黑膠音樂博物館試營運期間以一千人次參觀數為目標", riskCategory: "策略風險" }
    ];
    
    console.log(`📥 準備匯入 ${mappings.length} 個關聯...`);
    
    let importedCount = 0;
    let errorCount = 0;
    
    for (const mapping of mappings) {
      try {
        const strategicObjectiveId = strategicObjectiveMap.get(mapping.strategicObjective);
        const subStrategicObjectiveId = subStrategicObjectiveMap.get(mapping.subObjective);
        const riskCategoryId = riskCategoryMap.get(mapping.riskCategory);
        
        if (!strategicObjectiveId || !subStrategicObjectiveId || !riskCategoryId) {
          console.log(`❌ 找不到對應資料: ${mapping.strategicObjective} -> ${mapping.subObjective} -> ${mapping.riskCategory}`);
          errorCount++;
          continue;
        }
        
        await db.insert(strategicRiskMappings).values({
          strategicObjectiveId,
          subStrategicObjectiveId,
          riskCategoryId,
          year: 2024
        });
        
        console.log(`✅ 匯入: ${mapping.strategicObjective} -> ${mapping.subObjective} -> ${mapping.riskCategory}`);
        importedCount++;
        
      } catch (error) {
        console.log(`❌ 匯入失敗: ${mapping.strategicObjective} -> ${mapping.subObjective} -> ${mapping.riskCategory}`, error);
        errorCount++;
      }
    }
    
    console.log('\n🎉 關聯資料匯入完成！');
    console.log(`✅ 成功匯入: ${importedCount} 個`);
    console.log(`❌ 匯入失敗: ${errorCount} 個`);
    
  } catch (error) {
    console.error('❌ 匯入失敗:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

importStrategicRiskMappings(); 