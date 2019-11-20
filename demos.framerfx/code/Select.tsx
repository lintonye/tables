import * as React from "react"
import { Frame, addPropertyControls, ControlType } from "framer"

// Open Preview: Command + P
// Learn more: https://framer.com/api

export function Select(props) {
  const { options, onChange, ...rest } = props

  return (
    <select
      style={{ width: "100%", fontSize: 18 }}
      onChange={e => typeof onChange === "function" && onChange(e.target.value)}
    >
      {options.map(o => (
        <option value={o} key={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

Select.defaultProps = {
  height: 25,
  width: 100,
  text: "Get started!",
  tint: "#0099ff"
}

// Learn more: https://framer.com/api/property-controls/
addPropertyControls(Select, {
  options: {
    title: "Options",
    type: ControlType.Array,
    defaultValue: [],
    propertyControl: {
      type: ControlType.String
    }
  }
})
