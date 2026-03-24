#!/usr/bin/env node

/**
 * Helper script to generate migrations with timestamp
 * Usage: node scripts/generate-migration.js
 */

const { execSync } = require('child_process');
const path = require('path');

const timestamp = Date.now();
const migrationPath = path.join('src/migrations', `AutoMigration_${timestamp}`);

const command = `npm run typeorm -- migration:generate ${migrationPath}`;

console.log(`Generating migration: ${migrationPath}`);

try {
  execSync(command, { stdio: 'inherit' });
  console.log('✓ Migration generated successfully!');
} catch (error) {
  console.error('✗ Migration generation failed!');
  process.exit(1);
}
