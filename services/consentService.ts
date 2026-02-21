import {
  AdsConsent,
  AdsConsentStatus,
  AdsConsentInfo,
  AdsConsentPrivacyOptionsRequirementStatus,
} from "react-native-google-mobile-ads";
import { logError, logInfo } from "@/utils/errorLogging";

export type ConsentInfoResult = {
  status: AdsConsentStatus;
  canRequestAds: boolean;
  isConsentFormAvailable: boolean;
  privacyOptionsRequired: boolean;
};

/**
 * Request consent info update from UMP SDK
 * This checks if consent is required and what the current status is
 */
export async function requestConsentInfo(): Promise<ConsentInfoResult> {
  try {
    logInfo("Requesting consent info update", {
      operation: "requestConsentInfo",
      component: "ConsentService",
    });

    const consentInfo: AdsConsentInfo = await AdsConsent.requestInfoUpdate();

    logInfo("Consent info received", {
      operation: "requestConsentInfo",
      component: "ConsentService",
      data: {
        status: consentInfo.status,
        canRequestAds: consentInfo.canRequestAds,
        isConsentFormAvailable: consentInfo.isConsentFormAvailable,
      },
    });

    return {
      status: consentInfo.status,
      canRequestAds: consentInfo.canRequestAds,
      isConsentFormAvailable: consentInfo.isConsentFormAvailable,
      privacyOptionsRequired:
        consentInfo.privacyOptionsRequirementStatus ===
        AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
    };
  } catch (error) {
    logError(error, {
      operation: "requestConsentInfo",
      component: "ConsentService",
    });
    throw error;
  }
}

/**
 * Show consent form if required
 * Returns the consent info after form is dismissed
 */
export async function loadAndShowConsentFormIfRequired(): Promise<ConsentInfoResult> {
  try {
    logInfo("Showing consent form if required", {
      operation: "loadAndShowConsentFormIfRequired",
      component: "ConsentService",
    });

    const consentInfo: AdsConsentInfo =
      await AdsConsent.loadAndShowConsentFormIfRequired();

    logInfo("Consent form completed", {
      operation: "loadAndShowConsentFormIfRequired",
      component: "ConsentService",
      data: {
        status: consentInfo.status,
        canRequestAds: consentInfo.canRequestAds,
      },
    });

    return {
      status: consentInfo.status,
      canRequestAds: consentInfo.canRequestAds,
      isConsentFormAvailable: consentInfo.isConsentFormAvailable,
      privacyOptionsRequired:
        consentInfo.privacyOptionsRequirementStatus ===
        AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
    };
  } catch (error) {
    logError(error, {
      operation: "loadAndShowConsentFormIfRequired",
      component: "ConsentService",
    });
    throw error;
  }
}

/**
 * Show privacy options form to let user change consent
 * Only available if privacyOptionsRequired is true
 */
export async function showPrivacyOptionsForm(): Promise<ConsentInfoResult> {
  try {
    logInfo("Showing privacy options form", {
      operation: "showPrivacyOptionsForm",
      component: "ConsentService",
    });

    const consentInfo: AdsConsentInfo =
      await AdsConsent.showPrivacyOptionsForm();

    logInfo("Privacy options form completed", {
      operation: "showPrivacyOptionsForm",
      component: "ConsentService",
      data: {
        status: consentInfo.status,
        canRequestAds: consentInfo.canRequestAds,
      },
    });

    return {
      status: consentInfo.status,
      canRequestAds: consentInfo.canRequestAds,
      isConsentFormAvailable: consentInfo.isConsentFormAvailable,
      privacyOptionsRequired:
        consentInfo.privacyOptionsRequirementStatus ===
        AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
    };
  } catch (error) {
    logError(error, {
      operation: "showPrivacyOptionsForm",
      component: "ConsentService",
    });
    throw error;
  }
}

/**
 * Reset consent info (for testing purposes)
 */
export function resetConsent(): void {
  try {
    logInfo("Resetting consent info", {
      operation: "resetConsent",
      component: "ConsentService",
    });

    AdsConsent.reset();

    logInfo("Consent info reset successfully", {
      operation: "resetConsent",
      component: "ConsentService",
    });
  } catch (error) {
    logError(error, {
      operation: "resetConsent",
      component: "ConsentService",
    });
    throw error;
  }
}
