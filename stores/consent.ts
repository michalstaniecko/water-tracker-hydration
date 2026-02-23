import { create } from "zustand";
import mobileAds from "react-native-google-mobile-ads";
import { AdsConsentStatus } from "react-native-google-mobile-ads";
import {
  requestConsentInfo,
  loadAndShowConsentFormIfRequired,
  showPrivacyOptionsForm,
} from "@/services/consentService";
import { initializeFirebaseAnalytics } from "@/services/firebaseAnalytics";
import { initializeCrashlytics } from "@/services/crashlytics";
import { logError, logInfo } from "@/utils/errorLogging";
import {
  ConsentInitializationStatus,
  initialConsentState,
} from "@/constants/consent";

type ConsentState = {
  status: AdsConsentStatus | null;
  canRequestAds: boolean;
  isInitialized: boolean;
  initializationStatus: ConsentInitializationStatus;
  isMobileAdsInitialized: boolean;
  privacyOptionsRequired: boolean;
};

type ConsentActions = {
  initializeConsent: () => Promise<void>;
  showPrivacyOptions: () => Promise<void>;
  reset: () => void;
};

export const useConsentStore = create<ConsentState & ConsentActions>(
  (set, get) => ({
    ...initialConsentState,

    initializeConsent: async () => {
      const currentStatus = get().initializationStatus;

      // Prevent re-initialization
      if (
        currentStatus === ConsentInitializationStatus.IN_PROGRESS ||
        currentStatus === ConsentInitializationStatus.COMPLETED
      ) {
        logInfo("Consent initialization already in progress or completed", {
          operation: "initializeConsent",
          component: "ConsentStore",
          data: { currentStatus },
        });
        return;
      }

      set({ initializationStatus: ConsentInitializationStatus.IN_PROGRESS });

      try {
        logInfo("Starting consent initialization", {
          operation: "initializeConsent",
          component: "ConsentStore",
        });

        // Step 1: Request consent info update
        await requestConsentInfo();

        // Step 2: Show consent form if required (for EU users who haven't consented)
        const consentResult = await loadAndShowConsentFormIfRequired();

        set({
          status: consentResult.status,
          canRequestAds: consentResult.canRequestAds,
          privacyOptionsRequired: consentResult.privacyOptionsRequired,
          isInitialized: true,
        });

        logInfo("Consent status determined", {
          operation: "initializeConsent",
          component: "ConsentStore",
          data: {
            status: consentResult.status,
            canRequestAds: consentResult.canRequestAds,
            privacyOptionsRequired: consentResult.privacyOptionsRequired,
          },
        });

        // Step 3: Initialize Firebase services based on consent
        await initializeFirebaseAnalytics(consentResult.canRequestAds);
        await initializeCrashlytics(consentResult.canRequestAds);

        // Step 4: Initialize Mobile Ads SDK if we can request ads
        if (consentResult.canRequestAds) {
          logInfo("Initializing Mobile Ads SDK", {
            operation: "initializeConsent",
            component: "ConsentStore",
          });

          await mobileAds().initialize();

          set({ isMobileAdsInitialized: true });

          logInfo("Mobile Ads SDK initialized successfully", {
            operation: "initializeConsent",
            component: "ConsentStore",
          });
        } else {
          logInfo("Skipping Mobile Ads initialization - cannot request ads", {
            operation: "initializeConsent",
            component: "ConsentStore",
          });
        }

        set({ initializationStatus: ConsentInitializationStatus.COMPLETED });

        logInfo("Consent initialization completed", {
          operation: "initializeConsent",
          component: "ConsentStore",
        });
      } catch (error) {
        logError(error, {
          operation: "initializeConsent",
          component: "ConsentStore",
        });

        set({
          initializationStatus: ConsentInitializationStatus.FAILED,
          isInitialized: true,
          canRequestAds: false,
        });
      }
    },

    showPrivacyOptions: async () => {
      try {
        logInfo("Showing privacy options", {
          operation: "showPrivacyOptions",
          component: "ConsentStore",
        });

        const result = await showPrivacyOptionsForm();

        set({
          status: result.status,
          canRequestAds: result.canRequestAds,
          privacyOptionsRequired: result.privacyOptionsRequired,
        });

        // Update Firebase services based on new consent
        await initializeFirebaseAnalytics(result.canRequestAds);
        await initializeCrashlytics(result.canRequestAds);

        // If user changed consent to allow ads and SDK not initialized
        if (result.canRequestAds && !get().isMobileAdsInitialized) {
          logInfo("Initializing Mobile Ads SDK after consent change", {
            operation: "showPrivacyOptions",
            component: "ConsentStore",
          });

          await mobileAds().initialize();
          set({ isMobileAdsInitialized: true });
        }

        logInfo("Privacy options completed", {
          operation: "showPrivacyOptions",
          component: "ConsentStore",
          data: {
            status: result.status,
            canRequestAds: result.canRequestAds,
          },
        });
      } catch (error) {
        logError(error, {
          operation: "showPrivacyOptions",
          component: "ConsentStore",
        });
      }
    },

    reset: () => {
      set(initialConsentState);
    },
  }),
);
