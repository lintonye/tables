import * as React from "react"
import { Override, Data } from "framer"
import { AvatarCell, Checkbox, CheckboxChecked } from "./canvas"

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
      },
      { accessor: "email" }
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

export function TableCheckboxes(props): Override {
  return {
    columns: [
      {
        accessor: "id",
        Header: null,
        Cell: ({ row: { index } }) =>
          index === 4 ? (
            <CheckboxChecked position="relative" />
          ) : (
            <Checkbox position="relative" />
          ),
        align: "left"
      }
    ],
    rowStyle: ({ index }) =>
      index === 4 && {
        background: "#EFF4FE"
      }
  }
}

export function TablePattern(props): Override {
  return {
    rowStyle: ({ index }) => ({
      background: index % 2 === 1 ? "transparent" : "#f0f0f0"
    })
  }
}
