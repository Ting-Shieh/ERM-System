import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { db } from '../server/db';
import { riskRegistry } from '../shared/schema';

async function importRiskRegistry() {
  try {
    // Read CSV file
    const csvContent = readFileSync('attached_assets/(威剛) 企業風險管理之風險回應控制措施及監督規劃結果20241126_1753276657855.csv', 'utf-8');
    
    // Parse CSV with proper headers
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true // Handle BOM for Chinese characters
    });

    console.log(`Found ${records.length} records to import`);

    // Process each record
    const importedRecords = [];
    
    for (const record of records) {
      try {
        // Map CSV columns to database schema
        const registryData = {
          strategicObjective: record['策略目標'] || '',
          subObjective: record['子策略目標'] || '',
          responsibleDepartment: record['主責 部門 / Leader'] || '',
          riskOwner: record['風險擁有者'] || '',
          operationalTarget: record['營運單位目標'] || '',
          seedMember: record['種子成員\n(風險情境提出人員)'] || '',
          riskCategory: record['風險類別'] || '',
          level1Index: record['項次_Level1'] || '',
          riskEventSource: record['風險事件來源'] || '',
          level2Index: record['項次_Level2'] || '',
          riskScenario: record['風險情境'] || '',
          existingMeasures: record['現有風險對策'] || '',
          warningIndicator: record['監督量測指標：警戒值'] || null,
          actionIndicator: record['監督量測指標：行動值'] || null,
          stakeholders: record['關係方'] || null,
          
          // Risk Assessment - Unit Level
          unitPossibility: record['可能性－各單位'] ? parseInt(record['可能性－各單位']) : null,
          unitImpact: record['影響－各單位'] ? parseInt(record['影響－各單位']) : null,
          unitRiskLevel: record['風險等級－各單位'] ? parseInt(record['風險等級－各單位']) : null,
          
          // Risk Assessment - Responsible Unit Level
          responsiblePossibility: record['可能性－主責單位'] ? parseInt(record['可能性－主責單位']) : null,
          responsibleImpact: record['影響－主責單位'] ? parseInt(record['影響－主責單位']) : null,
          responsibleRiskLevel: record['風險等級－主責單位'] ? parseInt(record['風險等級－主責單位']) : null,
          
          // Risk Response
          responseStrategy: record['風險回應方式\n(降低/移轉/接受/拒絕)'] || null,
          newRiskMeasures: record['新增風險對策'] || null,
          responsibleUnit: record['負責單位'] || null,
          newWarningIndicator: record['監督量測指標：警戒值'] || null,
          newActionIndicator: record['監督量測指標：行動值'] || null,
          
          // Optimization
          optimizationSuggestion: record['優化建議 - 風險回應/控制作業/監督'] || null,
          notes: record['2024.11.18筆記'] || null,
          weightedRiskLevel: record['風險等級-加權'] ? parseFloat(record['風險等級-加權']) : null,
          assessmentOptimization: record['優化建議 - 風險評估\n(N/A: 討論後無須優化)'] || null
        };

        // Skip empty records
        if (!registryData.strategicObjective && !registryData.riskScenario) {
          continue;
        }

        // Insert into database
        const [inserted] = await db
          .insert(riskRegistry)
          .values(registryData)
          .returning();

        importedRecords.push(inserted);
        
        if (importedRecords.length % 10 === 0) {
          console.log(`Imported ${importedRecords.length} records...`);
        }
        
      } catch (error) {
        console.error('Error processing record:', error);
        console.log('Problematic record:', record);
      }
    }

    console.log(`Successfully imported ${importedRecords.length} risk registry entries`);
    console.log('Import completed successfully!');
    
  } catch (error) {
    console.error('Error importing risk registry:', error);
    process.exit(1);
  }
}

// Run import
importRiskRegistry()
  .then(() => {
    console.log('Risk registry import process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to import risk registry:', error);
    process.exit(1);
  });