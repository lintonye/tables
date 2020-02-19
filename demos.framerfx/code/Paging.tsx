import * as React from "react"
import { Override, Data } from "framer"

// Learn more: https://framer.com/docs/overrides/

const pagedTableData = Data({
    pageSize: 10,
    pageIndex: 0,
    pageCount: 0,
})

export function PageInfo(props): Override {
    return {
        text: `Page ${pagedTableData.pageIndex + 1} of ${
            pagedTableData.pageCount
        }`,
    }
}

export function TablePaged(props): Override {
    return {
        pageSize: pagedTableData.pageSize,
        pageIndex: pagedTableData.pageIndex,
        onPageChange: ({ pageCount }) => (pagedTableData.pageCount = pageCount),
    }
}

export function NextPage(props): Override {
    return {
        whileHover: { backgroundColor: "#EEE" },
        onTap: () => {
            pagedTableData.pageIndex = Math.min(
                pagedTableData.pageIndex + 1,
                pagedTableData.pageCount - 1
            )
        },
    }
}

export function PreviousPage(props): Override {
    return {
        whileHover: { backgroundColor: "#EEE" },
        onTap: () =>
            (pagedTableData.pageIndex = Math.max(
                pagedTableData.pageIndex - 1,
                0
            )),
    }
}

export function PageSize(props): Override {
    return {
        onChange: v => {
            //@ts-ignore
            pagedTableData.pageSize = Number.parseInt(v)
        },
    }
}
