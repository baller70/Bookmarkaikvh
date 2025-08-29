"use client";
import React from "react";

export default function UndefinedErrorPage() {
  // Trigger an undefined function error on mount
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    myUndefinedFunction();
  }, []);

  return (
    <div style={{padding:40}}>
      <h1>Undefined Error Test Page</h1>
      <p>This page intentionally calls an undefined function to generate a runtime error which should be captured by Sentry.</p>
    </div>
  );
} 