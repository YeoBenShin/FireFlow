import React from "react";
import RecentTransaction from '../_components/RecentTransaction';


// should we do a pop up for all the other features such as add new collab / see collab request / goal invitations?
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-black">Welcome to FireFlow</h1>
      <p className="text-lg text-black mb-8">
        A personal financial tracker app
      </p>
      <a
        href="/signUp"
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Sign Up
      </a>
      <RecentTransaction/>
    </div>
  );
}