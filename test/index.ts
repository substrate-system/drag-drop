import { test } from '@substrate-system/tapzero'
import { dom } from '@substrate-system/dom'
import { dragDrop } from '../src/index.js'

/**
 * Do manual testing for this, b/c it is difficult to mock the drop events.
 */

test('drag drop', async (t) => {
    t.plan(1)
    const el = dom.byId('drop-target')!

    dragDrop(el, ev => {
        console.log('drop event', ev)
    })

    t.ok(true, "deosn't throw")
})
