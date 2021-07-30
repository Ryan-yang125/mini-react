import { wipFiber, hookIndex } from "../cre";
export function useState(initialValue: any) {
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
