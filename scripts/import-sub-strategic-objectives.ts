import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { strategicObjectives, subStrategicObjectives } from "../shared/schema";
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { strategicObjectives, subStrategicObjectives } });

async function importSubStrategicObjectives() {
  try {
    console.log('🔄 開始匯入子策略目標資料...\n');
    
    // 先取得所有策略目標的 ID 對應
    const strategicObjectivesData = await db.select().from(strategicObjectives);
    const strategicObjectiveMap = new Map();
    
    strategicObjectivesData.forEach(obj => {
      strategicObjectiveMap.set(obj.name, obj.id);
    });
    
    console.log('📋 策略目標對應表:');
    strategicObjectiveMap.forEach((id, name) => {
      console.log(`  ${name} -> ID: ${id}`);
    });
    
    console.log('\n');
    
    // 子策略目標資料（根據 CSV 檔案）
    const subStrategicObjectivesData = [
      // 永續發展ESG政策遵循
      { strategicObjectiveName: "永續發展ESG政策遵循", name: "減碳", year: 2024 },
      { strategicObjectiveName: "永續發展ESG政策遵循", name: "資訊安全", year: 2024 },
      { strategicObjectiveName: "永續發展ESG政策遵循", name: "公司治理", year: 2024 },
      
      // Margin Margin Margin x Profit Profit Profit
      { strategicObjectiveName: "Margin Margin Margin x Profit Profit Profit", name: "達成預算營業利益", year: 2024 },
      
      // 降低庫存水位
      { strategicObjectiveName: "降低庫存水位", name: "庫存水位降至16週", year: 2024 },
      
      // 營收目標400億+拓展通路與市占率
      { strategicObjectiveName: "營收目標400億+拓展通路與市占率", name: "營收目標400億", year: 2024 },
      
      // 強化品牌價值(ADATA,XPG)
      { strategicObjectiveName: "強化品牌價值(ADATA,XPG)", name: "維持台灣前20大國際品牌", year: 2024 },
      { strategicObjectiveName: "強化品牌價值(ADATA,XPG)", name: "集團獎項每年5個以上;  產品獎項(ADATA/ XPG)每年30個以上", year: 2024 },
      
      // 專注產品項目(SSD+DRAM+EV+XPG+IA)
      { strategicObjectiveName: "專注產品項目(SSD+DRAM+EV+XPG+IA)", name: "既有產品定期更新Roadmap", year: 2024 },
      { strategicObjectiveName: "專注產品項目(SSD+DRAM+EV+XPG+IA)", name: "研發單位產出技術為導向的產品Roadmap(前瞻產品)", year: 2024 },
      
      // 切入AI、生成式AI、AIOT、IOT、區塊鏈應用與碳權領域
      { strategicObjectiveName: "切入AI、生成式AI、AIOT、IOT、區塊鏈應用與碳權領域", name: "增加Enterprise及Embedded產品Roadmap", year: 2024 },
      { strategicObjectiveName: "切入AI、生成式AI、AIOT、IOT、區塊鏈應用與碳權領域", name: "提升AI專業技能", year: 2024 },
      { strategicObjectiveName: "切入AI、生成式AI、AIOT、IOT、區塊鏈應用與碳權領域", name: "切入碳權交易", year: 2024 },
      
      // 布局文化藝術
      { strategicObjectiveName: "布局文化藝術", name: "黑膠音樂博物館試營運期間以一千人次參觀數為目標", year: 2024 }
    ];
    
    console.log(`📥 準備匯入 ${subStrategicObjectivesData.length} 個子策略目標...`);
    
    let importedCount = 0;
    let errorCount = 0;
    
    for (const subObj of subStrategicObjectivesData) {
      try {
        const strategicObjectiveId = strategicObjectiveMap.get(subObj.strategicObjectiveName);
        
        if (!strategicObjectiveId) {
          console.log(`❌ 找不到策略目標: ${subObj.strategicObjectiveName}`);
          errorCount++;
          continue;
        }
        
        await db.insert(subStrategicObjectives).values({
          strategicObjectiveId,
          name: subObj.name,
          year: subObj.year
        });
        
        console.log(`✅ 匯入: ${subObj.strategicObjectiveName} -> ${subObj.name}`);
        importedCount++;
        
      } catch (error) {
        console.log(`❌ 匯入失敗: ${subObj.strategicObjectiveName} -> ${subObj.name}`, error);
        errorCount++;
      }
    }
    
    console.log('\n🎉 匯入完成！');
    console.log(`✅ 成功匯入: ${importedCount} 個`);
    console.log(`❌ 匯入失敗: ${errorCount} 個`);
    
  } catch (error) {
    console.error('❌ 匯入失敗:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

importSubStrategicObjectives(); 