export interface StrategyListResult {
  strategies: string[];
}

export enum ParameterType {
  IntParameter = 'IntParameter',
  RealParameter = 'RealParameter',
  DecimalParameter = 'DecimalParameter',
  BooleanParameter = 'BooleanParameter',
  CategoricalParameter = 'CategoricalParameter',
}

export interface BaseParameter {
  param_type: ParameterType;
  name: string;
  space: string;
  load: boolean;
  optimize: boolean;
}

export interface IntParameter extends BaseParameter {
  param_type: ParameterType.IntParameter;
  value: number;
  low: number;
  high: number;
}
export interface RealParameter extends BaseParameter {
  param_type: ParameterType.RealParameter;
  value: number;
  low: number;
  high: number;
}

export interface DecimalParameter extends BaseParameter {
  param_type: ParameterType.DecimalParameter;
  decimals: number;
  value: number;
  low: number;
  high: number;
}

export interface CategoricalParameter extends BaseParameter {
  param_type: ParameterType.CategoricalParameter;
  value: string;
  opt_range: string[];
}

export interface BooleanParameter extends BaseParameter {
  param_type: ParameterType.BooleanParameter;
  value: string;
  opt_range: boolean[];
}

export type AllStrategyParameter =
  IntParameter | RealParameter | DecimalParameter | CategoricalParameter | BooleanParameter;

export interface StrategyResult {
  /** Strategy name */
  strategy: string;
  timeframe: string;
  /** Code of the strategy class */
  code: string;
  params: AllStrategyParameter[];
}

export interface StrategyProfile {
  id: string;
  strategy: string;
  display_name: string;
  trading_mode: string;
  margin_mode: string;
  timeframes: string[];
  runtime_timeframes: string[];
  default_timeframe: string;
  supports_short: boolean;
  leverage_allowed: boolean;
  compatible: boolean;
  compatibility_reason?: string | null;
}

export interface RuntimeSettings {
  profile_id?: string | null;
  strategy: string;
  timeframe: string;
  trading_mode: string;
  margin_mode: string;
  leverage?: number | null;
  short_enabled: boolean;
  open_trades: number;
  open_orders: number;
  can_apply: boolean;
  warning?: string | null;
  reload_status: 'idle' | 'pending' | 'succeeded' | 'failed';
  reload_error?: string | null;
}

export interface StrategyProfilePayload {
  profile_id: string;
  timeframe?: string;
  leverage?: number;
  short_enabled?: boolean;
}

export interface StrategyProfilePreview extends RuntimeSettings {
  profile: StrategyProfile;
}
