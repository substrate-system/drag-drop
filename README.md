# drag drop
![tests](https://github.com/substrate-system/drag-drop/actions/workflows/nodejs.yml/badge.svg)
[![types](https://img.shields.io/npm/types/@substrate-system/drag-drop?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![Common Changelog](https://nichoth.github.io/badge/common-changelog.svg)](./CHANGELOG.md)
[![install size](https://flat.badgen.net/packagephobia/install/@substrate-system/drag-drop?cache-control=no-cache)](https://packagephobia.com/result?p=@substrate-system/drag-drop)
[![dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen.svg?style=flat-square)](package.json)
[![license](https://img.shields.io/badge/license-Polyform_Non_Commercial-26bc71?style=flat-square)](LICENSE)

Simplify the [drag & drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API). Pass in a callback function, get drop events with a flat object of paths and files.

Inspired by [feross/drag-drop](https://github.com/feross/drag-drop) -- drag & drop usable by humans.

[See a live demo](https://substrate-system.github.io/drag-drop/)

<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [install](#install)
- [Module format](#module-format)
  * [ESM](#esm)
  * [Common JS](#common-js)
  * [pre-built JS](#pre-built-js)
- [Get started](#get-started)
  * [CSS](#css)
- [API](#api)
  * [types](#types)
  * [Functions](#functions)
  * [Directories](#directories)
  * [Hidden files](#hidden-files)
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
This exposes ESM and common JS via the [package.json `exports` field](https://nodejs.org/api/packages.html#exports).

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

----------------------------------------------------------------------

## Get started
This exposes a single function, `dragDrop`. Pass in a callback function, and get data objects containing all the files or directories that were dropped. By default the callback will not see any [hidden files (dot files)](https://en.wikipedia.org/wiki/Hidden_file_and_hidden_directory#Unix_and_Unix-like_environments). Pass in another argument with `{ showHiddenFiles: true }` if you do want to see hidden files.

```js
import { dragDrop, type DropRecord } from '@substrate-system/drag-drop'

// pass in an element or a CSS query selector
dragrop('.dropper',  (drop:DropRecord, { pos, files }) => {
  console.log('drop position', pos)
  // => { x: 100, y: 200 }

  // drop a folder or file
  console.log('the dropped files', drop)

  // we get the FileList object from the event too
  console.log('the file list', files)
}, { showHiddenFiles: true })  // <-- third argument is optional
```

### CSS
When someone hovers and drops something, a class `.drag` is added to the drop target.

```css
.drag {
  border: 5px solid red;
}
```

-------------------------------------------------------------------------

## API

### types

#### `DropRecord`
A map from path name to file object.
```ts
type DropRecord = Record<string, File|Uint8Array>
```

##### example

```js
{ '/abc/123': aFile }
```

#### `Listener`

```ts
type Listener = (dropped:DropRecord, opts:{
    pos:{ x:number, y:number };
    files:FileList;
})=>any
```

#### `ListenerObject`
```ts
type ListenerObject = {
    onDrop:Listener;
    onDropText?:(text:string, pos:{ x, y })=>any;
    onDragEnter?:(event:DragEvent)=>any;
    onDragOver?:(event:DragEvent)=>any;
    onDragLeave?:(event:DragEvent)=>any;
}
```

### Functions
A single function, `dragDrop`, that takes an element, a listener, an an options object.

The third argument has a property `showHiddenFiles`, which if `true` will callback with all files, including ones that start with `.`. By default is `false`.

#### `dragDrop`
```ts
function dragDrop (
    elem:HTMLElement|string,
    listeners:Listener|ListenerObject,
    opts?:{ showHiddenFiles?:boolean }
):void
```

### Directories
Drop a folder, get a flat object containing the files mapped by their path names.

Given a folder structure like this:
```
abc
├── aaaaa
│   └── bbb
│       └── testbbb.txt
└── test.txt

3 directories, 2 files
```

If we drop the top folder, `abc` into the drop zone, then we get an object like this:
```js
{
    "/abc/aaaaa/bbb/testbbb.txt": File,
    "/abc/test.txt": File
}
```

#### Example

```js
import { dragDrop, type DropRecord } from '@substrate-system/drag-drop'

dragDrop('.dropzone', (drop:DropRecord, { pos } => {
  debug('the drop', drop)

  // =>
  // {
  //   "/abc/aaaaa/bbb/testbbb.txt": {},
  //   "/abc/test2.txt": {},
  //   "/abc/test.txt": {}
  // }
}
```

### Hidden files
Pass in an options object with `{ showHiddenFiles: true }` to get results including dot files. By default this will **exclude hidden files** from the results.

#### Example

```js
import { dragDrop } from '@substrate-system/drag-drop'

dragDrop('.dropzone', (dropRecord) => {
  debug('including hidden files...', dropRecord)

  // =>
  // {
  //   "/abc/.DS_Store": {},
  //   "/abc/aaaaa/.DS_Store": {},
  //   "/abc/aaaaa/bbb/testbbb.txt": {},
  //   "/abc/test2.txt": {},
  //   "/abc/test.txt": {}
  // }
}, { showHiddenFiles: true })
```

The returned object is a flat record with path names pointing at `File` objects.


### Files
Drop a single file, get an object with just the one file:

```js
{
    "/test.txt": File
}
```

## test
Do manual testing, because it is difficult to mock the drop events.

### Start a local example server

```sh
npm start
```
