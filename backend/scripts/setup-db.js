const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.error("Prisma schema not found!");
  process.exit(1);
}
let schema = fs.readFileSync(schemaPath, 'utf8');

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
} else if (dbUrl.startsWith('file:') || dbUrl.startsWith('sqlite:')) {
    schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
}

fs.writeFileSync(schemaPath, schema);
console.log("Database schema configured for URL:", dbUrl.split('@')[dbUrl.split('@').length - 1]);
