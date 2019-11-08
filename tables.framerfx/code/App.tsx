import * as React from "react"
import { Override, Data } from "framer"
import { AvatarCell } from "./canvas"

export function TableMultiField(props): Override {
  return {
    columns: [
      { accessor: "id", show: false },
      {
        accessor: "names",
        Cell: ({
          row: {
            original: {
              names: { firstName, avatar }
            }
          }
        }) => (
          <AvatarCell
            firstName={firstName}
            avatar={avatar}
            position="relative"
          />
        )
      }
    ],
    rowConverter: ({ firstName, lastName, avatar, email, age }) => ({
      names: { firstName, lastName, avatar },
      email,
      age
    })
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
