// import { componentLoader } from "framer"

let modules = null
// let _overrideFileNames = []

function initOverrides() {
  if (modules === null && window.Vekter) {
    const bundleNames = [
      ...Object.keys(window.Vekter.engine.canvasStore.userScriptBundle)
    ]
    bundleNames
      .reverse()
      .forEach(n => eval(window.Vekter.engine.canvasStore.userScriptBundle[n]))
    // eval(window.Vekter.engine.canvasStore.userScriptBundle["index.js"])
    modules = module.exports.__framer__.sourceModules
  }
  // const modules = module.exports.__framer__.sourceModules
  // const appModule = modules["./App.tsx"]()
  // const TextFun = appModule["Text"]
  // alert(JSON.stringify(appModule.__info__[0]))
  // alert(model.exports)
}

// export function overrideFileNames() {
//   return modules
//     ? Object.keys(modules).filter(n => {
//         // const info = getModule(n).__info__
//         // return info && info.type === "override"
//         return true
//       })
//     : []
// }

// export function overrideFunctionNames(overrideFileName) {
//   // if (overrideFileName && modules) {
//   return Object.keys(getModule(overrideFileName))
//   // } else return []
// }

function getModule(overrideFileName) {
  // if (modules && overrideFileName) {
  const moduleFactory = modules[overrideFileName]
  return typeof moduleFactory === "function" && moduleFactory()
  // }
}

export function getOverride(fileName, functionName) {
  initOverrides()
  // if (modules && fileName && functionName) {
  const module = getModule(fileName)
  // alert(Object.keys(module))
  return module && module[functionName]
  // }
}

export function getOverrideByComponentId(componentId) {
  const regex = /^(\w+)(\.\/[\w\.]+)?/
  const match = componentId.match(regex)
  if (match) {
    const node = window.Vekter.engine.tree.get(match[1])
    // alert(window.Vekter.engine.tree.idToNode)
    // alert("id=" + componentId + " node=" + node)
    if (node) {
      const { codeOverrideFile, codeOverrideName } = node
      return getOverride(codeOverrideFile, codeOverrideName)
    }
  }
}
