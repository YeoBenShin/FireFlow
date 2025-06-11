import React from "react";
import RecentTransaction from '../_components/RecentTransaction';

export default function Overview() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <RecentTransaction/>
    </div>
  );
}