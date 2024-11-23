# drag drop
![tests](https://github.com/substrate-system/drag-drop/actions/workflows/nodejs.yml/badge.svg)
[![types](https://img.shields.io/npm/types/@substrate-system/drag-drop?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![Common Changelog](https://nichoth.github.io/badge/common-changelog.svg)](./CHANGELOG.md)
[![install size](https://flat.badgen.net/packagephobia/install/@substrate-system/drag-drop?cache-control=no-cache)](https://packagephobia.com/result?p=@substrate-system/drag-drop)
[![dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen.svg?style=flat-square)](package.json)
[![license](https://img.shields.io/badge/license-Polyform_Non_commercial-26bc71)](LICENSE)

Simplify the [drag & drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API). Get drop events with an object matching the folder structure that was dropped.

Inspired by [feross/drag-drop](https://github.com/feross/drag-drop) -- drag & drop usable by humans.

[See a live demo](https://substrate-system.github.io/drag-drop/)

<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [install](#install)
- [Module format](#module-format)
  * [ESM](#esm)
  * [Common JS](#common-js)
  * [pre-built JS](#pre-built-js)
  * [Get started](#get-started)
- [API](#api)
  * [Directories](#directories)
  * [Files](#files)
- [test](#test)
  * [Start a local example server](#start-a-local-example-server)

<!-- tocstop -->

</details>

## install

```sh
npm i -S @substrate-system/drag-drop
```

## Module format

This exposes ESM and common JS via [package.json `exports` field](https://nodejs.org/api/packages.html#exports).

### ESM
```js
import { dragDrop } from '@substrate-system/drag-drop'
```

### Common JS
```js
const { dragDrop } = require('@substrate-system/drag-drop')
```

### pre-built JS
This package exposes minified JS files too. Copy them to a location that is
accessible to your web server, then link to them in HTML.

#### copy
```sh
cp ./node_modules/@substrate-system/drag-drop/dist/index.min.js ./public/drag-drop.min.js
```

#### HTML
```html
<script type="module" src="./drag-drop.min.js"></script>
```

### Get started
This exposes a single function, `dragDrop`. Pass in a callback function, and get data objects containing all the files or directories that were dropped.

```js
dragDrop('.dropper', {  // <-- pass in an element or a string selector
    onDrop: function (expandedDrop, { pos }) {
        console.log('drop position', pos)
        // => { x: 100, y: 200 }

        // drop a folder
        console.log('expanded drop...', expandedDrop)
        // => {
        //   abc: {  // <-- the folder name we dropped
        //     files: [filesHere]  // <-- an array of File objects in the folder
        //     def: {  // <-- a sub-folder
        //       files: [moreFiles]  // <-- files inside the sub-folder
        //     }
        //   },
        // }

        // drop some files
        console.log('expanded drop', expandedDrop)
        // => {
        //   files: [file]
        // }
    },
})
```

## API

### Directories
Given a folder structure like this:
```
abc
├── aaaaa
│   └── bbb
│       └── testbbb.txt
└── test.txt

3 directories, 2 files
```

If we drop the top folder, `abc` into the drop zone, then we get a recursive object like this:
```js
{
    abc: {  // <-- the root folder name we dropped
        aaaaa: {  // <-- a sub-folder
            bbb: {
                files: ['testbbb.txt']
            },
            files: []  // <-- files inside the sub-folder
        },
        files: ['test.txt']  // <-- an array of File objects in the root folder
    },
    files: []
}
```

### Files
If you drop a single file, you will get an object containing a `files` array with a single item.

```js
{
    files: [yourFile]
}
```

## test
Do manual testing, because it was difficult to mock the drop events.

### Start a local example server

```sh
npm start
```
