import * as React from "react"
import { Override, Data } from "framer"
import { url } from "framer/resource"

// Learn more: https://framer.com/docs/overrides/

const appState = Data({
    rows: [{ symbol: "MSFT", market: "NASDAQ", price: 180 }],
})

export function Table(props): Override {
    return {
        data: appState.rows,
    }
}

export function Add(props): Override {
    return {
        onTap() {
            appState.rows = [
                ...appState.rows,
                { symbol: "TSLA", market: "NASDAQ", price: 870 },
            ]
        },
    }
}

export function Remove(props): Override {
    return {
        onTap() {
            appState.rows = appState.rows.slice(0, appState.rows.length - 2)
        },
    }
}
