export const getFeatureFlagOptions = (feature: string) => {
  switch (feature) {
    case MultiValueFeatures.Feature_NextGenQuery:
      return ["None", "Verify", "ClassicFallback", "NextGenOnly"];
    case MultiValueFeatures.Feature_NextGenETL:
      return ["None", "PostClassicBuild", "DesignerBuild"];
    case MultiValueFeatures.SyncStorageProvider:
      return ["FS", "S3"];
    default:
      return [];
  }
};

export enum MultiValueFeatures {
  Feature_NextGenETL = "Feature_NextGenETL",
  Feature_NextGenQuery = "Feature_NextGenQuery",
  SyncStorageProvider = "SyncStorageProvider",
}
