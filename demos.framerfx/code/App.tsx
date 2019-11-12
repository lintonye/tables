import * as React from "react"
import { Override, Data, RenderTarget } from "framer"
import { AvatarCell, Checkbox, CheckboxChecked } from "./canvas"

export function TableMultiField(props): Override {
  return {
    columns: [
      { accessor: "id", show: false },
      { accessor: "firstName", show: false },
      { accessor: "lastName", show: false },
      { accessor: "gender", show: false },
      { accessor: "age", show: false },
      { accessor: "avatar", show: false },
      {
        accessor: "names",
        Header: "Who",
        Cell: ({
          row: {
            original: { firstName, lastName, avatar, age, gender }
          }
        }) => (
          <AvatarCell
            firstName={firstName + " " + lastName}
            avatar={avatar}
            age={age + ""}
            gender={gender === "Male" ? "♂" : "♀"}
            position="relative"
          />
        )
      },
      { accessor: "email", Header: "Email" }
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

const appState = Data({
  selectedIndex: RenderTarget.current() === RenderTarget.canvas ? 4 : -1
})
export function TableCheckboxes(props): Override {
  return {
    columns: [
      {
        accessor: "id",
        Header: null,
        Cell: ({ row: { index } }) =>
          index === appState.selectedIndex ? (
            <CheckboxChecked position="relative" />
          ) : (
            <Checkbox position="relative" />
          ),
        align: "left"
      }
    ],
    rowProps: ({ index }) => ({
      initial: {
        backgroundColor: "#FFF"
      },
      animate: {
        backgroundColor: index === appState.selectedIndex ? "#EFF4FE" : "#FFF"
      },
      whileHover: {
        backgroundColor: "#F1FFFE"
      },
      style: { cursor: "pointer" },
      onClick: () => (appState.selectedIndex = index)
    })
  }
}

export function TablePattern(props): Override {
  return {
    rowProps: ({ index }) => ({
      style: {
        background: index % 2 === 1 ? "transparent" : "#f0f0f0"
      }
    })
  }
}

const hoverData = Data({ hoveredIndex: -1 })
export function TableHoverActions(props): Override {
  return {
    columns: [
      { accessor: "symbol" },
      { accessor: "market" },
      { accessor: "price" },
      { accessor: "id", show: false },
      {
        accessor: "actions",
        Header: null,
        Cell: ({ row: { index } }) => (
          <div style={{ width: 80 }}>
            {index === hoverData.hoveredIndex && (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  cursor: "pointer"
                }}
              >
                <span>🗑</span>
                <span>✋</span>
                <span>💾</span>
              </div>
            )}
          </div>
        )
      }
    ],
    rowProps: ({ index }) => ({
      onMouseEnter: () => (hoverData.hoveredIndex = index)
    })
  }
}
