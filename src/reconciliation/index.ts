function updateFunctionComponent(fiber) {
    wipFiber = fiber;
    hookIndex = 0;
    fiber.hooks = [];
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
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