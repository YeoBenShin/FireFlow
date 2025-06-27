import React from "react";
import { LoginForm } from "../_components/forms/login-form";

export default function Login() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-teal-50 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-10">
          <h1 className="text-4xl font-bold text-center text-orange-600 mb-8">
            Login
          </h1>
          <LoginForm />
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don’t have an account?{" "}
              <a
                href="/sign-up"
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
