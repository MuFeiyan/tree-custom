import Tree from "./components/tree/index.js";
const components = [Tree];

const install = function (Vue) {
  components.forEach((component) => {
    Vue.component(component.name, component);
  });
};

/* istanbul ignore if */
if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}
export default {
  install,
  Tree,
};
