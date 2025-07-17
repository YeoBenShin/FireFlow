import React from "react";
import { LoginForm } from "../_components/forms/login-form";
import Image from "next/image";

export default function Login() {
  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center"
  style={{ backgroundImage: "url('/login-bg.jpg')" }}>
      <div className="w-full max-w-md rounded-2xl shadow-xl overflow-hidden bg-white/30 backdrop-blur-md border border-white/20">
        <div className="h-1 bg-orange-500 w-full" />
        <div className="px-8 py-10">
          <h1 className="text-3xl font-bold text-center text-orange-600 mb-6">
            Login
          </h1>
          <Image
            src="/Fireflow.svg"
            alt="FireFlow Logo"
            width={96}
            height={96}
            className="object-contain mx-auto"
          />
          <LoginForm />
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700">
              Don’t have an account?{" "}
              <a
                href="/sign-up"
                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
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

