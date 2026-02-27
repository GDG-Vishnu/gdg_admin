import React from "react";
import GoogleLoader from "@/components/GoogleLoader";

export const LoadingEventDetail = ({ variant = "page", message = "Loading..." }: { variant?: string; message?: string }) => {
  return (
    <GoogleLoader message={message} fullPage={variant === "page"} />
  );
};
