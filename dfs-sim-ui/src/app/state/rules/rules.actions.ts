import { createAction, props } from '@ngrx/store';

export const setMinUniques = createAction('[Rules] Set Min Uniques', props<{ value: number }>());
export const setMaxPerTeam = createAction('[Rules] Set Max Per Team', props<{ value: number | null }>());
export const setStackType = createAction('[Rules] Set Stack Type', props<{ value: 'none' | 'team' | 'game' }>());
export const setStackSize = createAction('[Rules] Set Stack Size', props<{ value: number | null }>());
