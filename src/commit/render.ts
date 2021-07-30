import { FiberNode, TEXT_ELEMENT } from '../types'
import { isEvent, isProps, isRemoved, isNew} from '../utils/filter'

interface UpdateDom {
    (dom: HTMLElement | Text, prevProps: any, nextProps: any): void
}

const updateDom: UpdateDom = (dom, prevProps, nextProps) {
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
        dom[key] = ""
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

export function createDom(fiber: FiberNode): HTMLElement | Text  {
    const dom =
      fiber.type === TEXT_ELEMENT
        ? document.createTextNode("")
        : document.createElement(fiber.type);
  
    updateDom(dom, {}, fiber.props);
  
    return dom;
}

