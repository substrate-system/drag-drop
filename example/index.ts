import { dragDrop } from '../src/index.js'
import Debug from '@bicycle-codes/debug'
const debug = Debug()

dragDrop('.dropper', {
    onDrop: function (expandedDrop, { pos }) {
        debug('drop position', pos)
        debug('expanded drop...', expandedDrop)
    },

    onDropText: function (text, pos) {
        debug('onDropText: ' + text + ' at ' + pos.x + ', ' + pos.y)
    }
})
