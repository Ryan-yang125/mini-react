interface PropsFilter {
    (key: string): boolean
};

interface FiberNodeFilter {
    (...props: any[]): PropsFilter
};

export const isEvent: PropsFilter = (key) => key.startsWith("on");
export const isProps: PropsFilter = (key) => key !== "children" && !isEvent(key);
export const isRemoved: FiberNodeFilter = (next) => (key) => !(key in next);
export const isNew: FiberNodeFilter = (prev, next) => (key) => prev[key] !== next[key];