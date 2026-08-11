import { createClient } from '@supabase/supabase-js';
const admin=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const { replaceMediaReferences, assertMediaUnreferenced } = await import('./src/lib/media.server.ts');
// simulate a rename: hero/verify-pixel.png -> hero/verify-renamed.png
const mv = await admin.storage.from('site-media').move('hero/verify-pixel.png','hero/verify-renamed.png');
console.log('storage move:', mv.error? 'ERR '+mv.error.message : 'ok');
await replaceMediaReferences('hero/verify-pixel.png','hero/verify-renamed.png');
const { data } = await admin.from('portfolio_projects').select('cover_image').eq('slug','zzverify-project').single();
console.log('portfolio cover after rename:', data.cover_image);
try { await assertMediaUnreferenced(['hero/verify-renamed.png']); console.log('delete-guard: FAIL (allowed delete of referenced asset)'); }
catch(e){ console.log('delete-guard: blocked as expected ->', e.message.slice(0,60)); }
