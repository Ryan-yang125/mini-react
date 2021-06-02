const TEXT_ELEMENT = "TEXT_ELEMENT";
const TAG_PLACE = "TAG_PLACE";
const TAG_DELETE = "TAG_DELETE";
const TAG_UPDATE = "TAG_UPDATE";

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

function createTextElement(text) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createDom(fiber) {
  const dom =
    fiber.type === TEXT_ELEMENT
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

// filters
const isEvent = (key) => key.startsWith("on");
const isProps = (key) => key !== "children" && !isEvent(key);
const isRemoved = (next) => (key) => !(key in next);
const isNew = (prev, next) => (key) => prev[key] !== next[key];

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;
  if (fiber.tag === TAG_PLACE && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.tag === TAG_UPDATE && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.tag === TAG_DELETE) {
    commitDeletion(fiber, domParent);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

function updateDom(dom, prevProps, nextProps) {
  // remove old or changed listener
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((key) => {
      const evenType = key.toLowerCase().substring(2);
      dom.removeEventListener(evenType, prevProps[key]);
    });

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

  // add new eventlistenr
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((key) => {
      const evenType = key.toLowerCase().substring(2);
      dom.addEventListener(evenType, nextProps[key]);
    });
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

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;

function workloop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    // commit phase when diff finished
    commitRoot();
  }
  window.requestIdleCallback(workloop);
}

window.requestIdleCallback(workloop);

function performUnitOfWork(fiber) {
  const isFunctionComponent = typeof fiber.type === "function";
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  // 3. return next unit of work
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

let wipFiber = null;
let hookIndex = -1;

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  fiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function useState(initialValue) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initialValue,
    queue: [],
  };
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    if (typeof action === "function") {
      hook.state = action(hook.state);
    } else {
      hook.state = action;
    }
  });

  const setState = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex += 1;
  return [hook.state, setState];
}

function updateHostComponent(fiber) {
  // 1. Add dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  // 2. create fibers
  reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(wipFiber, elements) {
  let prevSibling = null;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let i = 0;
  while (i < elements.length || oldFiber) {
    const element = elements[i];
    let newFiber = null;
    // diff element and oldFilber
    let sameType = oldFiber && element && oldFiber.type === element.type;
    if (sameType) {
      // update
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        parent: wipFiber,
        alternate: oldFiber,
        dom: oldFiber.dom,
        tag: TAG_UPDATE,
      };
    }
    if (element && !sameType) {
      // place
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        alternate: null,
        dom: null,
        tag: TAG_PLACE,
      };
    }
    if (oldFiber && !sameType) {
      // delete
      oldFiber.tag = TAG_DELETE;
      deletions.push(oldFiber);
    }
    // move to next silbing
    // TODO use key
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (i === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    i++;
  }
}

const Cre = {
  createElement,
  render,
  useState,
};

export default Cre;
// TODO fix type bugs https://github.com/facebook/react/blob/master/packages/scheduler/src/SchedulerPriorities.js
// Step VII: Function Components
