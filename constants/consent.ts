import { AdsConsentStatus } from "react-native-google-mobile-ads";

export const CONSENT_STORAGE_KEY = "consentData";

export enum ConsentInitializationStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export type ConsentState = {
  status: AdsConsentStatus;
  canRequestAds: boolean;
  isInitialized: boolean;
  initializationStatus: ConsentInitializationStatus;
  isMobileAdsInitialized: boolean;
  privacyOptionsRequired: boolean;
};

export const initialConsentState: Omit<ConsentState, "status"> & {
  status: AdsConsentStatus | null;
} = {
  status: null,
  canRequestAds: false,
  isInitialized: false,
  initializationStatus: ConsentInitializationStatus.NOT_STARTED,
  isMobileAdsInitialized: false,
  privacyOptionsRequired: false,
};
