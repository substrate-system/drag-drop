import {
    isEventHandleable,
    addDragClass,
    removeDragClass,
    expand,
    handleItems
} from './util'
import Debug from '@bicycle-codes/debug'
const debug = Debug()

export type Listener = (
    filesOrDirs:Directory,
    { pos, fileList, directories }:{
        pos?:{ x:number, y:number },
        fileList?:FileList,
        directories?
    }
)=>any

export type ListenerObject = {
    onDrop:(
        filesOrDirs:Directory,
        { pos, fileList }:{
            pos:{ x:number, y:number },
            fileList:FileList,
        }
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

        if (!ev.dataTransfer) throw new Error('not dataTransfer')

        if (listenerObject.onDragLeave) {
            listenerObject.onDragLeave(ev)
        }

        removeDragClass(el!)

        const fileList = ev.dataTransfer.files

        isEntered = false
        numIgnoredEnters = 0

        const pos:{ x:number, y:number } = {
            x: ev.clientX,
            y: ev.clientY
        }

        // const handle = ev.dataTransfer.items[0].webkitGetAsEntry()

        const items = Array.from(ev.dataTransfer.items).map(item => {
            return item.webkitGetAsEntry()
        })

        const expanded = await expand(
            items as (FileSystemDirectoryEntry|FileSystemFileEntry)[]
        )

        // Array.from(ev.dataTransfer.items).forEach(async item => {
        //     debug('an item..........', item)
        //     const handle = await item.webkitGetAsEntry()
        //     const expanded = await expand(handle as FileSystemFileEntry |
        //         FileSystemDirectoryEntry)

        //     debug('handleeeeeeeeeeeeeeeeeeeeeeeeeee', handle)
        //     debug('expandeddddddddddddddddddddd', expanded)
        // })

        // const parent = { files: [] }
        // const expanded = await expand(Array.from(ev.dataTransfer.items), parent)

        listenerObject.onDrop(expanded, { pos, fileList })

        // text drop support
        const text:string = ev.dataTransfer.getData('text')
        if (text && listenerObject.onDropText) {
            listenerObject.onDropText(text, pos)
        }

        // File drop support. The `dataTransfer.items` API supports directories,
        // so we use it instead of `dataTransfer.files`, even though it's much
        // more complicated to use.
        // See: https://github.com/feross/drag-drop/issues/39
        // if (ev.dataTransfer.items) {
        //     const filesOrDirs = (await processItems(
        //         ev.dataTransfer.items
        //     ))?.filter(Boolean)

        //     if (!filesOrDirs) return
        //     if (filesOrDirs.length === 0) return

        //     const fileList = ev.dataTransfer.files

        //     listenerObject.onDrop(filesOrDirs, { pos, fileList })
        // }

        return false
    }
}

// async function processItems (
//     items:DataTransferItemList,
// ):Promise<(File|FileSystemDirectoryEntry|null)[]|null> {
//     if (items.length === 0) {
//         return null
//     }

//     debug('processing', items)

//     // Handle directories in Chrome using the proprietary FileSystem API
//     // const fileItems = Array.from(items).filter(item => {
//     //     return item.kind === 'file'
//     // })

//     // const filesOrDirectories = await Promise.all(Array.from(items).map(file => {
//     //     debug('iterating...', file.getAsFile())
//     //     debug('iterating...', file.webkitGetAsEntry())
//     //     return processEntry(file.webkitGetAsEntry()!)
//     // }))

//     // if (!filesOrDirectories) return null

//     // return filesOrDirectories.flat()
// }

// async function processEntry (
//     entry:FileSystemEntry
// ):Promise<File[]|FileSystemDirectoryEntry[]|null> {
//     debug('the entry', entry)
//     if (entry.isFile) {
//         const fileFromEntry = await getFileFromEntry(entry as FileSystemFileEntry)
//         debug('got the file', fileFromEntry)
//         return [fileFromEntry]
//     } else if (entry.isDirectory) {
//         const dirs = await getDirectoriesFromEntry(entry as FileSystemDirectoryEntry)
//         debug('got the dirs', dirs)
//         return dirs
//     }

//     return null
// }
