import { z } from 'zod';

export const chronotypeTypeSchema = z.enum(['lion', 'bear', 'wolf', 'dolphin', 'custom']);

export const chronotypeDisplayModeSchema = z.enum(['border', 'background', 'both']);

export const chronotypeLevelSchema = z.enum(['warmup', 'peak', 'dip', 'recovery', 'winddown']);

export const productivityZoneSchema = z.object({
  startHour: z.number().int().min(0).max(23),
  endHour: z.number().int().min(0).max(23),
  level: chronotypeLevelSchema,
  label: z.string().max(100),
});

export const chronotypeCustomZonesSchema = z.array(productivityZoneSchema).max(24);
