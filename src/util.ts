import type { ListenerObject } from './index.js'
import Debug from '@substrate-system/debug'
const debug = Debug()

type DropRecord = Record<string, File|Uint8Array>

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

// export function handleItems (items:DataTransferItemList):ExpandedDrop {
//     let rootDir:ExpandedDrop

//     for (let i = 0; i < items.length; i++) {
//         const item = items[i].webkitGetAsEntry()
//         if (item?.isFile) {
//             rootDir = processItem(item)
//         } else if (item?.isDirectory) {
//             rootDir = processItem(item)
//         }
//     }

//     if (!rootDir!) throw new Error('not root dir')
//     return rootDir
// }

export async function flatten (list:FileList) {
    const zippable = await Array.from(list).reduce(async (_acc, file) => {
        const acc = await _acc
        acc[file.webkitRelativePath] = new Uint8Array(await file.arrayBuffer())

        return acc
    }, Promise.resolve({}) as Promise<Record<string, Uint8Array>>)

    return zippable
}

export async function handleDrop (ev:DragEvent) {
    ev.preventDefault()

    if (!ev.dataTransfer?.items) return

    for (const item of Array.from(ev.dataTransfer.items)) {
        if (item.kind === 'file') {
            const entry = await item.webkitGetAsEntry()

            if (entry?.isDirectory) {
                const fileList = await getFilesFromDirectory(entry as FileSystemDirectoryEntry)
                console.log(fileList) // Array of File objects
            }
        }
    }
}

// export function processItem (
//     item:FileSystemEntry,
//     parent?:Record<string, any> & { files:File[] }
// ):DropRecord {
//     const parentDir:{ files:File[] } = parent || { files: [] }
//     const files = []

//     debug('the entry', item)

//     if (item.isFile) {
//         // Handle file
//         (item as FileSystemFileEntry).file((file) => {
//             parentDir.files.push(file)
//         })
//     } else if (item.isDirectory) {
//         // Handle directory
//         const name = (item as FileSystemDirectoryEntry).name
//         parentDir[name] = { files: [] }

//         const reader = (item as FileSystemDirectoryEntry).createReader()
//         reader.readEntries((entries) => {
//             entries.forEach((entry) => {
//                 // mutate the parent object each time we recurse
//                 processItem(entry, parentDir[name])
//             })
//         })
//     }

//     return parentDir
// }

async function getFilesFromDirectory (directoryEntry: FileSystemDirectoryEntry): Promise<File[]> {
    const fileList: File[] = []

    const reader = directoryEntry.createReader()
    const readEntries = (): Promise<void> => {
        return new Promise((resolve) => {
            reader.readEntries(async (entries) => {
                for (const entry of entries) {
                    if (entry.isFile) {
                        const file = await getFileFromEntry(entry as FileSystemFileEntry)
                        fileList.push(file)
                    } else if (entry.isDirectory) {
                        const subFiles = await getFilesFromDirectory(entry as FileSystemDirectoryEntry)
                        fileList.push(...subFiles)
                    }
                }
                if (entries.length > 0) {
                    await readEntries()
                } else {
                    resolve()
                }
            })
        })
    }

    await readEntries()
    return fileList
}

async function getFileFromEntry (fileEntry: FileSystemFileEntry): Promise<File> {
    return new Promise((resolve) => {
        fileEntry.file(resolve)
    })
}
