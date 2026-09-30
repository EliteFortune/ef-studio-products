export const DEFAULT_LICENSE_ENDPOINT = 'https://nmckntmhjhajehixyoau.supabase.co/functions/v1/ef-license-activate';

export async function activateLicense({ licenseKey, deviceId, endpoint = DEFAULT_LICENSE_ENDPOINT, fetchImpl = fetch }) {
  if (!endpoint) return { ok:false, code:'EF-LIC-001', message:'Activation service is not configured' };
  if (!licenseKey || typeof licenseKey !== 'string') return { ok:false, code:'EF-LIC-400', message:'License key is required' };
  if (!deviceId || typeof deviceId !== 'string') return { ok:false, code:'EF-LIC-400', message:'Installation identifier is required' };

  const response=await fetchImpl(endpoint,{
    method:'POST',
    headers:{'content-type':'application/json','accept':'application/json'},
    body:JSON.stringify({licenseKey,deviceId,product:'agent-reliability'})
  });

  let body={};
  try { body=await response.json(); } catch {}

  if(!response.ok) {
    const code=body?.code ? `EF-LIC-${body.code}` : `EF-LIC-${response.status}`;
    return {ok:false,code,message:body?.code || 'Activation failed'};
  }
  if(!body.entitlement) return {ok:false,code:'EF-LIC-502',message:'Activation response missing entitlement'};
  return {ok:true,entitlement:body.entitlement};
}
