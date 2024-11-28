import { dragDrop } from '../src/index.js'
import Debug from '@substrate-system/debug'
const debug = Debug()

dragDrop('.dropper', {
    onDrop: function (drop, { pos }) {
        debug('drop position', pos)
        debug('the dropped stuff...', drop)
    },

    onDropText: function (text, pos) {
        debug('onDropText: ' + text + ' at ' + pos.x + ', ' + pos.y)
    }
})
