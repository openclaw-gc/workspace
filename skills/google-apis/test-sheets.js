#!/usr/bin/env node

/**
 * Test Google Sheets API Integration
 */

const { authorize } = require('./authorize');
const { google } = require('googleapis');

async function testSheets() {
  console.log('📊 Testing Google Sheets API...\n');
  
  const auth = await authorize();
  const sheets = google.sheets({ version: 'v4', auth });
  
  console.log('ℹ️  Sheets API requires a spreadsheet ID to test.');
  console.log('   Creating a test spreadsheet is optional for now.\n');
  
  // List recent spreadsheets via Drive API
  console.log('1. Checking Drive API access...');
  const drive = google.drive({ version: 'v3', auth });
  
  const files = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    pageSize: 5,
    fields: 'files(id, name, createdTime)',
    orderBy: 'createdTime desc',
  });
  
  console.log(`   ✅ Found ${files.data.files?.length || 0} recent spreadsheets\n`);
  
  if (files.data.files && files.data.files.length > 0) {
    files.data.files.forEach(file => {
      console.log(`   📄 ${file.name}`);
      console.log(`      ID: ${file.id}`);
      console.log(`      Created: ${file.createdTime}\n`);
    });
    
    // Read first sheet
    const firstSheet = files.data.files[0];
    console.log(`2. Reading data from: ${firstSheet.name}...`);
    
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: firstSheet.id,
        range: 'A1:Z10', // First 10 rows, all columns
      });
      
      const rows = response.data.values;
      console.log(`   ✅ Read ${rows?.length || 0} rows\n`);
      
      if (rows && rows.length > 0) {
        console.log('   Preview:');
        rows.slice(0, 3).forEach(row => {
          console.log(`   ${row.join(' | ')}`);
        });
        console.log();
      }
    } catch (err) {
      console.log(`   ⚠️  Could not read sheet: ${err.message}\n`);
    }
  } else {
    console.log('   ℹ️  No spreadsheets found. Create one to test read/write.\n');
  }
  
  console.log('✅ Sheets API test complete!\n');
  console.log('💡 To test write operations, create a spreadsheet and run:');
  console.log('   node write-test-sheet.js <SPREADSHEET_ID>\n');
}

if (require.main === module) {
  testSheets()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Sheets test failed:', err.message);
      process.exit(1);
    });
}

module.exports = { testSheets };
