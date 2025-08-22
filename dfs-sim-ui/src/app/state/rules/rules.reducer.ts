import { createReducer, on } from '@ngrx/store';
import * as RulesActions from './rules.actions';

export interface RulesState {
  minUniques: number; // 1–3
  maxPerTeam?: number | null; // null = unlimited
  stackType?: 'none' | 'team' | 'game';
  stackSize?: number | null; // e.g., 2 or 3 if enabled
}

export const initialRules: RulesState = {
  minUniques: 1,
  maxPerTeam: null,
  stackType: 'none',
  stackSize: null,
};

export const reducer = createReducer(
  initialRules,
  on(RulesActions.setMinUniques, (state, { value }) => ({ ...state, minUniques: value })),
  on(RulesActions.setMaxPerTeam, (state, { value }) => ({ ...state, maxPerTeam: value })),
  on(RulesActions.setStackType, (state, { value }) => ({ ...state, stackType: value })),
  on(RulesActions.setStackSize, (state, { value }) => ({ ...state, stackSize: value })),
);
