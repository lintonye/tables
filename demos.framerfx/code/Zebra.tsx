import { Override } from "framer";

export function TablePattern(): Override {
  return {
    rowProps: ({ index }) => ({
      style: {
        background: index % 2 === 1 ? "transparent" : "#f0f0f0",
      },
    }),
  };
}
