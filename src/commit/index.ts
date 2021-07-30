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