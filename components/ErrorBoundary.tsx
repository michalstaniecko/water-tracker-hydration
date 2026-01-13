import React, { Component, ReactNode } from "react";
import { View, Text } from "react-native";
import { withTranslation, WithTranslation } from "react-i18next";
import { logError } from "@/utils/errorLogging";

interface ErrorBoundaryProps extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component to catch and handle errors in React component tree
 * Prevents the entire app from crashing when a component fails
 */
class ErrorBoundaryComponent extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error with context
    logError(error, {
      operation: "React Component Error",
      component: this.props.componentName || "Unknown Component",
      data: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render() {
    const { t } = this.props;

    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Safely access translations with fallback for cases where i18n is not yet initialized
      const errorTitle =
        t?.("errors:somethingWentWrong") || "Something went wrong";
      const errorMessage =
        t?.("errors:componentError") ||
        "An error occurred in the component. Please try again later.";

      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-lg font-semibold mb-2">
            {errorTitle}
          </Text>
          <Text className="text-gray-600 text-center">{errorMessage}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryComponent);

export default ErrorBoundary;
