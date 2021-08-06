const reactionsMap = {};
let currentlyRenderingComponent;

const handler = {
  get(target, key) {
    if (typeof currentlyRenderingComponent === "undefined") {
      return target[key];
    }
    if (!reactionsMap[key]) {
      reactionsMap[key] = [currentlyRenderingComponent];
    }
    const hasComponent = reactionsMap[key].find(
      comp => comp.ID === currentlyRenderingComponent.ID
    );
    if (!hasComponent) {
      reactionsMap[key].push(currentlyRenderingComponent);
    }
    return target[key];
  },
  set(target, key, value) {
    // TODO
    // reactionsMap[key].forEach(component => component.forceUpdate());
    target[key] = value;
    return true;
  }
}
export function store(obj) {
  return new Proxy(obj, handler)
}

export function view(component) {
  return class Observer extends component {
    ID = `${Math.floor(Math.random() * 10e9)}`;

    render() {
      currentlyRenderingComponent = this;
      const renderValue = super.render();
      currentlyRenderingComponent = undefined;
      return renderValue;
    }
  };
}