import { test } from '@substrate-system/tapzero'
import { dom } from '@substrate-system/dom'
import { dragDrop, type DropRecord } from '../src/index.js'

/**
 * Do manual testing for this, b/c it is difficult to mock the drop events.
 */

test('setup', () => {
    document.body.innerHTML += `
        <div id="drop-target"></div>
    `
})

test('drag drop', async (t) => {
    t.plan(1)
    const el = dom.byId('drop-target')!

    dragDrop(el, ev => {
        console.log('drop event', ev)
    })

    t.ok(true, "deosn't throw")
})

/**
 * Dispatch a synthetic `drop` event carrying the given files and resolve
 * with the `DropRecord` that `dragDrop` reports.
 */
function dropFiles (el:HTMLElement, files:File[]):Promise<DropRecord> {
    const dt = new DataTransfer()
    for (const file of files) {
        dt.items.add(file)
    }

    return new Promise<DropRecord>((resolve) => {
        const cleanup = dragDrop(el, (record) => {
            cleanup()
            resolve(record)
        })

        el.dispatchEvent(new DragEvent('drop', {
            dataTransfer: dt,
            bubbles: true,
            cancelable: true
        }))
    })
}

test('synthetic single-file drop populates the record', async (t) => {
    t.plan(2)
    const el = dom.byId('drop-target')!
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })

    const dropped = await dropFiles(el, [file])

    t.equal(Object.keys(dropped).length, 1, 'record has one file')
    t.ok(dropped['/hello.txt'], 'record is keyed by file name')
})

test('synthetic multi-file drop captures every file', async (t) => {
    const names = ['a.txt', 'b.txt', 'c.txt']
    t.plan(1 + names.length)
    const el = dom.byId('drop-target')!
    const files = names.map(name => {
        return new File(['x'], name, { type: 'text/plain' })
    })

    const dropped = await dropFiles(el, files)

    t.equal(
        Object.keys(dropped).length,
        names.length,
        'record has every dropped file'
    )
    for (const name of names) {
        t.ok(dropped['/' + name], name + ' is present in the record')
    }
})

test('all done', () => {
    // @ts-expect-error tests
    window.testsFinished = true
})
