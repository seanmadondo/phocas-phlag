export interface FlagUserInterface {
  hide: () => boolean;
  show: () => boolean;
  loadFlagValues: () => Promise<SettingDto[]>;
  loadFlagDefinitions: () => Promise<FeatureFlag[]>;
}

export type FeatureFlagValue = string | boolean;

export interface FlagToggleSetting {
  id: number;
  featureName: string;
  value: string;
}

export type SettingDto = {
  id: number;
  name: string;
  value: FeatureFlagValue;
}

export type UserSettingDto = SettingDto & {
  userId: number;
}

export type FeatureFlagScope = 'Environment' | 'Organisation' | 'User';

export type FeatureFlag = {
  name: string;
  displayName: string;
  description: string | null;
  type: string | null;
  owners: string[];
  scopes: FeatureFlagScope[];
  defaultValue: string | null;
  possibleValues: string[] | null;
  helpUrl: string | null;
  obsoleteReason: string | null;
}
