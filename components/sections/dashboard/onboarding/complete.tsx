"use client";
import Link from "next/link";
import Button from "@/components/atoms/button";

const Complete = ({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) => {
  return (
    <div className="flex flex-col gap-6 items-center text-center">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-n-1">Onboarding Complete! 🎉</h2>
        <p className="text-n-3">
          Thank you for setting up your profile. You're all set to explore the dashboard.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <Link
          href="/dashboard"
          className="w-full inline-flex items-center justify-center rounded-lg bg-color-1 px-5 py-3 text-base font-medium text-n-1 transition-colors hover:bg-color-1/90"
        >
          Go to Dashboard
        </Link>
        
        <Button
          onClick={() => prevStep()}
          className="w-full rounded-md bg-n-7 px-4 py-2 text-n-1 hover:bg-n-6 transition-colors"
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default Complete;
