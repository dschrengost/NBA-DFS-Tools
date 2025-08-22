import { createAction, props } from '@ngrx/store';

export const setLineupCount = createAction('[Builder] Set Lineup Count', props<{ value: number }>());
export const setSalaryMinUsed = createAction('[Builder] Set Salary Min Used', props<{ value: number }>());
export const setCorrelation = createAction('[Builder] Set Correlation', props<{ value: number }>());
export const setOwnershipFade = createAction('[Builder] Set Ownership Fade', props<{ value: number }>());
export const setSimDiversity = createAction('[Builder] Set Sim Diversity', props<{ value: number }>());
