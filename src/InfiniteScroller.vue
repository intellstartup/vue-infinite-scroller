<script lang="ts">
import Vue from 'vue'
import throttle from 'lodash.throttle'
import { Component, Prop, Watch } from 'vue-property-decorator'
import getScrollableParent from './utils/getScrollableParent'

interface ItemMetadata {
  index: number
  height: number
  width: number
  data: any | null
  node: HTMLElement | null
  top: number
}

interface AnchorItemData {
  index: number
  offset: number
}

@Component({
  name: 'infinite-scroller'
})
export default class InfiniteScroller extends Vue {
  @Prop({ type: Array, default: () => [] })
  private readonly items!: any[]

  @Prop({ type: Boolean, default: false })
  private readonly hasMore!: boolean

  @Prop({ type: [Number, Array], default: () => [50, 10] })
  private readonly threshold!: number | [number, number]

  @Prop({ type: String, default: () => 'div' })
  private readonly tag!: string

  @Prop({ type: String, default: () => 'div' })
  private readonly itemTag!: string

  private isInit: boolean = false

  private isSelfContained: boolean = false

  private itemsMetadata: ItemMetadata[] = []

  private scroller!: HTMLElement

  private attachedRange = {
    begin: 0,
    end: 0
  }

  private shouldAttachRange = {
    begin: 0,
    end: 0
  }

  private loadingItem = {
    top: 0,
    height: 0
  }

  private scrollHeight: number = 0

  private anchor = {
    scrollTop: 0,
    item: { index: 0, offset: 0 } as AnchorItemData
  }

  private observer: MutationObserver | null = null

  get attached() {
    return this.itemsMetadata.slice(
      this.attachedRange.begin,
      this.attachedRange.end + 1
    )
  }

  get calculatedThreshold() {
    if (Array.isArray(this.threshold)) {
      return {
        before: this.threshold[1],
        after: this.threshold[0]
      }
    }

    return {
      before: this.threshold,
      after: this.threshold
    }
  }

  get loading() {
    return this.hasMore && this.attachedRange.end >= this.items.length - 1
  }

  async getScroller() {
    if (!this.$el) {
      await this.$nextTick()
      await this.getScroller()
      return
    }

    this.scroller = getScrollableParent(this.$el as HTMLElement, false, true)
  }

  async fillInitial() {
    await this.fill(this.attachedRange.begin, this.attachedRange.end + 1)

    if (
      this.attached.length < this.items.length &&
      this.scroller.offsetHeight > this.scrollHeight
    ) {
      await this.fillInitial()
    }
  }

  async fill(start: number, end: number) {
    this.attachedRange.begin = Math.max(0, start)
    this.attachedRange.end = Math.min(end, Math.max(0, this.items.length - 1))

    await this.$nextTick()

    if (this.items.length) {
      this.updateMetadata()
      this.updatePositions()
    }

    if (end >= this.items.length && this.hasMore) {
      this.$emit('load-more', this.items.length)
    }
  }

  updateMetadata() {
    const diff = this.items.length - this.itemsMetadata.length

    if (diff > 0) {
      this.itemsMetadata = this.itemsMetadata.concat(
        (new Array(diff) as (ItemMetadata | null)[]).fill(null).map((m, i) => ({
          index: this.itemsMetadata.length + i,
          height: 0,
          width: 0,
          top: 0,
          data: this.items[this.itemsMetadata.length + i],
          node: null
        }))
      )
    }

    this.itemsMetadata.forEach(m => (m.node = null))
    const nodes = this.$el.querySelectorAll<HTMLElement>(
      ':scope > .infinite-scroller__item'
    )

    if (this.attachedRange.begin === this.attachedRange.end) {
      return
    }

    for (let i = this.attachedRange.begin; i <= this.attachedRange.end; i++) {
      const meta = this.itemsMetadata[i]
      const node = nodes[i - this.attachedRange.begin]

      if (!node) {
        return
      }

      meta.node = node
      meta.width = node.offsetWidth
      meta.height = node.offsetHeight
      meta.data = this.items[i]
    }
  }

  updatePositions() {
    let curPos = this.anchor.scrollTop - this.anchor.item.offset
    let i = this.anchor.item.index

    while (i > this.attachedRange.begin) {
      curPos -= this.itemsMetadata[i - 1].height
      i--
    }

    while (i < this.attachedRange.begin) {
      curPos += this.itemsMetadata[i].height
      i++
    }

    for (i = this.attachedRange.begin; i <= this.attachedRange.end; i++) {
      const item = this.itemsMetadata[i]
      item.top = curPos
      curPos += item.height
    }

    if (this.loading) {
      const node = this.$refs.loading as HTMLElement

      this.loadingItem = {
        top: curPos,
        height: node.offsetHeight
      }

      curPos += this.loadingItem.height
    }

    this.scrollHeight = Math.max(this.scrollHeight, curPos)
  }

