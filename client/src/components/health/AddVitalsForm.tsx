import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface AddVitalsFormProps {
  onAdd: (vitals: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenLevel: number;
  }) => void;
}

export const AddVitalsForm = ({ onAdd }: AddVitalsFormProps) => {
  const [heartRate, setHeartRate] = useState("");
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState("");
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState("");
  const [temperature, setTemperature] = useState("");
  const [oxygenLevel, setOxygenLevel] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const heartRateNum = parseFloat(heartRate);
    const temperatureNum = parseFloat(temperature);
    const oxygenLevelNum = parseFloat(oxygenLevel);
    const systolicNum = parseFloat(bloodPressureSystolic);
    const diastolicNum = parseFloat(bloodPressureDiastolic);

    if (isNaN(heartRateNum) || heartRateNum < 40 || heartRateNum > 200) {
      toast({
        title: "Invalid heart rate",
        description: "Please enter a heart rate between 40 and 200 BPM",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(temperatureNum) || temperatureNum < 35 || temperatureNum > 42) {
      toast({
        title: "Invalid temperature",
        description: "Please enter a temperature between 35°C and 42°C",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(oxygenLevelNum) || oxygenLevelNum < 0 || oxygenLevelNum > 100) {
      toast({
        title: "Invalid oxygen level",
        description: "Please enter an oxygen level between 0% and 100%",
        variant: "destructive",
      });
      return;
    }

    if (
      isNaN(systolicNum) ||
      systolicNum < 70 ||
      systolicNum > 200 ||
      isNaN(diastolicNum) ||
      diastolicNum < 40 ||
      diastolicNum > 130
    ) {
      toast({
        title: "Invalid blood pressure",
        description: "Please enter valid blood pressure values",
        variant: "destructive",
      });
      return;
    }

    onAdd({
      heartRate: heartRateNum,
      bloodPressure: `${bloodPressureSystolic}/${bloodPressureDiastolic}`,
      temperature: temperatureNum,
      oxygenLevel: oxygenLevelNum,
    });

    // Reset form
    setHeartRate("");
    setBloodPressureSystolic("");
    setBloodPressureDiastolic("");
    setTemperature("");
    setOxygenLevel("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium" htmlFor="heartRate">
            Heart Rate (BPM)
          </label>
          <Input
            id="heartRate"
            type="number"
            placeholder="Enter heart rate"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Blood Pressure (mmHg)</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Systolic"
              value={bloodPressureSystolic}
              onChange={(e) => setBloodPressureSystolic(e.target.value)}
            />
            <span className="flex items-center">/</span>
            <Input
              type="number"
              placeholder="Diastolic"
              value={bloodPressureDiastolic}
              onChange={(e) => setBloodPressureDiastolic(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="temperature">
            Temperature (°C)
          </label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            placeholder="Enter temperature"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="oxygenLevel">
            Oxygen Level (%)
          </label>
          <Input
            id="oxygenLevel"
            type="number"
            placeholder="Enter oxygen level"
            value={oxygenLevel}
            onChange={(e) => setOxygenLevel(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Add Measurements
      </Button>
    </form>
  );
};
