import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function migrateAddRealAssessor() {
  try {
    console.log('Adding real assessor columns...');
    
    // 檢查欄位是否已存在
    const columns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'registry_assessments' 
      AND column_name IN ('real_assessor_name', 'real_assessor_department', 'real_assessor_email')
    `);
    
    if (columns.length === 0) {
      // 新增欄位
      await db.execute(sql`
        ALTER TABLE registry_assessments 
        ADD COLUMN real_assessor_name TEXT,
        ADD COLUMN real_assessor_department TEXT,
        ADD COLUMN real_assessor_email TEXT
      `);
      
      // 更新現有記錄
      await db.execute(sql`
        UPDATE registry_assessments 
        SET 
          real_assessor_name = assessor_name,
          real_assessor_department = assessor_department,
          real_assessor_email = assessor_email
        WHERE real_assessor_name IS NULL
      `);
      
      console.log('Migration completed successfully!');
    } else {
      console.log('Columns already exist, skipping migration.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateAddRealAssessor(); 