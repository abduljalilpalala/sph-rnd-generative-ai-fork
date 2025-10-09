import { ReactNode } from "react";

interface DataDisplayProps {
  label: string;
  value: ReactNode;
}

export const DataDisplay = ({ label, value }: DataDisplayProps) => {
  return (
    <div>
      <label className="block text-gray-600 font-semibold mb-1">{label}</label>
      <p className="text-lg">{value}</p>
    </div>
  );
};
