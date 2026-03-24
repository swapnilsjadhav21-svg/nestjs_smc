#!/usr/bin/env node

/**
 * Helper script to generate migrations with timestamp
 * Usage: node scripts/generate-migration.js [name]
 */

const { execSync } = require('child_process');
const path = require('path');

// Use provided name or generate default
const migrationName = process.argv[2] || `Migration_${Date.now()}`;
const migrationPath = path.join('src', 'migrations', migrationName);

const command = `npm run typeorm -- migration:generate ${migrationPath}`;

console.log(`\n📝 Generating migration: ${migrationName}\n`);

try {
  execSync(command, { stdio: 'inherit' });
  console.log('\n✅ Migration generated successfully!\n');
} catch (error) {
  console.error('\n❌ Migration generation failed!\n');
  process.exit(1);
}
