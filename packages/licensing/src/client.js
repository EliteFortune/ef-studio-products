export async function activateLicense({ licenseKey, endpoint, fetchImpl = fetch }) {
  if (!endpoint) return { ok:false, code:'EF-LIC-001', message:'Activation service is not configured' };
  if (!licenseKey || typeof licenseKey !== 'string') return { ok:false, code:'EF-LIC-400', message:'License key is required' };
  const response=await fetchImpl(endpoint,{
    method:'POST',
    headers:{'content-type':'application/json','accept':'application/json'},
    body:JSON.stringify({licenseKey,product:'agent-reliability'})
  });
  if(!response.ok) return {ok:false,code:'EF-LIC-'+response.status,message:'Activation failed'};
  const body=await response.json();
  if(!body.entitlement) return {ok:false,code:'EF-LIC-502',message:'Activation response missing entitlement'};
  return {ok:true,entitlement:body.entitlement};
}
