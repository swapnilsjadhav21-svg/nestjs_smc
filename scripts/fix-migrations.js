#!/usr/bin/env node

/**
 * Script to mark pending migrations as executed in the database
 * This is useful when migrations were already executed but TypeORM doesn't know about it
 */

const { DataSourceOptions } = require('typeorm');
const { PostgresDriver } = require('typeorm/driver/postgres/PostgresDriver');
const pg = require('pg');
require('dotenv').config();

const migrationNames = [
  'AutoMigration1774260204124',
  'DesignationTable1774331129699', 
  'Remainigmigrations1774334506625',
  'Prabhagzonemapping1774336548158',
  'Prabhagzonemappingupdate1774337560333',
  'CoreComplaintsystem1774346394414',
];

const client = new pg.Client({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'smc',
});

async function markMigrationsAsExecuted() {
  try {
    await client.connect();

    for (const name of migrationNames) {
      const checkQuery = `SELECT * FROM migrations WHERE name = $1`;
      const result = await client.query(checkQuery, [name]);

      if (result.rows.length === 0) {
        const insertQuery = `INSERT INTO migrations (name, "timestamp") VALUES ($1, $2)`;
        const timestamp = Math.floor(Date.now() / 1000);
        await client.query(insertQuery, [name, timestamp]);
        console.log(`✓ Marked migration as executed: ${name}`);
      } else {
        console.log(`✓ Migration already marked: ${name}`);
      }
    }

    console.log('\n✅ All migrations marked as executed!');
    await client.end();
  } catch (error) {
    console.error('❌ Error marking migrations:', error);
    process.exit(1);
  }
}

markMigrationsAsExecuted();
