import React from "react";
import { LightBulbIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/solid";

export const Header: React.FC = () => {
  return (
    <div className="text-center mb-8 md:mb-16 animate-slide-in-up">
      <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 gradient-primary rounded-2xl md:rounded-3xl mb-6 md:mb-8 animate-float shadow-professional-lg">
        <LightBulbIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
      </div>
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gradient mb-4 md:mb-6 tracking-tight px-4">
        AI Test Case Generator
      </h1>
      <p className="text-base md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium px-4">
        Transform your GitHub repositories into comprehensive test suites with
        AI-powered analysis and intelligent test case generation
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mt-6 md:mt-8 px-4">
        <div className="flex items-center space-x-2 text-emerald-600">
          <CheckCircleIcon className="w-4 h-4 md:w-5 md:h-5" />
          <span className="font-semibold text-sm md:text-base">AI-Powered</span>
        </div>
        <div className="flex items-center space-x-2 text-blue-600">
          <SparklesIcon className="w-4 h-4 md:w-5 md:h-5" />
          <span className="font-semibold text-sm md:text-base">Intelligent Analysis</span>
        </div>
        <div className="flex items-center space-x-2 text-purple-600">
          <RocketLaunchIcon className="w-4 h-4 md:w-5 md:h-5" />
          <span className="font-semibold text-sm md:text-base">Fast Generation</span>
        </div>
      </div>
    </div>
  );
};
