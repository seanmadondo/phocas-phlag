export interface FlagUserInterface {
  hide: () => boolean;
  show: () => boolean;
  loadGlobalFlags: () => Promise<void>;
}

export interface FlagToggleSetting {
  id: number;
  featureName: string;
  value: string;
}

export type FeatureFlagScope = 'Organisation' | 'User';

export type FeatureFlag = {
  name: string;
  displayName: string;
  description: string | null;
  type: string | null;
  owners: string[];
  scope: FeatureFlagScope | null;
  defaultValue: string | null;
  possibleValues: string[];
  helpUrl: string | null;
  obsoleteReason: string | null;
}