import { listGuides } from '../guidegen/index.js';
import { ensureStorageDirectories, hasAuthState } from '../storage/index.js';
import config from '../config/index.js';

/**
 * Generate a report of documentation status
 */
async function report() {
  console.log('📊 TERP Doc Bot Report');
  console.log('='.repeat(50));
  
  await ensureStorageDirectories();
  
  // Configuration status
  console.log('\n🔧 Configuration');
  console.log('-'.repeat(50));
  console.log(`Base URL:     ${config.terp.baseUrl}`);
  console.log(`Output Dir:   ${config.output.dir}`);
  console.log(`Auth State:   ${await hasAuthState() ? '✅ Present' : '❌ Missing'}`);
  
  // Guide statistics
  const guides = await listGuides();
  console.log('\n📚 Guides');
  console.log('-'.repeat(50));
  console.log(`Total Guides: ${guides.length}`);
  
  if (guides.length > 0) {
    // Group by category
    const byCategory = guides.reduce((acc, guide) => {
      const cat = guide.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\nBy Category:');
    for (const [category, count] of Object.entries(byCategory)) {
      console.log(`  ${category}: ${count}`);
    }
    
    // List all guides
    console.log('\nAll Guides:');
    for (const guide of guides) {
      console.log(`  - [${guide.category}] ${guide.title}`);
      console.log(`    ID: ${guide.id}`);
      console.log(`    Tags: ${guide.tags?.join(', ') || 'none'}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Report generated at:', new Date().toISOString());
}

report().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
