import type { ListenerObject } from './index.js'
import Debug from '@substrate-system/debug'
const debug = Debug()

/**
 * An object with file paths as keys.
 */
export type DropRecord = Record<string, File|Uint8Array>

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

export async function handleItems (
    items:DataTransferItemList,
    showHiddenFiles:boolean = false
):Promise<DropRecord> {
    debug('handling it', showHiddenFiles)
    let files:DropRecord = {}
    for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry()
        debug('fullpath', item?.fullPath)
        debug('the pop', item?.fullPath.split('/').pop())
        if (item?.fullPath.split('/').pop()?.startsWith('.')) {
            if (!showHiddenFiles) continue
        }

        if (item?.isFile) {
            const file = await getFileFromEntry(item as FileSystemFileEntry)
            files[item.fullPath] = file
        } else if (item?.isDirectory) {
            files = await getFilesFromDirectory(
                item as FileSystemDirectoryEntry,
                null,
                showHiddenFiles
            )
        }
    }

    return files
}

/**
 * Recursively mutate the given `files` record, returning all files in an
 * object with the file path as key.
 */
async function getFilesFromDirectory (
    directoryEntry:FileSystemDirectoryEntry,
    files?:DropRecord|null,
    showHiddenFiles:boolean = false
):Promise<DropRecord> {
    files = files || {}

    const reader = directoryEntry.createReader()
    const entries = await new Promise<FileSystemEntry[]>((resolve) => {
        reader.readEntries(resolve)
    })

    for (const entry of entries) {
        if (entry.isFile) {
            const isHidden = entry.fullPath.split('/').pop()?.startsWith('.')
            if (isHidden && !showHiddenFiles) continue

            const _entry = entry as FileSystemFileEntry
            const file = await getFileFromEntry(_entry)
            files[_entry.fullPath] = file
        } else {
            // is directory
            await getFilesFromDirectory(
                entry as FileSystemDirectoryEntry,
                files,
                showHiddenFiles
            )
        }
    }

    return files
}

/**
 * Given a `FileSystemFileEntry`, return the `File`.
 *
 * @param {FileSystemFileEntry} fileEntry
 * @returns {Promise<File>}
 */
export async function getFileFromEntry (
    fileEntry:FileSystemFileEntry
):Promise<File> {
    return new Promise((resolve) => {
        fileEntry.file(resolve)
    })
}
