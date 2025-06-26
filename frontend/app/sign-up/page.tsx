import React from "react";
import { SignUpForm } from "../_components/forms/sign-up-form";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-teal-50 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-10">
          <h1 className="text-4xl font-bold text-center text-orange-600 mb-8">
            Sign Up
          </h1>
          <SignUpForm />
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
