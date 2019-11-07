import * as React from "react"
import { Override, Data } from "framer"

export function Table(props): Override {
  return {
    columns: [{ accessor: "id" }]
  }
}
