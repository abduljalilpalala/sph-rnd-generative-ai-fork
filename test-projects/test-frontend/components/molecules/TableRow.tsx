import { ReactNode } from "react";
import { Text } from "@/components/atoms";

interface TableRowProps {
  cells: (string | number | ReactNode)[];
}

export const TableRow = ({ cells }: TableRowProps) => {
  return (
    <tr>
      {cells.map((cell, index) => (
        <td key={index} className="px-6 py-4 whitespace-nowrap">
          {typeof cell === "string" || typeof cell === "number" ? (
            <Text variant="body" color={index === 0 ? "primary" : "secondary"}>
              {cell}
            </Text>
          ) : (
            cell
          )}
        </td>
      ))}
    </tr>
  );
};
