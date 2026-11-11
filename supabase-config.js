/* AfyaPlate browser configuration.
   Only the Supabase publishable key belongs here. Never add a secret/service-role key. */
(function () {
  const SUPABASE_URL = 'https://trmgnskjelzgdjxoeqgz.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_FnyouLdb7PyEqDUgqSvPrA_Y8gARD82';
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('AfyaPlate: Supabase JS library did not load.');
    return;
  }
  window.afyaSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
})();