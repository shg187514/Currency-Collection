const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Verify DATABASE_URL is set for production
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  console.error('For Railway or production, set DATABASE_URL in your environment');
  process.exit(1);
}

if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
  console.error('ERROR: DATABASE_URL must be a PostgreSQL connection string');
  console.error('Current URL:', dbUrl.split('@')[dbUrl.split('@').length - 1]);
  process.exit(1);
}

console.log('✓ DATABASE_URL is configured for PostgreSQL');
