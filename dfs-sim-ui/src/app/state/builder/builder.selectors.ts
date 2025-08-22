import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BuilderState } from './builder.reducer';

export const selectBuilder = createFeatureSelector<BuilderState>('builder');

export const selectLineupCount = createSelector(selectBuilder, s => s.lineupCount);
export const selectSalaryMinUsed = createSelector(selectBuilder, s => s.salaryMinUsed);
export const selectCorrelation = createSelector(selectBuilder, s => s.correlation);
export const selectOwnershipFade = createSelector(selectBuilder, s => s.ownershipFade);
export const selectSimDiversity = createSelector(selectBuilder, s => s.simDiversity);
