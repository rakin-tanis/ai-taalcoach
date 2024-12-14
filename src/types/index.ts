export interface MongoDBId {
  $oid: string;
}

export const GAME_MODE = {
  COMPETITION: 'competition',
  TRAINING: 'training'
} as const;
type GameModeKeys = keyof typeof GAME_MODE
export type GameModeType = typeof GAME_MODE[GameModeKeys];

export const operatorTypes = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "nin",
  "contains",
  "startsWith",
  "endsWith",
  "matches"
] as const;

export type OperatorType = typeof operatorTypes[number]
export type ResourceType = Record<string, unknown>;

export interface Condition {
  attribute: string;
  operator: OperatorType;
  value: string | number | boolean | null | undefined | object;
}

export interface Permission {
  _id?: string;
  resource: string;
  action: string;
  conditions?: Condition[];
}

export interface Role {
  _id?: string;
  name: string;
  permissions: Permission[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLoginAt: string;
  provider: string;
  roles: string[];
  image?: string;
  status: string;
  isEmailVerified: boolean;
}

export interface Example {
  _id?: string;
  dutch: string;
  turkish: string;
  level: string;
  source: string;
  words: string[];
  tags: string[];
  theme: string;
  status: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface FilterParams {
  search?: string;
  level?: string;
  source?: string;
  status?: string;
}

export interface ExamplesFilters {
  levels: string[];
  sources: string[];
  statuses: string[];
}

export interface ExamplesResponse {
  data: Example[];
  total: number;
  filters: ExamplesFilters;
}

export interface ApiErrorResponse {
  error: string;
  status: number;
}

// For use in the ExamplesPanel component
export interface FilterState {
  level: string;
  source: string;
  status: string;
}

// For the DataTable props
export interface TableFilters {
  levels: string[];
  sources: string[];
  statuses: string[];
}

export interface Player {
  userId: string;
  name: string;
  level: number;
  score: number;
}

export interface ThemeDistribution {
  theme: number;
  questionCount: number;
}

export interface AppliedJoker {
  name: string;
  indexes: number[];
}

export interface Option {
  value: string
  label: string
}