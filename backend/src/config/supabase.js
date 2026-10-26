const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('SUPABASE_URL e SUPABASE_KEY precisam estar definidos no .env');
}

// cliente único do banco, usado pelos services
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
});

module.exports = supabase;
