import { generateGuide, saveGuide } from '../guidegen/index.js';
import { ensureStorageDirectories } from '../storage/index.js';

/**
 * Seed sample guides for testing the companion UI
 */
async function seed() {
  console.log('🌱 Seeding sample guides...');
  
  await ensureStorageDirectories();
  
  // Sample guide 1: Login
  const loginGuide = await generateGuide({
    id: 'login-to-terp',
    title: 'How to Log In to TERP',
    description: 'Step-by-step guide for logging into the TERP application',
    category: 'Getting Started',
    tags: ['login', 'authentication', 'getting-started'],
    steps: [
      {
        title: 'Navigate to TERP',
        description: 'Open your web browser and go to the TERP login page.',
        action: 'navigate',
      },
      {
        title: 'Enter your email',
        description: 'Type your email address in the email field.',
        action: 'fill',
        selector: 'input[type="email"]',
      },
      {
        title: 'Enter your password',
        description: 'Type your password in the password field.',
        action: 'fill',
        selector: 'input[type="password"]',
      },
      {
        title: 'Click Sign In',
        description: 'Click the Sign In button to access your account.',
        action: 'click',
        selector: 'button[type="submit"]',
      },
    ],
  });
  
  await saveGuide(loginGuide);
  console.log(`  ✅ Created: ${loginGuide.metadata.title}`);
  
  // Sample guide 2: Dashboard Overview
  const dashboardGuide = await generateGuide({
    id: 'dashboard-overview',
    title: 'Dashboard Overview',
    description: 'Learn about the main dashboard and its features',
    category: 'Getting Started',
    tags: ['dashboard', 'overview', 'navigation'],
    steps: [
      {
        title: 'Access the Dashboard',
        description: 'After logging in, you will be taken to the main dashboard.',
      },
      {
        title: 'View Recent Activity',
        description: 'The recent activity section shows your latest actions and updates.',
      },
      {
        title: 'Navigate Using the Sidebar',
        description: 'Use the sidebar menu to access different sections of TERP.',
      },
    ],
  });
  
  await saveGuide(dashboardGuide);
  console.log(`  ✅ Created: ${dashboardGuide.metadata.title}`);
  
  // Sample guide 3: Creating a New Record
  const createRecordGuide = await generateGuide({
    id: 'create-new-record',
    title: 'Creating a New Record',
    description: 'How to create a new record in TERP',
    category: 'Records',
    tags: ['records', 'create', 'data-entry'],
    steps: [
      {
        title: 'Click New Record',
        description: 'Click the "New Record" button in the top right corner.',
        action: 'click',
      },
      {
        title: 'Fill in Required Fields',
        description: 'Complete all required fields marked with an asterisk (*).',
        action: 'fill',
      },
      {
        title: 'Add Optional Information',
        description: 'Fill in any additional optional fields as needed.',
        action: 'fill',
      },
      {
        title: 'Save the Record',
        description: 'Click the Save button to create your new record.',
        action: 'click',
      },
    ],
  });
  
  await saveGuide(createRecordGuide);
  console.log(`  ✅ Created: ${createRecordGuide.metadata.title}`);
  
  console.log('\n✨ Seeding complete! 3 sample guides created.');
}

seed().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
