import { Text } from "@/components/atoms";

interface TableHeaderProps {
  columns: string[];
}

export const TableHeader = ({ columns }: TableHeaderProps) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        {columns.map((column, index) => (
          <th key={index} className="px-6 py-3 text-left">
            <Text variant="label" color="muted">
              {column}
            </Text>
          </th>
        ))}
      </tr>
    </thead>
  );
};
