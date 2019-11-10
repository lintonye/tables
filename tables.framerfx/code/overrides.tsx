let modules = null
// let _overrideFileNames = []

export function initOverrides() {
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

export function overrideFileNames() {
  return modules
    ? Object.keys(modules).filter(n => {
        // const info = getModule(n).__info__
        // return info && info.type === "override"
        return true
      })
    : []
}

export function overrideFunctionNames(overrideFileName) {
  // if (overrideFileName && modules) {
  return Object.keys(getModule(overrideFileName))
  // } else return []
}

function getModule(overrideFileName) {
  // if (modules && overrideFileName) {
  const moduleFactory = modules[overrideFileName]
  return moduleFactory()
  // }
}

export function getOverride(fileName, functionName) {
  // if (modules && fileName && functionName) {
  const module = getModule(fileName)
  // alert(Object.keys(module))
  return module[functionName]
  // }
}
