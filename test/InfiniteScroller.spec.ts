import InfiniteScroller from '@/InfiniteScroller.vue'
import { shallowMount } from '@vue/test-utils'

describe('InfiniteScroller', () => {
  it('creates element', () => {
    const wrapper = shallowMount(InfiniteScroller)

    expect(wrapper.find('.infinite-scroller').exists()).toBe(true)
  })
})
