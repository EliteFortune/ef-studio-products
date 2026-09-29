export function evaluateEntitlement(entitlement, now = new Date()) {
  if (!entitlement || entitlement.status === 'REVOKED') {
    return { canUse:false, canUpdate:false, reason:'LICENSE_INVALID' };
  }
  const perpetualUse = entitlement.perpetualUse === true;
  const updatesThrough = entitlement.updatesThrough ? new Date(entitlement.updatesThrough) : null;
  const canUpdate = updatesThrough instanceof Date && !Number.isNaN(updatesThrough.valueOf()) && now <= updatesThrough;
  return {
    canUse: perpetualUse || canUpdate,
    canUpdate,
    reason: canUpdate ? 'ACTIVE' : perpetualUse ? 'UPDATE_PERIOD_EXPIRED' : 'LICENSE_EXPIRED',
    updatesThrough: entitlement.updatesThrough ?? null
  };
}
