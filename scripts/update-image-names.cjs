/**
 * Migration Script: Update image names in database
 * Changes old image names to SEO-friendly names:
 * - Atif.png → atif-ayyoub-profile.png
 * - Atif1.png → atif-ayyoub-ai-developer.png
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateImageNames() {
  try {
    console.log('🔄 Fetching current app settings...');
    const { data: settings, error: fetchError } = await supabase
      .from('app_settings')
      .select('id, data')
      .eq('id', 1)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching settings:', fetchError.message);
      process.exit(1);
    }

    if (!settings || !settings.data) {
      console.error('❌ No settings found');
      process.exit(1);
    }

    console.log('📋 Current settings:', JSON.stringify(settings.data, null, 2));

    // Update image names
    const updatedData = {
      ...settings.data,
      profileImage: '/atif-ayyoub-profile.png',
      heroImage: '/atif-ayyoub-ai-developer.png',
    };

    // Also update any blog cover images if they use the old names
    if (updatedData.blogCoverImage === '/Atif.png' || updatedData.blogCoverImage === '/Atif1.png') {
      updatedData.blogCoverImage = '/atif-ayyoub-ai-developer.png';
    }

    console.log('✨ Updated settings:', JSON.stringify(updatedData, null, 2));

    // Save updated settings
    const { error: updateError } = await supabase
      .from('app_settings')
      .update({
        data: updatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    if (updateError) {
      console.error('❌ Error updating settings:', updateError.message);
      process.exit(1);
    }

    console.log('✅ Successfully updated image names in database!');
    console.log('   - profileImage: /atif-ayyoub-profile.png');
    console.log('   - heroImage: /atif-ayyoub-ai-developer.png');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

updateImageNames();
