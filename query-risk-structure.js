import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function queryRiskStructure() {
  try {
    console.log('🔍 查詢風險登陸表結構...\n');
    
    // 查詢策略目標、子策略、風險類型的關係
    const result = await pool.query(`
      SELECT DISTINCT strategic_objective, sub_objective, risk_category 
      FROM risk_registry 
      ORDER BY strategic_objective, sub_objective, risk_category 
      LIMIT 20
    `);
    
    console.log('📊 策略目標、子策略、風險類型關係:');
    console.log('=====================================');
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.strategic_objective}`);
      console.log(`   └─ ${row.sub_objective}`);
      console.log(`      └─ ${row.risk_category}`);
      console.log('');
    });
    
    // 統計各風險類型的數量
    const categoryStats = await pool.query(`
      SELECT risk_category, COUNT(*) as count 
      FROM risk_registry 
      GROUP BY risk_category 
      ORDER BY count DESC
    `);
    
    console.log('📈 風險類型統計:');
    console.log('================');
    categoryStats.rows.forEach(row => {
      console.log(`${row.risk_category}: ${row.count} 項`);
    });
    
  } catch (error) {
    console.error('❌ 查詢錯誤:', error);
  } finally {
    await pool.end();
  }
}

queryRiskStructure(); 