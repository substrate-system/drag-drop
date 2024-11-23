import Debug from '@bicycle-codes/debug'
import { dragDrop } from '../src/index.js'

const debug = Debug()

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
