"use client";
import Button from "@/components/atoms/button";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";

const Work = ({
  nextStep,
  prevStep,
}: {
  nextStep: () => void
  prevStep: () => void
}) => {
  const [formData, setFormData] = useState({
    designation: "",
    company: ""
  });

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await apiClient.get("/profile/getDetails");
      const data = response.data.data;
      
      setFormData({
        designation: data.designation || "",
        company: data.company || ""
      });
      
    } catch (error) {
      toast.error("Failed to fetch profile data");
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await apiClient.post("/designation/onboarding/update-details", formData);
      if (response.data.status) {
        nextStep();
      }
    } catch (error) {
      toast.error("Error submitting form");
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="text-n-1 text-2xl font-bold">Enter your work details</div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="designation" className="text-n-3 text-sm">
            What's your role?
          </label>
          <input
            id="designation"
            type="text"
            placeholder="e.g. Physiotherapist, Doctor, etc."
            value={formData.designation}
            onChange={(e) => setFormData({...formData, designation: e.target.value})}
            className="rounded-xl bg-n-7 px-4 py-3 text-n-1 border border-n-6 focus:border-primary-1 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="company" className="text-n-3 text-sm">
            Where do you work?
          </label>
          <input
            id="company"
            type="text"
            placeholder="e.g. Apollo, Healthflex, Praxis, etc."
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            className="rounded-xl bg-n-7 px-4 py-3 text-n-1 border border-n-6 focus:border-primary-1 focus:outline-none transition-colors"
          />
        </div>
      </div>
      <div className="flex gap-4 w-full justify-between mt-4">
        <Button
          text="Back"
          onClick={() => prevStep()}
          className="rounded-xl bg-n-7 px-6 py-3 text-n-1 hover:bg-n-6 transition-colors w-1/2"
        >
          Back
        </Button>
        <Button
          text="Next"
          onClick={handleSubmit}
          className="rounded-xl bg-primary-1 px-6 py-3 text-n-1 hover:bg-primary-2 transition-colors w-1/2"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default Work 