import { createReducer, on } from '@ngrx/store';
import * as BuilderActions from './builder.actions';

export interface BuilderState {
  lineupCount: number; // 1-150
  salaryMinUsed: number; // 0..50000
  correlation: number; // 0..100
  ownershipFade: number; // 0..100
  simDiversity: number; // 0..100
}

export const initialBuilder: BuilderState = {
  lineupCount: 20,
  salaryMinUsed: 49500,
  correlation: 50,
  ownershipFade: 30,
  simDiversity: 50,
};

export const reducer = createReducer(
  initialBuilder,
  on(BuilderActions.setLineupCount, (state, { value }) => ({ ...state, lineupCount: value })),
  on(BuilderActions.setSalaryMinUsed, (state, { value }) => ({ ...state, salaryMinUsed: value })),
  on(BuilderActions.setCorrelation, (state, { value }) => ({ ...state, correlation: value })),
  on(BuilderActions.setOwnershipFade, (state, { value }) => ({ ...state, ownershipFade: value })),
  on(BuilderActions.setSimDiversity, (state, { value }) => ({ ...state, simDiversity: value })),
);
