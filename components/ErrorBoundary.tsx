import React, { Component, ReactNode } from "react";
import { View, Text } from "react-native";
import { logError } from "@/utils/errorLogging";

interface ErrorBoundaryProps {
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
export class ErrorBoundary extends Component<
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
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-lg font-semibold mb-2">
            Coś poszło nie tak
          </Text>
          <Text className="text-gray-600 text-center">
            Wystąpił błąd w komponencie. Spróbuj ponownie później.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
