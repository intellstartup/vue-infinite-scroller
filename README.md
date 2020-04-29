# Infinity Scroller

A VueJS 2.6 infinite scrolling component

## Features

* Lightweight (only ~ 4kb gzipped)
* Ultra high performance reusing DOM elements
* Support variable height
* Support any scrollable container (inside body)

## Installation

```sh
npm install --save vue-infinity-scroller
```
You can install it globally from the default import:
```javascript
import Vue from 'vue'
import scroller from 'vue-infinity-scroller'
import from 'vue-infinity-scroller/dist/vue-infinity-scroller.cjs.css'

Vue.use(scroller)
```

Or locally using the named import:
```javascript
import { InfiniteScroller } from 'vue-infinity-scroller'

export default {
  components: {
    InfiniteScroller
  }
}
```
Don't forget to import the css then:

```css
@import '~vue-infinity-scroller/dist/vue-infinity-scroller.cjs'
```

## Getting Started

### Basic usage

```html
<infinite-scroller :items="items">
  <template slot-scope="{ item }">{{ item }}</template>
</infinite-scroller>
```

| :exclamation |  The component must be contained in (or be itself) a scrollable container by having a height and `overflow` with values `scroll` or `auto`|
|--------------|-------------------------------------------------------------------------------------------------------------------------------------------|

### Dynamic content
The component has a `@load-more` event that is called when the scroll approaches it's end and property `has-more` is set to `true`. The payload sent by the event is the index of the first needed element (i.e. the size of the `items` array):

```html
<infinite-scroller :items="items" :has-more="hasMore" @load-more="loadMore">
  <template slot-scope="{ item }">{{ item }}</template>
</infinite-scroller>
```

## Properties

| Prop     | Type    | Default  | Description                               |
| -------- | ------- | ---------| ----------------------------------------- |
| items    | Array   | `[]`     | Array of items to be iterated on the list |
| has-more | Boolean | `false`  | Flag to inform the container that there are more items to be loaded
| threshold | Number or Array | `[50, 10]` | The number of items to be loaded before and after the ones visible on the list (*if the value is a number, it will be converter to an array with the same number repeated twice*) |
| tag      | String  | `"div"`  | The tag name to be used for the container |
| item-tag | String  | `"div"`  | The tag name to be used for the items     |

## Events
| Event | Payload | Description |
| ----- | ------- | ------------|
| load-more | `from: Number` | Called when the list is `{ threshold }` items close to it's end.

## Slots
| Slot name | Scope           | Default    | Description                        |
| --------- | --------------- | ---------- | ---------------------------------- |
| default   | `{ item: Any }` | -          | each item being loaded on the list |
| loading   | -               | Loading... | the item with a loading message at the end of the list

# Contributing
1. Fork this repository.
2. Create new branch with feature name.
3. Run `npm install` and `npm run play`.
4. Create your feature.
5. Commit and set commit message with feature name and description.
6. Push your code to your fork repository.
7. Create pull request. 😃

## License

This project is licensed under [MIT License](http://en.wikipedia.org/wiki/MIT_License)
