export { CATALOG, GROUPS, byId, makeBody } from './catalog';
export { MATERIALS } from './materials';
export { resolveImpact, fixedLorentzGamma, repels, SEVERITY } from './impact';
export { describeBody, effectInfo, fmtEnergy, fmtLength, fmtMass, fmtNum, fmtPressure, fmtSpeed, fmtFixedSpeed, LIGHT_YEAR, mergeInfo, REGIME_INFO, regimeInfoFor } from './describe';
export type { Behavior, Body, BodyOutcome, ImpactInput, ImpactOutcome, Material, MaterialId, Regime } from './types';
export { bindingEnergyPerKg, minContactSpeed } from './units';
