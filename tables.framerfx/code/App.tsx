import * as React from "react"
import { Override, Data } from "framer"
import { PhotoCell } from "./canvas"

export function Table(props): Override {
  return {
    columns: [
      { accessor: "id" },
      {
        accessor: "photo",
        Cell: ({ cell: { value } }) => (
          <PhotoCell photo={value} position="relative" />
        )
      }
    ]
  }
}

export function Table2(props): Override {
  return {
    columns: [{ accessor: "id" }]
  }
}
