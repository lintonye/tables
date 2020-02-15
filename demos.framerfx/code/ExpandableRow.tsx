import * as React from "react";
import { Override } from "framer";
import { FlightRow, Caret, FlightDetail } from "./canvas";

export function TableGoogleFlights(): Override {
  return {
    showDefaultColumns: false,
    columns: [
      {
        id: "info",
        Cell: ({ row: { original } }) => (
          <FlightRow
            {...original}
            times={`${original.startTime} - ${original.endTime}`}
            airports={`${original.departure} - ${original.arrival}`}
            stops={`${original.stops} stops`}
            price={"$" + original.price}
            logo={`https://www.gstatic.com/flights/airline_logos/70px/${
              original.airline === "Alaska" ? "AS" : "AC"
            }.png`}
            position="relative"
          />
        ),
      },
      {
        id: "expander",
        Cell: ({ row }) => (
          <span {...row.getExpandedToggleProps()}>
            <Caret
              position="relative"
              animate={{ rotate: row.isExpanded ? -180 : 0 }}
            />
          </span>
        ),
      },
    ],
    subRow: (
      <FlightDetail
        position="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
    ),
    rowProps: { positionTransition: { duration: 0.2 } },
  };
}
