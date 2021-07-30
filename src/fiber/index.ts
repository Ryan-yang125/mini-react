import { FiberNode, FiberTextNode, TEXT_ELEMENT } from '../types'

export function createElement(type: string, props: Object, ...children: []): FiberNode {
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

export function createTextElement(text: string): FiberTextNode {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  };
}