export interface FlagUserInterface {
  hide: () => boolean;
  show: () => boolean;
  loadGlobalFlags: () => Promise<void>;
}

export type FeatureFlagValue = string | boolean;

export interface FlagToggleSetting {
  id: number;
  featureName: string;
  value: string;
}

export type FeatureFlagScope = 'Environment' | 'Organisation' | 'User';

export type FeatureFlag = {
  name: string;
  displayName: string;
  description: string | null;
  type: string | null;
  owners: string[];
  scopes: FeatureFlagScope[] | null;
  defaultValue: string | null;
  possibleValues: string[] | null;
  helpUrl: string | null;
  obsoleteReason: string | null;
}