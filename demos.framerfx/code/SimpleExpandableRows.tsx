import * as React from "react"
import { Override, Data } from "framer"

export function Table(props): Override {
    return {
        columns: [
            {
                accessor: "expander",
                Header: "",
                Cell: ({ row }) => (
                    <div {...row.getExpandedToggleProps()}>
                        {row.isExpanded ? "-" : "+"}
                    </div>
                ),
            },
        ],
        subRow: row => <div>Detailed info for {row.original.symbol}</div>,
    }
}
