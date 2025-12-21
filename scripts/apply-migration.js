#!/usr/bin/env node

const { readFileSync } = require('fs');
const { join } = require('path');

// Load environment variables
require('dotenv').config({ path: join(__dirname, '..', '.env.local') });

const { createClient } = require('@supabase/supabase-js');

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  // Create Supabase client with service role (has admin privileges)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('📖 Reading migration file...');
  const migrationPath = join(__dirname, '..', 'MIGRATION_TO_APPLY.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  console.log('🚀 Applying annotations migration...\n');

  // Split SQL into individual statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Skip comments
    if (statement.startsWith('--') || !statement) continue;

    console.log(`\n📝 Executing statement ${i + 1}/${statements.length}:`);
    console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));

    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        query: statement + ';'
      });

      if (error) {
        // Try direct execution for DDL statements
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: statement + ';' })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('✅ Statement executed successfully');
      } else {
        console.log('✅ Statement executed successfully');
      }
    } catch (err) {
      console.error(`❌ Error executing statement: ${err.message}`);

      // Continue anyway - some errors might be expected (like table already exists)
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log('⚠️  Continuing (resource may already exist)...');
      } else {
        console.error('\n💥 Migration failed. Please apply manually via Supabase Dashboard.');
        process.exit(1);
      }
    }
  }

  console.log('\n✨ Migration completed!');
  console.log('\n📋 Verifying annotations table...');

  // Verify the table was created
  const { data: tables, error: tablesError } = await supabase
    .from('annotations')
    .select('*')
    .limit(0);

  if (tablesError) {
    console.error('❌ Table verification failed:', tablesError.message);
    console.log('\n⚠️  Please apply the migration manually via Supabase Dashboard:');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Go to SQL Editor');
    console.log('   4. Copy-paste MIGRATION_TO_APPLY.sql');
    console.log('   5. Click Run');
  } else {
    console.log('✅ Annotations table verified successfully!');
    console.log('\n🎉 You can now use the annotation feature in your app!');
  }
}

applyMigration().catch(err => {
  console.error('💥 Fatal error:', err.message);
  process.exit(1);
});
