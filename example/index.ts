import Debug from '@bicycle-codes/debug'
import { getFileFromEntry, handleItems } from '../src/util.js'
import { dragDrop } from '../src/index.js'

const debug = Debug()

const el = document.querySelector('.dropper') as HTMLElement
el.addEventListener('drop', async (ev:DragEvent) => {
    const fileList = ev.dataTransfer!.files
    debug('files', fileList)
    ev.preventDefault()

    const items = Array.from(ev.dataTransfer!.items).map(item => {
        return item.webkitGetAsEntry()
    })

    debug('items', items)

    // const file = await getFileFromEntry(items[0] as FileSystemFileEntry)
    // debug('got the file', file)

    const res = handleItems(ev.dataTransfer!.items)
    debug('resssssssss', res)
})

dragDrop('.dropper', {
    onDrop: function (filesOrDirs, { pos, fileList }) {
        debug('drop position', pos)

        filesOrDirs.forEach((file) => {
            debug('a file or directory.....', file)
        })
        debug('FileList object', fileList)
    },

    onDropText: function (text, pos) {
        debug('onDropText: ' + text + ' at ' + pos.x + ', ' + pos.y)
    }
})
