import * as React from "react"
import { Override, Data } from "framer"
import { AvatarCell } from "./canvas"

export function TableMultiField(props): Override {
  return {
    columns: [
      { accessor: "id", show: false },
      { accessor: "firstName", show: false },
      { accessor: "lastName", show: false },
      { accessor: "avatar", show: false },
      {
        accessor: "names",
        Cell: ({
          row: {
            original: { firstName, avatar }
          }
        }) => (
          <AvatarCell
            firstName={firstName}
            avatar={avatar}
            position="relative"
          />
        )
      }
    ]
  }
}

export function TableAvatar(props): Override {
  return {
    columns: [
      { accessor: "id", show: false },
      {
        accessor: "avatar",
        Cell: ({ cell: { value } }) => (
          <AvatarCell avatar={value} position="relative" />
        )
      }
    ]
  }
}
