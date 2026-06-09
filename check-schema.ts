import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data: orders, error: oErr } = await supabase.from('orders').select('*').limit(1);
  console.log('Orders:', orders, oErr);
  
  const { data: purchases, error: pErr } = await supabase.from('purchases').select('*').limit(1);
  console.log('Purchases:', purchases, pErr);
}

checkSchema();
