import * as React from "react";
import { Override, Data } from "framer";

const hoverData = Data({ hoveredIndex: -1 });
export function TableHoverActions(): Override {
  return {
    showDefaultColumns: false,
    columns: [
      { accessor: "symbol" },
      { accessor: "market" },
      { accessor: "price" },
      {
        accessor: "actions",
        Cell: ({ row: { index } }) => (
          <div style={{ width: 80 }}>
            {index === hoverData.hoveredIndex && (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <span>🗑</span>
                <span>✋</span>
                <span>💾</span>
              </div>
            )}
          </div>
        ),
      },
    ],
    rowProps: ({ index }) => ({
      onMouseEnter: () => (hoverData.hoveredIndex = index),
    }),
  };
}
