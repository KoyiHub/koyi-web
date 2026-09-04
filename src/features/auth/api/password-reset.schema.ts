import { z } from 'zod';

/**
 * Teacher password reset — `frontend-integration.md` §5.1. Code-based, like
 * the school admin flow, not the earlier link/token design the doc itself
 * says was rejected: `request` emails a six-digit code identified by
 * `teacher_id` (a teacher signs in with it, not an address), and `confirm`
 * spends the code and sets the password in one call — there is no separate
 * verify step and no `reset_token` the way the school flow has one.
 */
export const requestTeacherPasswordResetResponseSchema = z.unknown();

export const confirmTeacherPasswordResetResponseSchema = z.unknown();
