import React from "react";
import { SignUpForm } from "../_components/forms/sign-up-form";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center"
  style={{ backgroundImage: "url('/login.jpg')" }}>
      <div className="w-full max-w-md rounded-2xl shadow-xl overflow-hidden bg-white/30 backdrop-blur-md border border-white/20">
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
