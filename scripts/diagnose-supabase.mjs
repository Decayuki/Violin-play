import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lxhyvoyfrfohudncfiic.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4aHl2b3lmcmZvaHVkbmNmaWljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMzMTU2MCwiZXhwIjoyMDc5OTA3NTYwfQ.lyfbVXHHoZXwHdIOtUOp4fzoLHZmc6lTa9k6kbwOQZE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function diagnose() {
    console.log('🔍 DIAGNOSING SUPABASE CONNECTION...\n');

    // 1. Check Storage Buckets
    console.log('1️⃣  Checking Storage Buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
        console.error('   ❌ Error listing buckets:', bucketError.message);
    } else {
        console.log('   ✅ Buckets found:', buckets.map(b => b.name).join(', ') || 'None');
    }

    // 2. Check Table 'songs'
    console.log('\n2️⃣  Checking Table "songs"...');
    const { data: songs, error: songError } = await supabase
        .from('songs')
        .select('count', { count: 'exact', head: true });

    if (songError) {
        console.error('   ❌ Error accessing "songs":', songError.message);
        console.error('      Hint: Does the table exist? Is it in the "public" schema?');
    } else {
        console.log('   ✅ Table "songs" accessible. Count:', songs?.length ?? 'Unknown'); // count is in count property if head:true
    }

    // 3. Check Table 'students'
    console.log('\n3️⃣  Checking Table "students"...');
    const { error: studentError } = await supabase
        .from('students')
        .select('count', { count: 'exact', head: true });

    if (studentError) {
        console.error('   ❌ Error accessing "students":', studentError.message);
    } else {
        console.log('   ✅ Table "students" accessible.');
    }
    // 4. Check SELECT * 'songs'
    console.log('\n4️⃣  Checking SELECT * from "songs"...');
    const { data: selectData, error: selectError } = await supabase
        .from('songs')
        .select('*')
        .limit(1);

    if (selectError) {
        console.error('   ❌ Error selecting from "songs":', selectError.message);
    } else {
        console.log('   ✅ Select successful. Rows:', selectData.length);
    }

    // 5. Check INSERT 'songs' (no select)
    console.log('\n5️⃣  Checking INSERT into "songs" (no return)...');
    const { error: insertError } = await supabase
        .from('songs')
        .insert({
            title: 'Diagnostic Test Song No Return',
            base_difficulty: 1,
            tags: ['diagnostic']
        });

    if (insertError) {
        console.error('   ❌ Error inserting into "songs":', insertError.message);
    } else {
        console.log('   ✅ Insert successful (no return).');
    }
}

diagnose();
