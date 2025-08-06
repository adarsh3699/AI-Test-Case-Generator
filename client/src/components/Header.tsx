import React from "react";
import { LightBulbIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/solid";

export const Header: React.FC = () => {
  return (
    <div className="text-center mb-16 animate-slide-in-up">
      <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-3xl mb-8 animate-float shadow-professional-lg">
        <LightBulbIcon className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-6xl font-bold text-gradient mb-6 tracking-tight">
        AI Test Case Generator
      </h1>
      <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
        Transform your GitHub repositories into comprehensive test suites with
        AI-powered analysis and intelligent test case generation
      </p>
      <div className="flex items-center justify-center space-x-8 mt-8">
        <div className="flex items-center space-x-2 text-emerald-600">
          <CheckCircleIcon className="w-5 h-5" />
          <span className="font-semibold">AI-Powered</span>
        </div>
        <div className="flex items-center space-x-2 text-blue-600">
          <SparklesIcon className="w-5 h-5" />
          <span className="font-semibold">Intelligent Analysis</span>
        </div>
        <div className="flex items-center space-x-2 text-purple-600">
          <RocketLaunchIcon className="w-5 h-5" />
          <span className="font-semibold">Fast Generation</span>
        </div>
      </div>
    </div>
  );
};
