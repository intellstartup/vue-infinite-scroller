import InfiniteScroller from './InfiniteScroller.vue'
import { VueConstructor } from 'vue'

export { InfiniteScroller }

export default function install(Vue: VueConstructor): void {
  Vue.component('infinite-scroller', InfiniteScroller)
}

declare const window: any
if (typeof window !== 'undefined' && typeof window.Vue === 'function') {
  window.Vue.use(install)
}
