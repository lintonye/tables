import * as React from "react";
import {
  addPropertyControls,
  ControlType,
  RenderTarget,
  motion,
  AnimatePresence,
} from "framer";
import { useTable, Row, useExpanded, usePagination } from "react-table";
import styled, { css } from "styled-components";
import * as defaultData from "./defaultData.json";
import * as Papa from "papaparse";
import { getOverrideByComponentId } from "./overrides";

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
    gap,
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
`;
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
  );
}

function getRowProps(row: Row, rowProps) {
  switch (typeof rowProps) {
    case "object":
      return rowProps;
    case "function":
      return rowProps(row);
  }
}

function useInitialPageOptions(setPageSize, gotoPage, pageSize, pageIndex) {
  React.useEffect(() => {
    setPageSize(pageSize);
  }, [pageSize, setPageSize]);
  React.useEffect(() => {
    gotoPage(pageIndex);
  }, [pageIndex, pageSize, gotoPage]);
}

function TableUI({
  header,
  columns,
  data,
  rowProps,
  renderSubRow,
  pageSize,
  pageIndex,
  onPageChange,
}) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    flatColumns,

    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    // state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 10 },
    },
    useExpanded,
    usePagination
  );
  useInitialPageOptions(setPageSize, gotoPage, pageSize, pageIndex);
  React.useEffect(() => {
    typeof onPageChange === "function" &&
      onPageChange({ pageIndex, pageCount, pageSize });
  }, [onPageChange, pageCount, pageIndex, pageSize]);
  // Render the UI for your table
  return (
    <table {...getTableProps()}>
      {header && (
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
      )}
      <tbody {...getTableBodyProps()}>
        {page.map(row => {
          prepareRow(row);
          return (
            <>
              <motion.tr {...row.getRowProps()} {...getRowProps(row, rowProps)}>
                {row.cells.map(cell => {
                  return (
                    <td {...cell.getCellProps()} align={cell.column.align}>
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </motion.tr>
              {row.isExpanded && (
                <tr>
                  <td colSpan={flatColumns.length}>{renderSubRow(row)}</td>
                </tr>
              )}
            </>
          );
        })}
      </tbody>
    </table>
  );
}

function createColumns(data, showDefaultColumns = true, columnsOverride = []) {
  if (Array.isArray(data) && data.length > 0) {
    // infer columns from the first row
    const row = data[0];
    const defaultColumn = accessor => ({
      Header: accessor,
      accessor,
      align: Number.isFinite(row[accessor]) ? "right" : "left",
    });
    return Array.isArray(columnsOverride)
      ? [
          ...columnsOverride.map(c => ({
            ...defaultColumn(c.accessor),
            ...c,
          })),
          ...(showDefaultColumns
            ? Object.keys(row)
                .filter(
                  key => columnsOverride.findIndex(c => c.accessor === key) < 0
                )
                .map(defaultColumn)
            : []),
        ]
      : Object.keys(row).map(defaultColumn);
  }
  return [];
}

function useLoadConvertedData(dataUrl, rowConverter) {
  const [data, setData] = React.useState(null);
  React.useEffect(() => {
    async function loadData() {
      let finalData = defaultData;
      if (dataUrl) {
        const response = await fetch(dataUrl);
        if (dataUrl.endsWith(".json")) {
          const d = await response.json();
          finalData = d;
        } else {
          //parse as csv
          const results = Papa.parse(await response.text(), {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
          });
          finalData = results.data;
        }
      }
      setData(
        typeof rowConverter === "function" && Array.isArray(finalData)
          ? finalData.map(rowConverter)
          : finalData
      );
    }
    loadData();
  }, [dataUrl, rowConverter]);
  return data;
}

function TableWithData(props) {
  const {
    data,
    dataUrl,
    columns,
    showDefaultColumns = true,
    preset,
    rowConverter,
    rowProps,
    header,
    subRow,
    pageSize,
    pageIndex,
    onPageChange,
    ...rest
  } = props;
  const dataFromUrl = useLoadConvertedData(dataUrl, rowConverter);

  const dataFinal = data || dataFromUrl;

  const mergedColumns = React.useMemo(
    () => createColumns(dataFinal, showDefaultColumns, columns),
    [dataFinal, columns]
  );
  return dataFinal === null ? (
    <div>Loading data...</div>
  ) : (
    <Styles {...rest}>
      <TableUI
        columns={mergedColumns}
        data={dataFinal}
        rowProps={rowProps}
        header={header}
        renderSubRow={row =>
          typeof subRow === "function" ? subRow(row) : subRow
        }
        pageSize={pageSize}
        pageIndex={pageIndex}
        onPageChange={onPageChange}
      />
    </Styles>
  );
}

function TableOnCanvas(props) {
  const override = getOverrideByComponentId(props.id);
  const mergedProps =
    typeof override === "function" ? { ...props, ...override() } : props;

  return <TableWithData {...mergedProps} />;
}
function TableInPreview(props) {
  return <TableWithData {...props} />;
}

function Table(props) {
  return RenderTarget.current() === RenderTarget.thumbnail ? (
    <GridThumbnail size={400} />
  ) : RenderTarget.current() === RenderTarget.canvas ? (
    <TableOnCanvas {...props} />
  ) : (
    <TableInPreview {...props} />
  );
}

export function TableClassic(props) {
  return <Table {...props} />;
}

export function TableContrastHeading(props) {
  return <Table {...props} />;
}

export function TableClean(props) {
  return <Table {...props} />;
}

export function TableMinimal(props) {
  return <Table {...props} />;
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
    cellBorderRadius: 0,
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
    cellBorderRadius: 6,
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
    cellBorderRadius: 0,
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
    cellBorderRadius: 0,
  },
};

function setDefaultValue(preset, propertyControls) {
  Object.keys(preset).forEach(p => {
    const propControl = propertyControls[p];
    if (propControl) {
      propControl.defaultValue = preset[p];
    }
  });
  return propertyControls;
}

Object.keys(Presets).forEach(k => {
  const preset = Presets[k];
  preset.component.defaultProps = {
    width: 600,
    height: 400,
  };
  addPropertyControls(
    preset.component,
    setDefaultValue(preset, {
      dataUrl: {
        title: "Data",
        type: ControlType.File,
        allowedFileTypes: ["json", "csv"],
      },
      //   preset: {
      //     title: "Preset",
      //     type: ControlType.Enum,
      //     options: Object.keys(Presets)
      //   },
      fill: {
        title: "Fill",
        type: ControlType.Color,
        defaultValue: "transparent",
      },
      fontSize: {
        title: "Font size",
        type: ControlType.Number,
        min: 8,
        max: 60,
        defaultValue: 12,
      },
      color: {
        title: "Text",
        type: ControlType.Color,
        defaultValue: "black",
      },
      header: {
        title: "Header",
        type: ControlType.Boolean,
        defaultValue: true,
      },
      headerFontSize: {
        title: "Header Font",
        type: ControlType.Number,
        min: 8,
        max: 60,
        defaultValue: 12,
        hidden: ({ header }) => !header,
      },
      headerColor: {
        title: "Header FG",
        type: ControlType.Color,
        defaultValue: "black",
        hidden: ({ header }) => !header,
      },
      headerBgColor: {
        title: "Header BG",
        type: ControlType.Color,
        defaultValue: "transparent",
        hidden: ({ header }) => !header,
      },
      headerDividerWidth: {
        title: "Header Divider",
        type: ControlType.Number,
        min: 0,
        max: 4,
        defaultValue: 1,
        hidden: ({ header }) => !header,
      },
      headerDividerColor: {
        title: "Header Divider",
        type: ControlType.Color,
        defaultValue: "#DDD",
        hidden: ({ header }) => !header,
      },
      borderWidth: {
        title: "Border",
        type: ControlType.Number,
        min: 0,
        max: 4,
        defaultValue: 1,
      },
      borderColor: {
        title: "Border",
        type: ControlType.Color,
        defaultValue: "#DDD",
      },
      dividerType: {
        title: "Divider",
        type: ControlType.Enum,
        options: ["both", "horizontal", "vertical"],
        defaultValue: "both",
      },
      dividerWidth: {
        title: "Divider",
        type: ControlType.Number,
        min: 0,
        max: 4,
        defaultValue: 1,
      },
      dividerColor: {
        title: "Divider",
        type: ControlType.Color,
        defaultValue: "#DDD",
      },
      padding: {
        title: "Padding",
        type: ControlType.Number,
        min: 0,
        max: 40,
        step: 2,
        defaultValue: 8,
      },
      gap: {
        title: "Gap",
        type: ControlType.Number,
        min: 0,
        max: 40,
        step: 2,
        defaultValue: 0,
      },
      cellBorderRadius: {
        title: "Radius",
        type: ControlType.Number,
        min: 0,
        max: 40,
        defaultValue: 0,
      },
      pageSize: {
        title: "Page Size",
        type: ControlType.Number,
        step: 10,
        min: 10,
        max: 100,
      },
      pageIndex: {
        title: "Page",
        type: ControlType.Number,
        min: 0,
      },
      // overrideFile: {
      //   title: "File",
      //   type: ControlType.String,
      //   defaultValue: "App"
      // },
      // overrideFunction: {
      //   title: "Override",
      //   type: ControlType.String
      //   // defaultValue: "Table"
      // }
    })
  );
});
