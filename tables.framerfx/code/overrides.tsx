import { componentLoader } from "framer";

let modules = null;
// let _overrideFileNames = []

// const overrides = componentLoader
//   .componentIdentifiers()
//   .map(id => componentLoader.componentForIdentifier(id))
//   .filter(component => component.type === "override")
//   .map(c => c.class);

// alert(overrides[0]);

const visited = new Set();
function findKey(root, keyNameRegex, path, result) {
  if (typeof root === "object" && root !== null && !visited.has(root)) {
    visited.add(root);
    Object.keys(root)
      .filter(k => k.match(keyNameRegex))
      .forEach(k => result.push({ key: `${path}.${k}` }));
    Object.keys(root).forEach(k =>
      findKey(root[k], keyNameRegex, `${path}.${k}`, result)
    );
  }
}

function debug() {
  visited.clear();
  const userScriptKeys = [];
  findKey(window.Vekter, /.*Override.*/, `window.Vekter`, userScriptKeys);
  alert(userScriptKeys.map(e => JSON.stringify(e)).join("\n"));
}
// alert(typeof window.Vekter);

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

export function getOverride(fileName, functionName) {
  // initOverrides();
  const comp = componentLoader.componentForIdentifier(
    `${fileName}_${functionName}`
  );

  return (
    comp &&
    comp.type === "override" &&
    typeof comp.class === "function" &&
    comp.class
  );
}

export function getOverrideByComponentId(componentId) {
  const regex = /^(\w+)(\.\/[\w\.]+)?/;
  const match = componentId.match(regex);
  if (match) {
    const node = window.Vekter.engine.tree.get(match[1]);
    // alert(window.Vekter.engine.tree.idToNode)
    // alert("id=" + componentId + " node=" + node)
    if (node) {
      // alert(Object.keys(node).join("\n"));
      const { codeOverrideFile, codeOverrideName } = node;
      return getOverride(codeOverrideFile, codeOverrideName);
    }
  }
}
