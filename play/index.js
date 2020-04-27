import FixedHeight from './scenarios/FixedHeight.vue'
import InfiniteScroller from '../src/InfiniteScroller.vue'
import Vue from 'vue'
import { play } from 'vue-play'

Vue.component('infinite-scroller', InfiniteScroller)

play('InfiniteScroller')
  .add('Normal', {
    template: `
    <infinite-scroller></infinite-scroller>
  `,
    data() {
      return {}
    }
  })
  .add('Fixed height', h => h(FixedHeight))
