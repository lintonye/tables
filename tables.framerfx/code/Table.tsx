import * as React from "react"
import { Frame, addPropertyControls, ControlType, RenderTarget } from "framer"
import { useTable } from "react-table"
import styled, { css } from "styled-components"
import * as defaultData from "./defaultData.json"
import * as Papa from "papaparse"

const Styles = styled.div`
  ${({
    fill,
    fontSize,
    color,
    headerColor,
    headerBgColor,
    headerFontSize,
    headerDividerWidth,
    headerDividerColor,
    borderWidth,
    borderColor,
    dividerType,
    dividerWidth,
    dividerColor,
    padding,
    cellBorderRadius,
    gap
  }) => css`
    width: 100%;
    background: ${fill};
    font-size: ${fontSize}px;
    color: ${color};
    table {
      width: 100%;
      border-spacing: ${gap}px;
      border: ${borderWidth}px solid ${borderColor};
      tr {
        :last-child {
          td {
            border-bottom: 0;
          }
        }
      }
      th {
        color: ${headerColor};
        background: ${headerBgColor};
        font-size: ${headerFontSize}px;
      }
      th,
      td {
        margin: 0;
        padding: ${padding}px;
        border-radius: ${cellBorderRadius}px;
        border-bottom: ${dividerType === "vertical" ? 0 : dividerWidth}px solid
          ${dividerColor};
        border-right: ${dividerType === "horizontal" ? 0 : dividerWidth}px solid
          ${dividerColor};

        :last-child {
          border-right: 0;
        }
      }
      th {
        border-bottom: ${headerDividerWidth}px solid ${headerDividerColor};
      }
    }
  `}
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
                // console.log(cell)

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
  const [overrideProps, setOverrideProps] = React.useState(null)
  React.useEffect(() => {
    async function loadModule() {
      try {
        setOverrideProps("loading")
        const m = await import(`./${canvasOverride}`)
        const overrideFun = m[overrideFunctionName]
        setOverrideProps(
          typeof overrideFun === "function" ? overrideFun() : null
        )
      } catch (e) {
        console.log(
          `Failed to load canvas override, file=${canvasOverride} funName=${overrideFunctionName}`,
          e
        )
        setOverrideProps(null)
      }
    }
    loadModule()
  }, [canvasOverride, overrideFunctionName])
  return [
    overrideProps === "loading",
    overrideProps !== null && overrideProps !== "loading"
      ? { ...rest, ...overrideProps }
      : rest
  ]
}

function useLoadConvertedData(dataUrl, rowConverter) {
  const [data, setData] = React.useState(null)
  React.useEffect(() => {
    async function loadData() {
      let finalData = defaultData
      if (dataUrl) {
        const response = await fetch(dataUrl)
        if (dataUrl.endsWith(".json")) {
          const d = await response.json()
          finalData = d
        } else {
          //parse as csv
          const results = Papa.parse(await response.text(), {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
          })
          finalData = results.data
        }
      }
      setData(
        typeof rowConverter === "function" && Array.isArray(finalData)
          ? finalData.map(rowConverter)
          : finalData
      )
    }
    loadData()
  }, [dataUrl, rowConverter])
  return data
}

function TableWithData(props) {
  const { dataUrl, columns, preset, rowConverter, ...rest } = props
  const data = useLoadConvertedData(dataUrl, rowConverter)

  const mergedColumns = React.useMemo(() => createColumns(data, columns), [
    data,
    columns
  ])
  return data === null ? (
    <div>Loading data...</div>
  ) : (
    <Styles {...rest}>
      <TableUI columns={mergedColumns} data={data} />
    </Styles>
  )
}

function TableOnCanvas(props) {
  const [loadingModules, mergedProps] = useCanvasOverride(props)

  return loadingModules ? (
    <div>Loading...</div>
  ) : (
    <TableWithData {...mergedProps} />
  )
}

function Table(props) {
  return RenderTarget.current() === RenderTarget.thumbnail ? (
    <GridThumbnail size={400} />
  ) : (
    <TableOnCanvas {...props} />
  )
}

export function TableClassic(props) {
  return <Table {...props} />
}

export function TableContrastHeading(props) {
  return <Table {...props} />
}

export function TableClean(props) {
  return <Table {...props} />
}

export function TableMinimal(props) {
  return <Table {...props} />
}

export const Presets = {
  classic: {
    component: TableClassic,
    fill: "transparent",
    fontSize: 12,
    color: "black",
    headerFontSize: 12,
    headerColor: "black",
    headerBgColor: "#f7f7fa",
    headerDividerWidth: 1,
    headerDividerColor: "#d2cfd8",
    borderWidth: 1,
    borderColor: "#d2cfd8",
    dividerType: "both",
    dividerWidth: 1,
    dividerColor: "#d2cfd8",
    padding: 8,
    gap: 0,
    cellBorderRadius: 0
  },
  "contrast-heading": {
    component: TableContrastHeading,
    fill: "transparent",
    fontSize: 14,
    color: "black",
    headerFontSize: 14,
    headerColor: "#FFF",
    headerBgColor: "#7755CC",
    headerDividerWidth: 1,
    headerDividerColor: "#d2cfd8",
    borderWidth: 0,
    borderColor: "#d2cfd8",
    dividerType: "both",
    dividerWidth: 0,
    dividerColor: "#d2cfd8",
    padding: 10,
    gap: 6,
    cellBorderRadius: 6
  },
  clean: {
    component: TableClean,
    fill: "transparent",
    fontSize: 14,
    color: "black",
    headerFontSize: 12,
    headerColor: "black",
    headerBgColor: "transparent",
    headerDividerWidth: 2,
    headerDividerColor: "#888398",
    borderWidth: 0,
    borderColor: "#d2cfd8",
    dividerType: "horizontal",
    dividerWidth: 1,
    dividerColor: "#d2cfd8",
    padding: 8,
    gap: 0,
    cellBorderRadius: 0
  },
  minimal: {
    component: TableMinimal,
    fill: "transparent",
    fontSize: 14,
    color: "black",
    headerFontSize: 12,
    headerColor: "#9a99a2",
    headerBgColor: "transparent",
    headerDividerWidth: 0,
    headerDividerColor: "#888398",
    borderWidth: 0,
    borderColor: "#d2cfd8",
    dividerType: "horizontal",
    dividerWidth: 0,
    dividerColor: "#d2cfd8",
    padding: 8,
    gap: 0,
    cellBorderRadius: 0
  }
}

function setDefaultValue(preset, propertyControls) {
  Object.keys(preset).forEach(p => {
    const propControl = propertyControls[p]
    if (propControl) {
      propControl.defaultValue = preset[p]
    }
  })
  return propertyControls
}

Object.keys(Presets).forEach(k => {
  const preset = Presets[k]
  preset.component.defaultProps = {
    width: 600,
    height: 400
  }
  addPropertyControls(
    preset.component,
    setDefaultValue(preset, {
      dataUrl: {
        title: "Data",
        type: ControlType.File,
        allowedFileTypes: ["json", "csv"]
      },
      //   preset: {
      //     title: "Preset",
      //     type: ControlType.Enum,
      //     options: Object.keys(Presets)
      //   },
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
      headerFontSize: {
        title: "Header Font",
        type: ControlType.Number,
        min: 8,
        max: 60,
        defaultValue: 12
      },
      headerColor: {
        title: "Header FG",
        type: ControlType.Color,
        defaultValue: "black"
      },
      headerBgColor: {
        title: "Header BG",
        type: ControlType.Color,
        defaultValue: "transparent"
      },
      headerDividerWidth: {
        title: "Header Divider",
        type: ControlType.Number,
        min: 0,
        max: 4,
        defaultValue: 1
      },
      headerDividerColor: {
        title: "Header Divider",
        type: ControlType.Color,
        defaultValue: "#DDD"
      },
      borderWidth: {
        title: "Border",
        type: ControlType.Number,
        min: 0,
        max: 4,
        defaultValue: 1
      },
      borderColor: {
        title: "Border",
        type: ControlType.Color,
        defaultValue: "#DDD"
      },
      dividerType: {
        title: "Divider",
        type: ControlType.Enum,
        options: ["both", "horizontal", "vertical"],
        defaultValue: "both"
      },
      dividerWidth: {
        title: "Divider",
        type: ControlType.Number,
        min: 0,
        max: 4,
        defaultValue: 1
      },
      dividerColor: {
        title: "Divider",
        type: ControlType.Color,
        defaultValue: "#DDD"
      },
      padding: {
        title: "Padding",
        type: ControlType.Number,
        min: 0,
        max: 40,
        step: 2,
        defaultValue: 8
      },
      gap: {
        title: "Gap",
        type: ControlType.Number,
        min: 0,
        max: 40,
        step: 2,
        defaultValue: 0
      },
      cellBorderRadius: {
        title: "Radius",
        type: ControlType.Number,
        min: 0,
        max: 40,
        defaultValue: 0
      },
      canvasOverride: {
        title: "Canvas Override",
        type: ControlType.String,
        defaultValue: "App"
      },
      overrideFunctionName: {
        title: "Override function",
        type: ControlType.String
        // defaultValue: "Table"
      }
    })
  )
})
