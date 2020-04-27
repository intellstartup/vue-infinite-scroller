<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import getScrollableParent from './utils/getScrollableParent'

@Component({
  name: 'infinite-scroller'
})
export default class InfiniteScroller extends Vue {
  @Prop({ type: String, default: () => 'div' })
  private readonly tag!: string

  @Prop({ type: Array, default: () => [] })
  private readonly items!: any[]

  @Prop({ type: Boolean, default: true })
  private readonly hasMore!: boolean

  private isInit: boolean = false

  private isLoading: boolean = false

  private isSelfContained: boolean = false

  private scroller!: HTMLElement

  private itemsMetadata: any[] = []

  private scrollHeight: number = 0

  async mounted() {
    this.init()
  }

  async getScroller() {
    if (!this.$el) {
      await this.$nextTick()
      await this.getScroller()
      return
    }

    this.scroller = getScrollableParent(this.$el as HTMLElement, false, true)
  }

  async init() {
    if (this.isInit) {
      return
    }

    await this.$nextTick()
    await this.getScroller()

    this.isSelfContained = this.scroller === this.$el
    this.scroller.addEventListener('scroll', this.onScroll.bind(this))
    this.scroller.classList.add('infinite-scroller__scroller')

    if (getComputedStyle(this.scroller).position === 'static') {
      this.scroller.style.position = 'relative'
    }

    this.isInit = true
  }

  onScroll() {}
}
</script>

<template>
  <div
    class="infinite-scroller"
    :class="{ 'infinite-scroller--self-contained': isSelfContained }"
  >
    <div
      v-for="(item, index) in items"
      :key="index"
      class="infinite-scroller__item"
    >
      <slot :item="item"></slot>
    </div>
    <div
      v-if="isLoading"
      class="infinite-scroller__item infinite-scroller__item--placeholder"
    >
      <slot name="loading">Loading...</slot>
    </div>
    <i
      ref="scrollPlaceholder"
      class="infinite-scroller__scroll-placeholder"
      :style="{ transform: `translate3d(0, ${scrollHeight}px, 0)` }"
    ></i>
  </div>
</template>

<style lang="scss" scoped>
.infinite-scroller {
  &__scroll-placeholder {
    position: absolute;
    height: 1px;
    width: 1px;
    opacity: 0;
    pointer-events: none;
    transition: transform 0.2s;
  }
}
</style>
