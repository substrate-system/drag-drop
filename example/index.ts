import { dragDrop, type DropRecord } from '../src/index.js'
import Debug from '@substrate-system/debug'
import './style.css'
const debug = Debug()

dragDrop('.dropzone', {
    onDrop: function (drop:DropRecord, { pos }) {
        debug('drop position', pos)
        debug('the dropped stuff...', drop)
    },

    onDropText: function (text, pos) {
        debug('onDropText: ' + text + ' at ' + pos.x + ', ' + pos.y)
    }
})

dragDrop('.dropzone', (dropRecord) => {
    debug('including hidden files...', dropRecord)
}, { showHiddenFiles: true })
