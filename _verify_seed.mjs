import { createClient } from '@supabase/supabase-js';
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false} });
const M = '/api/media/hero/verify-pixel.png';
const now = new Date(Date.now()-60000).toISOString();
const tag = 'ZZVERIFY';
const rows = {
  services: [{ title:tag+' Service', slug:'zzverify-service', short_description:'t', full_description:'t', featured_image:M, published:true, featured:true }],
  portfolio_projects: [{ title:tag+' Project', slug:'zzverify-project', client:'t', short_description:'t', cover_image:M, status:'published', publish_date:now, featured:true }],
  gallery: [{ title:tag+' Gallery', media_type:'image', media_url:M, status:'published', publish_date:now, featured:true }],
  blog_posts: [{ title:tag+' Post', slug:'zzverify-post', excerpt:'t', content:'t', featured_image:M, status:'published', publish_date:now }],
  testimonials: [{ client_name:tag+' Client', testimonial:'t', rating:5, client_photo:M, status:'published', publish_date:now, featured:true }],
  team_members: [{ name:tag+' Member', designation:'t', profile_image:M, status:'published', publish_date:now, featured:true }],
  clients: [{ company_name:tag+' Brand', slug:'zzverify-brand', logo:M, published:true, featured:true }],
};
for (const [t, r] of Object.entries(rows)) {
  const { error } = await db.from(t).insert(r);
  console.log(t, error ? 'ERR '+error.message : 'inserted');
}
