import type { ListenerObject } from './index.js'
import Debug from '@bicycle-codes/debug'
const debug = Debug()

export function expand () {
    debug('expanding')
}

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

// export async function getFileFromEntry (entry:FileSystemFileEntry):Promise<File> {
//     return new Promise((resolve, reject) => {
//         entry.file(resolve, reject)
//     })
// }

// // export type Directory = Record<string, any|Directory> & {
// //     [files:string]:File[]
// // };

// interface DirectoryInterface {
//     files:File[];
// }

// export type Directory = DirectoryInterface & Record<string, Directory>

// async function expandDir (
//     dir:FileSystemDirectoryEntry,
//     parent?:{ files:File[] } & Record<string, DirectoryInterface>
// ):Promise<{ files:File[] }> {
//     const _parent:{ files:File[] } = parent || { files: [] }
//     const dirReader = dir.createReader()
//     while (true) {
//         const results = await new Promise((resolve, reject) => {
//             dirReader.readEntries(resolve, reject)
//         })

//         debug('ressultsttttttt', results)

//         if (!(results as FileSystemEntry[]).length) break
//     }

//     dirReader.readEntries(async entries => {
//         for (const entry of entries) {
//             debug('the sub entry...', entry)
//             if (entry.isDirectory) {
//                 _parent[entry.name] = { files: [] }
//                 return expandDir(
//                     entry as FileSystemDirectoryEntry,
//                     _parent[entry.name]
//                 )
//             } else if (entry.isFile) {
//                 _parent.files.push(await getFileFromEntry(entry as FileSystemFileEntry))
//                 return _parent
//             }
//         }
//     })

//     return _parent
// }

// // export async function expand (
// //     entries:(FileSystemDirectoryEntry|FileSystemFileEntry)[],
// // ):Promise<(File|Directory)[]> {
// //     return Promise.all(entries.map(async entry => {
// //         debug('the entry up here', entry)
// //         if (entry.isDirectory) {
// //             return await expandDir(entry as FileSystemDirectoryEntry)
// //         } else if (entry.isFile) {
// //             return await getFileFromEntry(entry as FileSystemFileEntry)
// //         }
// //     }))
// // }

// export async function expand (
//     entries:(FileSystemDirectoryEntry|FileSystemFileEntry)[],
//     parent?:Directory
// ):Promise<(Directory|File)[]> {
//     const _parent:Directory = parent || { files: [] } as Directory

//     const arr = await Promise.all(entries.map(entry => {
//         // if (entry instanceof FileSystemDirectoryEntry) {
//         // } else if (entry instanceof FileSystemFileEntry) {

//         // }
//     }))

//     return new Promise((resolve, reject) => {
//         if (entry.isDirectory) {
//             const dirReader = (entry as FileSystemDirectoryEntry).createReader()
//             debug('is dir up here................', entry.name)

//             dirReader.readEntries(async entries => {
//                 debug('entries', entries)
//                 for (const entry of entries) {
//                     if (entry.isDirectory) {
//                         debug('is down below', entry.name)
//                         _parent[entry.name] = { files: [] }
//                         return resolve(expand(
//                             entry as FileSystemDirectoryEntry,
//                             _parent[entry.name]
//                         ))
//                     } else if (entry.isFile) {
//                         _parent.files?.push(
//                             await getFileFromEntry(entry as FileSystemFileEntry)
//                         )
//                         return resolve(expand(
//                             entry as FileSystemFileEntry,
//                             _parent
//                         ))
//                     }
//                 }

//                 return resolve(_parent)
//             }, err => {
//                 debug('err', err)
//                 return reject(err)
//             })
//         } else if (entry.isFile) {
//             getFileFromEntry(entry as FileSystemFileEntry).then(file => {
//                 _parent.files?.push(file)
//                 return resolve(_parent)
//             }).catch(err => {
//                 return reject(err)
//             })
//         }
//     })
// }
