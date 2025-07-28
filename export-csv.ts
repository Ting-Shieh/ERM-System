import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./shared/schema.js";
import fs from 'fs';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function exportRiskCardsToCSV() {
  try {
    console.log('🔄 開始匯出風險卡片資料...');
    
    // Get all risk registry records
    const riskCards = await db.select().from(schema.riskRegistry).orderBy(schema.riskRegistry.id);
    
    console.log(`📋 找到 ${riskCards.length} 項風險記錄`);
    
    // CSV headers
    const headers = [
      '風險ID', '戰略目標', '子目標', '主責部門', '風險擁有者', '營運目標',
      '風險類別', '風險情境', '現有控制措施', '警戒指標', '行動指標', '關係方',
      '各單位可能性', '各單位影響度', '各單位風險等級', 
      '主責單位可能性', '主責單位影響度', '主責單位風險等級',
      '回應策略', '新增對策', '優化建議', '加權風險等級', '評估優化'
    ];
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    riskCards.forEach(card => {
      const row = [
        card.id,
        `"${(card.strategicObjective || '').replace(/"/g, '""')}"`,
        `"${(card.subObjective || '').replace(/"/g, '""')}"`,
        `"${(card.responsibleDepartment || '').replace(/"/g, '""')}"`,
        `"${(card.riskOwner || '').replace(/"/g, '""')}"`,
        `"${(card.operationalTarget || '').replace(/"/g, '""')}"`,
        `"${(card.riskCategory || '').replace(/"/g, '""')}"`,
        `"${(card.riskScenario || '').replace(/"/g, '""')}"`,
        `"${(card.existingMeasures || '').replace(/"/g, '""')}"`,
        `"${(card.warningIndicator || '').replace(/"/g, '""')}"`,
        `"${(card.actionIndicator || '').replace(/"/g, '""')}"`,
        `"${(card.stakeholders || '').replace(/"/g, '""')}"`,
        card.unitPossibility || '',
        card.unitImpact || '',
        card.unitRiskLevel || '',
        card.responsiblePossibility || '',
        card.responsibleImpact || '',
        card.responsibleRiskLevel || '',
        `"${(card.responseStrategy || '').replace(/"/g, '""')}"`,
        `"${(card.newRiskMeasures || '').replace(/"/g, '""')}"`,
        `"${(card.optimizationSuggestion || '').replace(/"/g, '""')}"`,
        card.weightedRiskLevel || '',
        `"${(card.assessmentOptimization || '').replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });
    
    // Add UTF-8 BOM for proper Chinese character display in Excel
    const csvWithBOM = '\uFEFF' + csvContent;
    
    // Write to file
    fs.writeFileSync('Registry_Risk_Assessment_Cards_Complete.csv', csvWithBOM, 'utf8');
    
    console.log('✅ 成功匯出 CSV 檔案：Registry_Risk_Assessment_Cards_Complete.csv');
    
    // Statistics
    const categoryStats = {};
    const riskLevelStats = { high: 0, medium: 0, low: 0 };
    
    riskCards.forEach(card => {
      const category = card.riskCategory || '未分類';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
      
      const weightedLevel = parseFloat(card.weightedRiskLevel || '0');
      if (weightedLevel >= 9) riskLevelStats.high++;
      else if (weightedLevel >= 6) riskLevelStats.medium++;
      else riskLevelStats.low++;
    });
    
    console.log('\n📊 風險類別統計:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}項`);
    });
    
    console.log('\n🎯 風險等級分布:');
    console.log(`  高風險 (9+): ${riskLevelStats.high}項`);
    console.log(`  中風險 (6-8): ${riskLevelStats.medium}項`);
    console.log(`  低風險 (1-5): ${riskLevelStats.low}項`);
    
  } catch (error) {
    console.error('❌ 匯出失敗:', error);
  } finally {
    await pool.end();
  }
}

exportRiskCardsToCSV();