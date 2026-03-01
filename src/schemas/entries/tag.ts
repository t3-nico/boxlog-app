import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(1, 'validation.tag.nameRequired').max(50, 'validation.tag.nameMaxLength'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'validation.invalidColorCode')
    .default('#3B82F6'),
  description: z.string().max(200, 'validation.description.maxLength').optional(),
});

export const updateTagSchema = createTagSchema.partial();

export const tagIdSchema = z.object({
  id: z.string().uuid('validation.invalidUuid'),
});