  @Watch('loading')
  onLoadStateChanged(value: boolean, oldValue: boolean) {
    if (oldValue && !value) {
      this.scrollHeight -= this.loadingItem.height
    }
  }

  getItem(initial: AnchorItemData, delta: number): AnchorItemData {
    if (delta === 0) {
      return initial
    }

    delta += initial.offset
    let i = initial.index

    if (delta < 0) {
      while (delta < 0 && i > 0 && this.itemsMetadata[i - 1].height) {
        delta += this.itemsMetadata[i - 1].height
        i--
      }
    } else {
      while (
        delta > 0 &&
        i < this.itemsMetadata.length &&
        this.itemsMetadata[i].height &&
        this.itemsMetadata[i].height < delta
      ) {
        delta -= this.itemsMetadata[i].height
        i++
      }
    }

    return {
      index: i,
      offset: delta
    }
  }

  updateAnchor(delta: number) {
    if (this.scroller.scrollTop === 0) {
      this.anchor.item = { index: 0, offset: 0 }
    } else {
      this.anchor.item = this.getItem(this.anchor.item, delta)
    }

    this.anchor.scrollTop = this.scroller.scrollTop
  }

  getVisibleItems() {
    const el = this.$el as HTMLElement

    const lastScreenItem = this.getItem(
      this.anchor.item,
      this.isSelfContained
        ? this.scroller.offsetHeight
        : this.scroller.offsetHeight -
            Math.max(0, el.offsetTop - this.scroller.scrollTop)
    )

    return {
      first: this.anchor.item,
      last: lastScreenItem
    }
  }

  @Watch('items.length', { immediate: false })
  async onScroll() {
    const delta = this.scroller.scrollTop - this.anchor.scrollTop
    this.updateAnchor(delta)

    const visible = this.getVisibleItems()

    if (delta < 0) {
      await this.fill(
        visible.first.index - this.calculatedThreshold.after,
        visible.last.index + this.calculatedThreshold.before
      )
    } else {
      await this.fill(
        visible.first.index - this.calculatedThreshold.before,
        visible.last.index + this.calculatedThreshold.after
      )
    }
  }

  async init() {
    if (this.isInit) {
      return
    }

    await this.$nextTick()
    await this.getScroller()

    this.isSelfContained = this.scroller === this.$el
    this.scroller.classList.add('infinite-scroller__scroller')
    this.scroller.addEventListener(
      'scroll',
      throttle(this.onScroll.bind(this), 16) // 60fps ~= 16ms
    )

    if (getComputedStyle(this.scroller).position === 'static') {
      this.scroller.style.position = 'relative'
    }

    if (this.items.length) {
      this.itemsMetadata = new Array(this.items.length)
        .fill(null)
        .map<ItemMetadata>((m, i) => ({
          index: i,
          height: 0,
          width: 0,
          top: 0,
          data: this.items[i],
          node: null
        }))
    }

    this.observer = new MutationObserver(async mutations => {
      const relevant = mutations.filter(
        m => m.type === 'attributes' || m.target !== this.scroller
      )

      if (!relevant.length) {
        return
      }

      await this.$nextTick()

      const attachedHeight = this.attached.reduce(
        (sum, item) => sum + item.height,
        0
      )

      this.updateMetadata()
      this.updatePositions()

      await this.$nextTick()

      const newHeight = this.attached.reduce(
        (sum, item) => sum + item.height,
        0
      )

      const heightDiff = newHeight - attachedHeight

      if (heightDiff < 0) {
        this.scrollHeight += heightDiff
      }
    })

    this.observer.observe(this.scroller, {
      attributes: true,
      childList: true,
      subtree: true
    })

    await this.fillInitial()
    await this.$nextTick()

    this.onScroll()
    this.isInit = true
  }

  async mounted() {
    this.init()
  }
}
</script>

<template>
  <component
    :is="tag"
    class="infinite-scroller"
    :class="{ 'infinite-scroller--self-contained': isSelfContained }"
  >
    <component
      :is="itemTag"
      v-for="item in attached"
      :key="`item-${item.index}`"
      ref="item"
      class="infinite-scroller__item"
      :style="{ top: `${item.top}px` }"
    >
      <slot :item="item.data" :index="item.index"></slot>
    </component>
    <component
      :is="itemTag"
      v-if="loading"
      ref="loading"
      class="infinite-scroller__item infinite-scroller__item--placeholder"
      :style="{ top: `${loadingItem.top}px` }"
    >
      <slot name="loading">Loading...</slot>
    </component>
    <component
      :is="itemTag"
      ref="scrollPlaceholder"
      class="infinite-scroller__scroll-placeholder"
      :style="{ top: `${scrollHeight}px` }"
    ></component>
  </component>
</template>

<style lang="scss">
.infinite-scroller {
  transform: translate3d(0, 0, 0);

  &__scroll-placeholder {
    display: block;
    height: 1px;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: top 0.2s;
    width: 1px;
  }

  &__item {
    position: absolute;
  }
}
</style>
