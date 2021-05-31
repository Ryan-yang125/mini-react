const TEXT_ELEMENT = "TEXT_ELEMENT";
/**
 * @tutorial: before compile => JSX (<div id="foo"><p>hello</p><div>)
 * @tutorial: after babel => createElement("div",{id:"foo"}, createElement("p",null, "hello"))
 */
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

/**
 *
 */
function createTextElement(text) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

/**
 *
 */
function render(element, container) {
  const dom =
    element.type === TEXT_ELEMENT
      ? document.createTextNode("")
      : document.createElement(element.type);

  Object.keys(element.props)
    .filter((key) => key !== "children")
    .forEach((key) => {
      dom[key] = element.props[key];
    });

  element.props.children.forEach((child) => {
    render(child, dom);
  });

  container.appendChild(dom);
}

const Pre = {
  createElement,
  render,
};

export default Pre;
// TODO fix type bugs https://github.com/facebook/react/blob/master/packages/scheduler/src/SchedulerPriorities.js
// Step III: Concurrent Mode
