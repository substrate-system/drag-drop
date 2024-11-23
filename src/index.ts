import {
    isEventHandleable,
    addDragClass,
    removeDragClass,
    handleItems
} from './util'
// import Debug from '@bicycle-codes/debug'
// const debug = Debug()

export interface ExpandedDropInterface {
    [key:string]:ExpandedDropInterface;
}

export type ExpandedDrop = ExpandedDropInterface & {
    files:File[]
}

export type Listener = (expandedDrop:ExpandedDrop, { pos }:{
    pos:{ x:number, y:number }
})=>any

export type ListenerObject = {
    onDrop:(
        epxandedDrop:ExpandedDrop,
        { pos }:{ pos:{ x:number, y:number } }
    )=>any;
    onDropText?:(text:string, pos:{ x, y })=>any;
    onDragEnter?:(event:DragEvent)=>any;
    onDragOver?:(event:DragEvent)=>any;
    onDragLeave?:(event:DragEvent)=>any;
}

export function dragDrop (elem:HTMLElement|string, listeners:Listener|ListenerObject) {
    let el:HTMLElement|null
    if (typeof elem === 'string') {
        const selector = elem
        el = document.querySelector(elem)
        if (!el) {
            throw new Error(`"${selector}" does not match any HTML elements`)
        }
    } else {
        el = elem
    }

    if (!el) {
        throw new Error(`"${elem}" is not a valid HTML element`)
    }

    let isEntered = false
    let numIgnoredEnters = 0

    let listenerObject:ListenerObject
    if (typeof listeners === 'function') {
        listenerObject = { onDrop: listeners }
    } else {
        listenerObject = listeners
    }

    el.addEventListener('dragenter', onDragEnter, false)
    el.addEventListener('dragover', onDragOver, false)
    el.addEventListener('dragleave', onDragLeave, false)
    el.addEventListener('drop', onDrop, false)

    function onDragEnter (event:DragEvent) {
        event.stopPropagation()
        event.preventDefault()

        if (!isEventHandleable(event, listenerObject)) return

        if (isEntered) {
            numIgnoredEnters += 1
            return false  // early return
        }

        isEntered = true

        if (listenerObject.onDragEnter) {
            listenerObject.onDragEnter(event)
        }

        addDragClass(el!)

        return false
    }

    function onDragOver (ev:DragEvent) {
        ev.stopPropagation()
        ev.preventDefault()

        if (!isEventHandleable(ev, listenerObject)) return

        if (listenerObject.onDragOver) {
            listenerObject.onDragOver(ev)
        }

        ev.dataTransfer!.dropEffect = 'copy'

        return false
    }

    function onDragLeave (event:DragEvent) {
        event.stopPropagation()
        event.preventDefault()

        if (!isEventHandleable(event, listenerObject)) return

        if (numIgnoredEnters > 0) {
            numIgnoredEnters -= 1
            return false
        }

        isEntered = false

        if (listenerObject.onDragLeave) {
            listenerObject.onDragLeave(event)
        }

        removeDragClass(el!)

        return false
    }

    async function onDrop (ev:DragEvent):Promise<boolean|undefined> {
        ev.stopPropagation()
        ev.preventDefault()

        if (listenerObject.onDragLeave) {
            listenerObject.onDragLeave(ev)
        }

        removeDragClass(el!)

        if (!ev.dataTransfer) {
            console.log('aaaaaaaaaaa')
            throw new Error('not dataTransfer')  // for TS
        }

        console.log('bbbbbbbbbbbbbbbbbbb')

        isEntered = false
        numIgnoredEnters = 0

        const pos:{ x:number, y:number } = {
            x: ev.clientX,
            y: ev.clientY
        }

        console.log('preeeeeeeeeeeeee expand')

        const expanded = handleItems(ev.dataTransfer.items)

        console.log('exxxxxxxxxxpand', expanded)

        listenerObject.onDrop(expanded, { pos })

        // text drop support
        const text:string = ev.dataTransfer.getData('text')
        if (text && listenerObject.onDropText) {
            listenerObject.onDropText(text, pos)
        }

        return false
    }
}
