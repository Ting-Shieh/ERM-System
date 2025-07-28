import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import { riskRegistry } from "../shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { riskRegistry } });

interface CSVRow {
  '策略目標': string;
  '子策略目標': string;
  '主責 部門 / Leader': string;
  '風險擁有者': string;
  '營運單位目標': string;
  '種子成員\n(風險情境提出人員)': string;
  '風險類別': string;
  '項次_Level1': string;
  '風險事件來源': string;
  '項次_Level2': string;
  '風險情境': string;
  '現有風險對策': string;
  '監督量測指標：警戒值': string;
  '監督量測指標：行動值': string;
  '關係方': string;
  '可能性－各單位': string;
  '影響－各單位': string;
  '風險等級－各單位': string;
  '可能性－主責單位': string;
  '影響－主責單位': string;
  '風險等級－主責單位': string;
  '風險回應方式\n(降低/移轉/接受/拒絕)': string;
  '新增風險對策': string;
  '負責單位': string;
  '優化建議 - 風險回應/控制作業/監督': string;
  '2024.11.18筆記': string;
  '風險等級-加權': string;
  '優化建議 - 風險評估\n(N/A: 討論後無須優化)': string;
}

function parseNumber(value: string): number | null {
  if (!value || value.trim() === '' || value === '-') return null;
  const num = parseFloat(value.toString().trim());
  return isNaN(num) ? null : num;
}

function cleanText(value: string): string {
  if (!value) return '';
  return value.toString().trim().replace(/\n/g, ' ').replace(/\r/g, '');
}

async function importEnhancedRiskRegistry() {
  console.log('Starting enhanced risk registry import...');
  
  // Clear existing data
  console.log('Clearing existing risk registry data...');
  await db.delete(riskRegistry);
  
  const csvPath = path.join(process.cwd(), 'attached_assets', '(威剛) 企業風險管理之風險回應控制措施及監督規劃結果20241126_1753284253632.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records: CSVRow[] = [];

  return new Promise<void>((resolve, reject) => {
    parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      encoding: 'utf8',
      bom: true,
    }, async (err, data: CSVRow[]) => {
      if (err) {
        reject(err);
        return;
      }

      console.log(`Parsed ${data.length} records from CSV`);
      
      // Filter out empty records
      const validRecords = data.filter(row => 
        row['策略目標'] && row['策略目標'].trim() !== '' &&
        row['子策略目標'] && row['子策略目標'].trim() !== '' &&
        row['風險情境'] && row['風險情境'].trim() !== ''
      );

      console.log(`Found ${validRecords.length} valid records to import`);

      const batchSize = 50;
      let imported = 0;

      for (let i = 0; i < validRecords.length; i += batchSize) {
        const batch = validRecords.slice(i, i + batchSize);
        
        const insertData = batch.map(row => ({
          strategicObjective: cleanText(row['策略目標']),
          subObjective: cleanText(row['子策略目標']),
          responsibleDepartment: cleanText(row['主責 部門 / Leader']),
          riskOwner: cleanText(row['風險擁有者']),
          operationalTarget: cleanText(row['營運單位目標']),
          seedMember: cleanText(row['種子成員\n(風險情境提出人員)']),
          riskCategory: cleanText(row['風險類別']),
          level1Index: cleanText(row['項次_Level1']),
          riskEventSource: cleanText(row['風險事件來源']),
          level2Index: cleanText(row['項次_Level2']),
          riskScenario: cleanText(row['風險情境']),
          existingMeasures: cleanText(row['現有風險對策']),
          warningIndicator: cleanText(row['監督量測指標：警戒值']),
          actionIndicator: cleanText(row['監督量測指標：行動值']),
          stakeholders: cleanText(row['關係方']),
          unitPossibility: parseNumber(row['可能性－各單位']),
          unitImpact: parseNumber(row['影響－各單位']),
          unitRiskLevel: parseNumber(row['風險等級－各單位']),
          responsiblePossibility: parseNumber(row['可能性－主責單位']),
          responsibleImpact: parseNumber(row['影響－主責單位']),
          responsibleRiskLevel: parseNumber(row['風險等級－主責單位']),
          responseStrategy: cleanText(row['風險回應方式\n(降低/移轉/接受/拒絕)']),
          newRiskMeasures: cleanText(row['新增風險對策']),
          responsibleUnit: cleanText(row['負責單位']),
          newWarningIndicator: '', // Will be populated from response planning data
          newActionIndicator: '', // Will be populated from response planning data
          optimizationSuggestion: cleanText(row['優化建議 - 風險回應/控制作業/監督']),
          notes: cleanText(row['2024.11.18筆記']),
          weightedRiskLevel: parseNumber(row['風險等級-加權']) ? parseNumber(row['風險等級-加權'])!.toString() : null,
          assessmentOptimization: cleanText(row['優化建議 - 風險評估\n(N/A: 討論後無須優化)']),
        }));

        try {
          await db.insert(riskRegistry).values(insertData);
          imported += batch.length;
          console.log(`Imported batch ${Math.ceil((i + 1) / batchSize)}: ${imported}/${validRecords.length} records`);
        } catch (error) {
          console.error(`Error importing batch ${Math.ceil((i + 1) / batchSize)}:`, error);
          reject(error);
          return;
        }
      }

      console.log(`✅ Successfully imported ${imported} enhanced risk registry records`);
      
      // Verify import
      const count = await db.$count(riskRegistry);
      console.log(`📊 Total records in database: ${count}`);
      
      resolve();
    });
  });
}

// Run import if script is executed directly
importEnhancedRiskRegistry()
  .then(() => {
    console.log('Enhanced risk registry import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });

export { importEnhancedRiskRegistry };