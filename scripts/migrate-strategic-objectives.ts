import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { strategicObjectives, subStrategicObjectives, riskCategories } from "../shared/schema";
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { strategicObjectives, subStrategicObjectives, riskCategories } });

async function migrateStrategicObjectives() {
  try {
    console.log('🔄 開始建立策略目標相關資料表...');
    
    // 建立資料表的 SQL
    const createTablesSQL = `
      -- 企業策略及目標表
      CREATE TABLE IF NOT EXISTS strategic_objectives (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        leader TEXT NOT NULL,
        year INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- 子策略目標表
      CREATE TABLE IF NOT EXISTS sub_strategic_objectives (
        id SERIAL PRIMARY KEY,
        strategic_objective_id INTEGER NOT NULL REFERENCES strategic_objectives(id),
        name TEXT NOT NULL,
        year INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- 風險類型表
      CREATE TABLE IF NOT EXISTS risk_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        year INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await pool.query(createTablesSQL);
    console.log('✅ 資料表建立完成');

    // 匯入 2024 年的策略目標資料
    console.log('📥 匯入 2024 年策略目標資料...');
    
    const strategicObjectivesData = [
      { name: "永續發展ESG政策遵循", leader: "人力資源部 李英豪(FRANCE)", year: 2024 },
      { name: "Margin Margin Margin x Profit Profit Profit", leader: "採購資材群 吳宗庭(CHARLY)", year: 2024 },
      { name: "降低庫存水位", leader: "產品行銷處 陳志瑋(IBSEN)", year: 2024 },
      { name: "營收目標400億+拓展通路與市占率", leader: "採購資材群 吳宗庭(CHARLY)", year: 2024 },
      { name: "強化品牌價值(ADATA,XPG)", leader: "品牌行銷處 劉怡君(JENNIE)", year: 2024 },
      { name: "專注產品項目(SSD+DRAM+EV+XPG+IA)", leader: "產品研發群 戴子然(NICK)", year: 2024 },
      { name: "切入AI、生成式AI、AIOT、IOT、區塊鏈應用與碳權領域", leader: "產品研發群 戴子然(NICK)", year: 2024 },
      { name: "布局文化藝術", leader: "運彩處 林天瓊(TAINCHIUNG)", year: 2024 }
    ];

    for (const objective of strategicObjectivesData) {
      await db.insert(strategicObjectives).values(objective);
    }
    console.log('✅ 策略目標資料匯入完成');

    // 匯入風險類型資料
    console.log('📥 匯入風險類型資料...');
    
    const riskCategoriesData = [
      { name: "策略風險", description: "Strategic Risk", year: 2024 },
      { name: "營運風險", description: "Operational Risk", year: 2024 },
      { name: "財務風險", description: "Financial Risk", year: 2024 },
      { name: "新興風險", description: "Emerging Risk", year: 2024 }
    ];

    for (const category of riskCategoriesData) {
      await db.insert(riskCategories).values(category);
    }
    console.log('✅ 風險類型資料匯入完成');

    console.log('🎉 遷移完成！');
    
  } catch (error) {
    console.error('❌ 遷移失敗:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateStrategicObjectives(); 