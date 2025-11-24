import {
    isEventHandleable,
    addDragClass,
    removeDragClass,
    handleItems,
    type DropRecord
} from './util'

export type { DropRecord }

export type Listener = (dropped:DropRecord, opts:{
    pos:{ x:number, y:number };
    files:FileList;
})=>any

export type ListenerObject = {
    onDrop?:Listener;
    onDropText?:(text:string, pos:{ x, y })=>any;
    onDragEnter?:(event:DragEvent)=>any;
    onDragOver?:(event:DragEvent)=>any;
    onDragLeave?:(event:DragEvent)=>any;
}

/**
 * Listen for drop events on an element. Get a nice flat object of files that
 * were dropped.
 *
 * @returns A cleanup function that removes all event listeners
 * @throws {Error} If the given string selector does not match anything.
 */
export function dragDrop (
    elem:HTMLElement|string,
    listeners:Listener|ListenerObject,
    opts?:{ showHiddenFiles?:boolean }
):()=>void {
    const showHidden = opts?.showHiddenFiles ?? false
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

    function onDragEnter (ev:DragEvent) {
        ev.stopPropagation()
        ev.preventDefault()

        if (!isEventHandleable(ev, listenerObject)) return

        if (isEntered) {
            numIgnoredEnters += 1
            return false  // early return
        }

        isEntered = true

        if (listenerObject.onDragEnter) {
            listenerObject.onDragEnter(ev)
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
            throw new Error('not dataTransfer')  // for TS
        }

        isEntered = false
        numIgnoredEnters = 0

        const pos:{ x:number, y:number } = {
            x: ev.clientX,
            y: ev.clientY
        }

        const record = await handleItems(ev.dataTransfer.items, showHidden)
        listenerObject.onDrop?.(record, { pos, files: ev.dataTransfer.files })

        // text drop support
        const text:string = ev.dataTransfer.getData('text')
        if (text && listenerObject.onDropText) {
            listenerObject.onDropText(text, pos)
        }

        return false
    }

    return () => {
        el!.removeEventListener('dragenter', onDragEnter, false)
        el!.removeEventListener('dragover', onDragOver, false)
        el!.removeEventListener('dragleave', onDragLeave, false)
        el!.removeEventListener('drop', onDrop, false)
    }
}
