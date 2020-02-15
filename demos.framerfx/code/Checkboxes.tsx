import * as React from "react";
import { Override, Data, RenderTarget } from "framer";
import { Checkbox, CheckboxChecked } from "./canvas";

const appState = Data({
  selectedIndex: RenderTarget.current() === RenderTarget.canvas ? 4 : -1,
});
export function TableCheckboxes(): Override {
  return {
    columns: [
      {
        accessor: "id",
        Cell: ({ row: { index } }) =>
          index === appState.selectedIndex ? (
            <CheckboxChecked position="relative" />
          ) : (
            <Checkbox position="relative" />
          ),
        align: "left",
      },
    ],
    rowProps: ({ index }) => ({
      initial: {
        backgroundColor: "#FFF",
      },
      animate: {
        backgroundColor: index === appState.selectedIndex ? "#EFF4FE" : "#FFF",
      },
      whileHover: {
        backgroundColor: "#F1FFFE",
      },
      style: { cursor: "pointer" },
      onClick: () => (appState.selectedIndex = index),
    }),
  };
}
