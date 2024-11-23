import type { ExpandedDrop, ListenerObject } from './index.js'
// import Debug from '@bicycle-codes/debug'
// const debug = Debug()

export function isEventHandleable (
    event:DragEvent,
    listeners:ListenerObject
):boolean {
    if (!event.dataTransfer) return false

    if (event.dataTransfer.items || event.dataTransfer.types) {
        // Only add "drag" class when `items` contains items that are able
        // to be handled by the registered listeners (files vs. text)
        const items = Array.from(event.dataTransfer.items)
        const types = Array.from(event.dataTransfer.types)

        let fileItems
        let textItems
        if (items.length) {
            fileItems = items.filter(item => { return item.kind === 'file' })
            textItems = items.filter(item => { return item.kind === 'string' })
        } else if (types.length) {
            // event.dataTransfer.items is empty during 'dragover' in Safari,
            // so use event.dataTransfer.types as a fallback
            fileItems = types.filter(item => item === 'Files')
            textItems = types.filter(item => item.startsWith('text/'))
        } else {
            return false
        }

        if (!('onDropText' in listeners)) {
            return false
        }

        if (fileItems.length === 0 && !listeners.onDropText) return false
        if (textItems.length === 0 && !listeners.onDrop) return false
        if (fileItems.length === 0 && textItems.length === 0) return false

        return true
    }
    return false
}

export function addDragClass (el:HTMLElement) {
    el.classList.add('drag')
}

export function removeDragClass (el:HTMLElement) {
    el.classList.remove('drag')
}

export async function getDirectoryContents (dir:FileSystemDirectoryEntry) {
    const reader = dir.createReader()
    reader.readEntries(entries => {
        for (const entry of entries) {
            if (entry.isDirectory) {
                getDirectoryContents(entry as FileSystemDirectoryEntry)
            }
        }
    })
}

export function handleItems (items:DataTransferItemList):ExpandedDrop {
    let rootDir:ExpandedDrop
    for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry()
        if (item?.isFile) {
            rootDir = processItem(item)
        } else if (item?.isDirectory) {
            rootDir = processItem(item)
        }
    }

    if (!rootDir!) throw new Error('not root dir')

    return rootDir
}

function processItem (
    item:FileSystemEntry,
    parent?:Record<string, any> & { files:File[] }
):({ files:File[] } & Record<string, any>) {
    const parentDir:{ files:File[] } = parent || { files: [] }

    if (item.isFile) {
        // Handle file
        (item as FileSystemFileEntry).file((file) => {
            parentDir.files.push(file)
        })
    } else if (item.isDirectory) {
        // Handle directory
        const name = (item as FileSystemDirectoryEntry).name
        parentDir[name] = { files: [] }

        const reader = (item as FileSystemDirectoryEntry).createReader()
        reader.readEntries((entries) => {
            entries.forEach((entry) => {
                // mutate the parent object each time we recurse
                processItem(entry, parentDir[name])
            })
        })
    }

    return parentDir
}

export async function getFileFromEntry (entry:FileSystemFileEntry):Promise<File> {
    return new Promise((resolve, reject) => {
        entry.file(resolve, reject)
    })
}
