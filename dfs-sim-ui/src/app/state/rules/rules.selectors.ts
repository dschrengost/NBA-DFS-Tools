import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RulesState } from './rules.reducer';

export const selectRules = createFeatureSelector<RulesState>('rules');

export const selectMinUniques = createSelector(selectRules, s => s.minUniques);
export const selectMaxPerTeam = createSelector(selectRules, s => s.maxPerTeam);
export const selectStackType = createSelector(selectRules, s => s.stackType);
export const selectStackSize = createSelector(selectRules, s => s.stackSize);
