/**
 * Reflections Service - Public API
 */

export { createDataAggregationService } from './data-aggregation-service';
export type {
  EnergyMapCell,
  FulfillmentTrendPoint,
  WeeklyReflectionData,
} from './data-aggregation-service';
export { createReflectionGenerationService } from './generation-service';
export type { GenerateReflectionOptions } from './generation-service';
export { buildReflectionPrompt } from './prompt-template';
export type { ReflectionGenerationResult, ReflectionPromptData } from './prompt-template';
export { createReflectionService, ReflectionServiceError } from './reflection-service';
