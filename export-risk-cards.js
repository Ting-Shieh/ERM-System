import { Pool } from '@neondatabase/serverless';
import fs from 'fs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function exportRiskCardsToCSV() {
  try {
    const query = `
      SELECT 
        id as "風險ID",
        strategic_objective as "戰略目標",
        sub_objective as "子目標", 
        responsible_department as "主責部門",
        risk_owner as "風險擁有者",
        operational_target as "營運目標",
        risk_category as "風險類別",
        risk_scenario as "風險情境",
        existing_measures as "現有控制措施",
        COALESCE(warning_indicator, '') as "警戒指標",
        COALESCE(action_indicator, '') as "行動指標",
        stakeholders as "關係方",
        COALESCE(unit_possibility, '') as "各單位可能性",
        COALESCE(unit_impact, '') as "各單位影響度",
        COALESCE(unit_risk_level, '') as "各單位風險等級",
        COALESCE(responsible_possibility, '') as "主責單位可能性",
        COALESCE(responsible_impact, '') as "主責單位影響度",
        COALESCE(responsible_risk_level, '') as "主責單位風險等級",
        COALESCE(response_strategy, '') as "回應策略",
        COALESCE(new_risk_measures, '') as "新增對策",
        COALESCE(optimization_suggestion, '') as "優化建議",
        weighted_risk_level as "加權風險等級",
        COALESCE(assessment_optimization, '') as "評估優化"
      FROM risk_registry 
      ORDER BY id
    `;

    const result = await pool.query(query);
    const rows = result.rows;

    // Create CSV header
    const headers = Object.keys(rows[0]);
    let csvContent = headers.join(',') + '\n';

    // Add data rows
    rows.forEach(row => {
      const csvRow = headers.map(header => {
        let value = row[header];
        if (value === null || value === undefined) {
          value = '';
        } else {
          value = String(value);
        }
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      });
      csvContent += csvRow.join(',') + '\n';
    });

    // Write to file
    fs.writeFileSync('Registry_Risk_Assessment_Cards_Complete.csv', csvContent, 'utf8');
    console.log(`✅ 成功匯出 ${rows.length} 項風險記錄到 Registry_Risk_Assessment_Cards_Complete.csv`);
    
    // Print summary
    console.log('\n📊 風險卡片統計摘要:');
    const categoryCount = {};
    const riskLevelCount = { high: 0, medium: 0, low: 0 };
    
    rows.forEach(row => {
      const category = row['風險類別'];
      categoryCount[category] = (categoryCount[category] || 0) + 1;
      
      const riskLevel = parseFloat(row['加權風險等級']) || 0;
      if (riskLevel >= 9) riskLevelCount.high++;
      else if (riskLevel >= 6) riskLevelCount.medium++;
      else riskLevelCount.low++;
    });
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`- ${category}: ${count}項`);
    });
    
    console.log(`\n🎯 風險等級分布:`);
    console.log(`- 高風險 (9+): ${riskLevelCount.high}項`);
    console.log(`- 中風險 (6-8): ${riskLevelCount.medium}項`);
    console.log(`- 低風險 (1-5): ${riskLevelCount.low}項`);

  } catch (error) {
    console.error('❌ 匯出失敗:', error);
  } finally {
    await pool.end();
  }
}

exportRiskCardsToCSV();