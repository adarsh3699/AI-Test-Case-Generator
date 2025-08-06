import React, { useEffect, useState, useCallback } from "react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  WifiIcon,
  ServerIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";

export type ErrorType = "network" | "server" | "validation" | "general";
export type ErrorPosition = "inline" | "fixed-top" | "sticky" | "toast";

interface ErrorDisplayProps {
  error: string;
  onClose: () => void;
  type?: ErrorType;
  position?: ErrorPosition;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  title?: string;
}

const getErrorConfig = (type: ErrorType) => {
  switch (type) {
    case "network":
      return {
        icon: WifiIcon,
        title: "Network Error",
        bgColor: "bg-red-50",
        borderColor: "border-red-500",
        textColor: "text-red-700",
        titleColor: "text-red-800",
        iconColor: "text-red-500",
        buttonColor: "text-red-500 hover:text-red-700",
      };
    case "server":
      return {
        icon: ServerIcon,
        title: "Server Error",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-500",
        textColor: "text-orange-700",
        titleColor: "text-orange-800",
        iconColor: "text-orange-500",
        buttonColor: "text-orange-500 hover:text-orange-700",
      };
    case "validation":
      return {
        icon: ShieldExclamationIcon,
        title: "Validation Error",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-500",
        textColor: "text-yellow-700",
        titleColor: "text-yellow-800",
        iconColor: "text-yellow-500",
        buttonColor: "text-yellow-500 hover:text-yellow-700",
      };
    default:
      return {
        icon: ExclamationTriangleIcon,
        title: "Error Occurred",
        bgColor: "bg-red-50",
        borderColor: "border-red-500",
        textColor: "text-red-700",
        titleColor: "text-red-800",
        iconColor: "text-red-500",
        buttonColor: "text-red-500 hover:text-red-700",
      };
  }
};

const getPositionClasses = (position: ErrorPosition) => {
  switch (position) {
    case "fixed-top":
      return "fixed top-4 left-4 right-4 z-50 max-w-4xl mx-auto";
    case "sticky":
      return "sticky top-4 z-40 mb-4 md:mb-6 mx-4";
    case "toast":
      return "fixed top-4 right-4 z-50 max-w-sm max-sm:left-4 max-sm:right-4 max-sm:max-w-none";
    default: // inline
      return "mb-6 md:mb-8 mx-4";
  }
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onClose,
  type = "general",
  position = "inline",
  autoDismiss = false,
  autoDismissDelay = 5000,
  title,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const config = getErrorConfig(type);
  const IconComponent = config.icon;
  const displayTitle = title || config.title;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, autoDismissDelay, handleClose]);

  if (!isVisible) return null;

  const getAnimationClass = () => {
    if (position === "toast") {
      return isExiting
        ? "animate-slide-out-right-toast"
        : "animate-slide-in-right-toast";
    }
    return isExiting ? "animate-slide-out-up" : "animate-slide-in-up";
  };

  return (
    <div className={`${getPositionClasses(position)} ${getAnimationClass()}`}>
      {position === "toast" ? (
        // Modern Toast Design
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl md:rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-4 md:p-5">
            <div className="flex items-start space-x-3 md:space-x-4">
              {/* Modern Icon Design */}
              <div
                className={`flex-shrink-0 p-2 md:p-3 ${config.bgColor} rounded-lg md:rounded-xl shadow-lg`}
              >
                <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${config.iconColor}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3
                      className={`text-sm md:text-base font-bold ${config.titleColor} mb-1`}
                    >
                      {displayTitle}
                    </h3>
                    <p
                      className={`${config.textColor} text-xs md:text-sm font-medium leading-relaxed`}
                    >
                      {error}
                    </p>

                    {/* Compact additional info for network errors */}
                    {type === "network" && (
                      <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                        <p>• Check internet connection</p>
                        <p>• Verify server on localhost:4000</p>
                      </div>
                    )}
                  </div>

                  {/* Close button */}
                  <button
                    onClick={handleClose}
                    className="ml-2 md:ml-3 flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    aria-label="Close error message"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Auto-dismiss indicator */}
                {autoDismiss && (
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mr-2 animate-pulse"></div>
                    Auto-closes in {Math.ceil(autoDismissDelay / 1000)}s
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Original Design for other positions
        <div
          className={`glass border-l-4 ${config.borderColor} rounded-2xl shadow-professional-lg overflow-hidden`}
        >
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className={`p-2 ${config.bgColor} rounded-xl`}>
                  <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
                </div>
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-bold ${config.titleColor} mb-2`}
                    >
                      {displayTitle}
                    </h3>
                    <p
                      className={`${config.textColor} font-medium leading-relaxed`}
                    >
                      {error}
                    </p>

                    {/* Additional info for network errors */}
                    {type === "network" && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p>• Check your internet connection</p>
                        <p>• Verify the server is running on localhost:4000</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                    {/* Auto-dismiss indicator */}
                    {autoDismiss && (
                      <div className="text-xs text-gray-500 font-medium">
                        Auto-close
                      </div>
                    )}

                    <button
                      onClick={handleClose}
                      className={`inline-flex ${config.buttonColor} focus:outline-none transition-all duration-300 p-2 rounded-xl hover:bg-gray-100 hover-lift focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                      aria-label="Close error message"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
