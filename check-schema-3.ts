import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('orders').insert({
    id: '00000000-0000-0000-0000-000000000000',
    price: 1000,
    status: 'pending',
    user_id: '00000000-0000-0000-0000-000000000000',
  }).select('*');
  console.log('Error:', error);
}

checkSchema();
