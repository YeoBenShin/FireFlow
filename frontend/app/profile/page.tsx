import React from "react";
import { MainLayout } from "../_components/layout/main-layout";
import { ProfilePage } from "../_components/forms/profile-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

export default function Profile() {
  return (
    <MainLayout>
      <div className="min-h-screen w-full flex items-stretch justify-stretch">
        {/* Full viewport */}
        <Card className="w-full h-full flex flex-col justify-center">
          {/* Fill parent */}
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
            <ProfilePage />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
