import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, FileText, DollarSign } from "lucide-react";

const mockInsuranceData = {
  plan: "Premium Health Coverage",
  provider: "HealthCare Plus",
  policyNumber: "HC-123456789",
  coverage: {
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "Active",
  },
  benefits: [
    "Primary Care Visits",
    "Specialist Consultations",
    "Hospital Stays",
    "Prescription Drugs",
    "Emergency Services",
  ],
};

const mockClaims = [
  {
    id: "CLM001",
    date: "2024-02-15",
    service: "Annual Checkup",
    amount: 250,
    status: "Approved",
  },
  {
    id: "CLM002",
    date: "2024-02-28",
    service: "Dental Cleaning",
    amount: 150,
    status: "Processing",
  },
];

const Insurance = () => {
  return (
    <MainLayout>
      <div className="animate-in">
        <h1 className="mb-8 w-fit text-3xl font-bold primary-grad">
          Insurance Coverage
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {mockInsuranceData.plan}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Provider: {mockInsuranceData.provider}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    Policy Number: {mockInsuranceData.policyNumber}
                  </p>
                  <p className="text-sm">
                    Coverage Period: {mockInsuranceData.coverage.startDate} to{" "}
                    {mockInsuranceData.coverage.endDate}
                  </p>
                  <p className="text-sm">
                    Status:{" "}
                    <span className="text-green-500">
                      {mockInsuranceData.coverage.status}
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Covered Benefits:</h4>
                  <ul className="list-inside list-disc space-y-1">
                    {mockInsuranceData.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-semibold">{claim.service}</p>
                      <p className="text-sm text-muted-foreground">
                        {claim.date}
                      </p>
                      <p className="text-sm">Claim ID: {claim.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        <DollarSign className="mr-1 inline h-4 w-4" />
                        {claim.amount}
                      </p>
                      <span
                        className={`text-sm ${
                          claim.status === "Approved"
                            ? "text-green-500"
                            : "text-orange-500"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4 w-full" variant="outline">
                View All Claims
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Insurance;
