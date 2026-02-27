import React from "react";

export const LoadingEventDetail = ({ variant = "page", message = "Loading..." }: { variant?: string; message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full py-20">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
};
