import { test } from '@bicycle-codes/tapzero'
import { dragDrop } from '../src/index.js'

test('drag drop', (t) => {
    dragDrop(document.getElementById('drop-target')!, ev => {
        console.log('event', ev)
    })

    t.ok(true, "doesn't throw")
})
