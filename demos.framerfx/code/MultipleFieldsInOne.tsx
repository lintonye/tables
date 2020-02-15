import * as React from "react";
import { Override } from "framer";
import { AvatarCell } from "./canvas";

export function TableMultiField(): Override {
  return {
    showDefaultColumns: false,
    columns: [
      {
        accessor: "names",
        Header: "Who",
        Cell: ({
          row: {
            original: { firstName, lastName, avatar, age, gender },
          },
        }) => (
          <AvatarCell
            firstName={firstName + " " + lastName}
            avatar={avatar}
            age={age + ""}
            gender={gender === "Male" ? "♂" : "♀"}
            position="relative"
          />
        ),
      },
      { accessor: "email", Header: "Email" },
    ],
  };
}
