import { createClient } from '@supabase/supabase-js';
const a=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
for (const [t,c] of [["services","featured_image"],["gallery","media_url"],["blog_posts","featured_image"],["testimonials","client_photo"],["team_members","profile_image"],["clients","logo"]]) {
  const {data}=await a.from(t).select(c).ilike(c,'%verify%');
  console.log(t, JSON.stringify(data));
}
const {data:sc}=await a.from('site_content').select('published').eq('id',1).single();
console.log('site_content hero keys:', JSON.stringify(sc.published?.hero||{}).slice(0,200));
