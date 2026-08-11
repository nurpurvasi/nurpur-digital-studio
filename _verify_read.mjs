import { createClient } from '@supabase/supabase-js';
const key=process.env.SUPABASE_PUBLISHABLE_KEY;
const c=createClient(process.env.SUPABASE_URL,key,{auth:{persistSession:false},global:{fetch:(i,init)=>{const h=new Headers(init?.headers); if(h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization'); h.set('apikey',key); return fetch(i,{...init,headers:h});}}});
for (const [t,extra] of [["portfolio_projects",{status:'published'}],["gallery",{status:'published'}],["services",{published:true}],["clients",{published:true}]]) {
  let q=c.from(t).select('*');
  for (const [k,v] of Object.entries(extra)) q=q.eq(k,v);
  const {data,error}=await q;
  console.log(t, error? 'ERR '+error.message : 'rows='+data.length, data?.[0]?JSON.stringify({pd:data[0].publish_date,f:data[0].featured}):'');
}
