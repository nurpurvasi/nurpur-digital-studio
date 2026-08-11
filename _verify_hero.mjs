import { createClient } from '@supabase/supabase-js';
const a=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const mode=process.argv[2];
const {data}=await a.from('site_content').select('published,draft').eq('id',1).single();
const set=(o)=>{ if(o?.hero?.media) o.hero.media.src = mode==='set' ? '/api/media/hero/verify-renamed.png' : ''; return o; };
const {error}=await a.from('site_content').update({published:set(data.published),draft:set(data.draft)}).eq('id',1);
console.log(mode, error? 'ERR '+error.message : 'ok');
