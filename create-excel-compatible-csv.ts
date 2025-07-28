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

async function createExcelCompatibleCSV() {
  try {
    console.log('🔄 開始建立Excel相容的CSV檔案...');
    
    const riskCards = await db.select().from(schema.riskRegistry).orderBy(schema.riskRegistry.id);
    
    console.log(`📋 處理 ${riskCards.length} 項風險記錄`);
    
    // CSV headers (in Traditional Chinese)
    const headers = [
      '風險ID', '戰略目標', '子目標', '主責部門', '風險擁有者', '營運目標',
      '風險類別', '風險情境', '現有控制措施', '警戒指標', '行動指標', '關係方',
      '各單位可能性', '各單位影響度', '各單位風險等級', 
      '主責單位可能性', '主責單位影響度', '主責單位風險等級',
      '回應策略', '新增對策', '優化建議', '加權風險等級', '評估優化'
    ];
    
    // Create CSV content with proper escaping
    let csvLines = [];
    csvLines.push(headers.join(','));
    
    riskCards.forEach(card => {
      const row = [
        card.id,
        escapeCSVField(card.strategicObjective || ''),
        escapeCSVField(card.subObjective || ''),
        escapeCSVField(card.responsibleDepartment || ''),
        escapeCSVField(card.riskOwner || ''),
        escapeCSVField(card.operationalTarget || ''),
        escapeCSVField(card.riskCategory || ''),
        escapeCSVField(card.riskScenario || ''),
        escapeCSVField(card.existingMeasures || ''),
        escapeCSVField(card.warningIndicator || ''),
        escapeCSVField(card.actionIndicator || ''),
        escapeCSVField(card.stakeholders || ''),
        card.unitPossibility || '',
        card.unitImpact || '',
        card.unitRiskLevel || '',
        card.responsiblePossibility || '',
        card.responsibleImpact || '',
        card.responsibleRiskLevel || '',
        escapeCSVField(card.responseStrategy || ''),
        escapeCSVField(card.newRiskMeasures || ''),
        escapeCSVField(card.optimizationSuggestion || ''),
        card.weightedRiskLevel || '',
        escapeCSVField(card.assessmentOptimization || '')
      ];
      csvLines.push(row.join(','));
    });
    
    const csvContent = csvLines.join('\n');
    
    // Create both versions:
    // 1. UTF-8 with BOM for Excel
    const csvWithBOM = '\uFEFF' + csvContent;
    fs.writeFileSync('威剛科技_風險評估卡片_UTF8_BOM.csv', csvWithBOM, 'utf8');
    
    // 2. UTF-8 without BOM for other applications
    fs.writeFileSync('威剛科技_風險評估卡片_UTF8.csv', csvContent, 'utf8');
    
    console.log('✅ 已建立兩個版本的CSV檔案:');
    console.log('  📊 威剛科技_風險評估卡片_UTF8_BOM.csv (適用於Excel)');
    console.log('  📊 威剛科技_風險評估卡片_UTF8.csv (適用於其他應用程式)');
    
    console.log('\n💡 使用建議:');
    console.log('  • Excel用戶: 請使用UTF8_BOM版本');
    console.log('  • Google Sheets/其他: 請使用UTF8版本');
    console.log('  • 如果中文仍顯示問題，請在開啟CSV時選擇UTF-8編碼');
    
  } catch (error) {
    console.error('❌ 建立失敗:', error);
  } finally {
    await pool.end();
  }
}

function escapeCSVField(value: string): string {
  if (!value) return '';
  
  // If field contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('\n') || value.includes('\r') || value.includes('"')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  
  return value;
}

createExcelCompatibleCSV();