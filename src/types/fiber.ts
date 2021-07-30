export interface FiberTextNode {
    type: string
    props: {
        nodeValue: string
        children: []
    }
}

export interface FiberNode {
    type: string
    props: {
        children: FiberNode[] | FiberTextNode[]
    }
}
