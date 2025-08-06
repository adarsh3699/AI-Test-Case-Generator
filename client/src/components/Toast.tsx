import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
	message: string;
	type: ToastType;
	isVisible: boolean;
	onClose: () => void;
	duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose, duration = 4000 }) => {
	useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(onClose, duration);
			return () => clearTimeout(timer);
		}
	}, [isVisible, onClose, duration]);

	if (!isVisible) return null;

	const getToastStyles = () => {
		const baseStyles =
			"fixed top-4 right-4 z-[9999] max-w-sm w-full bg-white border-l-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out sm:max-w-sm sm:top-4 sm:right-4 max-sm:top-4 max-sm:left-4 max-sm:right-4 max-sm:max-w-none";

		switch (type) {
			case "success":
				return `${baseStyles} border-green-500`;
			case "error":
				return `${baseStyles} border-red-500`;
			case "warning":
				return `${baseStyles} border-yellow-500`;
			case "info":
				return `${baseStyles} border-blue-500`;
			default:
				return `${baseStyles} border-gray-500`;
		}
	};

	const getIconColor = () => {
		switch (type) {
			case "success":
				return "text-green-500";
			case "error":
				return "text-red-500";
			case "warning":
				return "text-yellow-500";
			case "info":
				return "text-blue-500";
			default:
				return "text-gray-500";
		}
	};

	const getIcon = () => {
		switch (type) {
			case "success":
				return (
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
				);
			case "error":
				return (
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				);
			case "warning":
				return (
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
				);
			case "info":
				return (
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				);
			default:
				return null;
		}
	};

	return createPortal(
		<div className={getToastStyles()}>
			<div className="flex items-start p-4">
				<div className={`flex-shrink-0 ${getIconColor()}`}>{getIcon()}</div>
				<div className="ml-3 flex-1">
					<p className="text-sm font-medium text-gray-900">{message}</p>
				</div>
				<div className="ml-4 flex-shrink-0 flex">
					<button
						className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150"
						onClick={onClose}
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
};
