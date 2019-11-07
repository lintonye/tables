import * as React from "react"
import { Frame, addPropertyControls, ControlType, RenderTarget } from "framer"
import { useTable } from "react-table"
import { PhotoCell } from "./canvas"
import styled from "styled-components"
import * as defaultData from "./defaultData.json"

const Styles = styled.div`
  width: 100%;
  background: ${({ fill }) => fill};
  font-size: ${({ fontSize }) => fontSize}px;
  color: ${({ color }) => color};
  table {
    width: 100%;
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`
function GridThumbnail({ size = 24 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className="feather feather-grid"
      viewBox="0 0 24 24"
    >
      <path d="M3 3H10V10H3z"></path>
      <path d="M14 3H21V10H14z"></path>
      <path d="M14 14H21V21H14z"></path>
      <path d="M3 14H10V21H3z"></path>
    </svg>
  )
}

function TableUI({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  })

  // Render the UI for your table
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()} align={column.align}>
                {column.render("Header")}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                console.log(cell)

                return (
                  <td {...cell.getCellProps()} align={cell.column.align}>
                    {cell.render("Cell")}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function createColumns(data, columnsOverride = []) {
  if (Array.isArray(data) && data.length > 0) {
    // infer columns from the first row
    const row = data[0]
    const defaultColumn = accessor => ({
      Header: accessor,
      accessor,
      align: Number.isFinite(row[accessor]) ? "right" : "left"
    })
    return Array.isArray(columnsOverride)
      ? [
          ...columnsOverride.map(c => ({
            ...defaultColumn(c.accessor),
            ...c
          })),
          ...Object.keys(row)
            .filter(
              key => columnsOverride.findIndex(c => c.accessor === key) < 0
            )
            .map(defaultColumn)
        ]
      : Object.keys(row).map(defaultColumn)
  }
  return []
}

function useCanvasOverride(props) {
  const { canvasOverride, overrideFunctionName, ...rest } = props
  const [overrideProps, setOverrideProps] = React.useState()
  React.useEffect(() => {
    async function loadModule() {
      try {
        const m = await import(`./${canvasOverride}`)
        const overrideFun = m[overrideFunctionName]
        if (typeof overrideFun === "function") {
          setOverrideProps(overrideFun())
        }
      } catch (e) {
        console.log("Failed to load canvas override", e)
      }
    }
    loadModule()
  }, [canvasOverride, overrideFunctionName])
  return overrideProps ? { ...rest, ...overrideProps } : rest
}

export function Table(props) {
  const { dataUrl, columns, ...rest } = useCanvasOverride(props)
  const [data, setData] = React.useState<String | Array<Object>>(defaultData)
  React.useEffect(() => {
    async function loadData() {
      setData("loading")
      const response = await fetch(dataUrl)
      const d = await response.json()
      setData(d)
    }
    dataUrl && loadData()
  }, [dataUrl])
  const mergedColumns = React.useMemo(() => createColumns(data, columns), [
    data,
    columns
  ])
  return RenderTarget.current() === RenderTarget.thumbnail ? (
    <GridThumbnail size={400} />
  ) : data === "loading" ? (
    <div>Loading...</div>
  ) : (
    <Styles {...rest}>
      <TableUI columns={mergedColumns} data={data} />
    </Styles>
  )
}

Table.defaultProps = {
  width: 600,
  height: 400
}

// Learn more: https://framer.com/api/property-controls/
addPropertyControls(Table, {
  dataUrl: {
    title: "Data",
    type: ControlType.File,
    allowedFileTypes: ["json"]
  },
  fill: {
    title: "Fill",
    type: ControlType.Color,
    defaultValue: "transparent"
  },
  fontSize: {
    title: "Font size",
    type: ControlType.Number,
    min: 8,
    max: 60,
    defaultValue: 12
  },
  color: {
    title: "Text",
    type: ControlType.Color,
    defaultValue: "black"
  },
  canvasOverride: {
    title: "Canvas Override",
    type: ControlType.String,
    defaultValue: "App"
  },
  overrideFunctionName: {
    title: "Override function",
    type: ControlType.String,
    defaultValue: "Table"
  }
})
