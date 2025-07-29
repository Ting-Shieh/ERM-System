import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { strategicRiskMappings } from "../shared/schema";
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { strategicRiskMappings } });

async function createStrategicRiskMappings() {
  try {
    console.log('🔄 建立策略風險關聯表...');
    
    // 建立關聯表的 SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS strategic_risk_mappings (
        id SERIAL PRIMARY KEY,
        strategic_objective_id INTEGER NOT NULL REFERENCES strategic_objectives(id),
        sub_strategic_objective_id INTEGER NOT NULL REFERENCES sub_strategic_objectives(id),
        risk_category_id INTEGER NOT NULL REFERENCES risk_categories(id),
        year INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await pool.query(createTableSQL);
    console.log('✅ 關聯表建立完成');
    
  } catch (error) {
    console.error('❌ 建立失敗:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createStrategicRiskMappings(); 