const TEXT_ELEMENT = "TEXT_ELEMENT";
const TAG_PLACE = "TAG_PLACE";
const TAG_DELETE = "TAG_DELETE";
const TAG_UPDATE = "TAG_UPDATE";
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

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  if (fiber.tag === TAG_PLACE && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.tag === TAG_UPDATE && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.tag === TAG_DELETE) {
    domParent.removeChild(fiber.dom);
  }
}

function updateDom(dom, prevProps, nextProps) {
  // filters
  const isEvent = (key) => key.startsWith("on");
  const isProps = (key) => key !== "children" && !isEvent(key);
  const isRemoved = (next) => (key) => !(key in next);
  const isNew = (prev, next) => (key) => prev[key] !== next[key];

  // remove old props
  Object.keys(prevProps)
    .filter(isProps)
    .filter(isRemoved(nextProps))
    .forEach((key) => {
      dom[key] = "";
    });
  // update or add new props
  Object.keys(nextProps)
    .filter(isProps)
    .filter(isNew(prevProps, nextProps))
    .forEach((key) => {
      dom[key] = nextProps[key];
    });
}

function workloop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workloop);
}

function performUnitOfWork(fiber) {
  // 1. Add dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  if (fiber.parent) {
    // move to commit
    // fiber.parent.dom.appendChild(fiber.dom);
  }
  // 2. create fibers
  reconcileChildren(fiber, fiber.props.children);
  // 3. return next unit of work
  if (fiber.child) {
    return fiber.child;
  }
  let nextSibling = fiber;
  while (nextSibling) {
    if (nextSibling.sibling) {
      return nextSibling.sibling;
    }
    nextSibling = nextSibling.parent;
  }
}

function reconcileChildren(wipFiber, elements) {
  let prevSibling = null;
  let oldFilber = wipFiber.alternate && wipFiber.alternate.child;
  let i = 0;
  while (i < elements.length || oldFilber !== null) {
    const element = elements[i];
    let newFilber = null;
    // compare element and oldFilber
    let sameType = oldFilber && element && oldFilber.type === element.type;
    if (element && sameType) {
      // update
      newFilber = {
        type: oldFilber.type,
        props: element.props,
        parent: wipFiber,
        alternate: oldFilber,
        dom: oldFilber.dom,
        tag: TAG_UPDATE,
      };
    } else if (element && !sameType) {
      // replace
      newFilber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        alternate: null,
        dom: null,
        tag: TAG_PLACE,
      };
    } else if (oldFilber && !sameType) {
      // delete
      oldFilber.tag = TAG_DELETE;
      deletions.push(oldFilber);
    }

    i++;
  }
}
/**
 *
 */
function createDom(fiber) {
  const dom =
    element.type === TEXT_ELEMENT
      ? document.createTextNode("")
      : document.createElement(element.type);

  Object.keys(element.props)
    .filter((key) => key !== "children")
    .forEach((key) => {
      dom[key] = element.props[key];
    });

  return dom;
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  nextUnitOfWork = wipRoot;
  deletions = [];
}

requestIdleCallback(workloop);

const Pre = {
  createElement,
  render,
};

export default Pre;
// TODO fix type bugs https://github.com/facebook/react/blob/master/packages/scheduler/src/SchedulerPriorities.js
