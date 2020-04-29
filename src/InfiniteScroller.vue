<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import getScrollableParent from './utils/getScrollableParent'

interface ItemMetadata {
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

  private scrollHeight: number = 0

  private anchor = {
    scrollTop: 0,
    item: { index: 0, offset: 0 } as AnchorItemData
  }

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

  async fill(start: number, end: number) {
    this.attachedRange.begin = Math.max(0, start)
    this.attachedRange.end = Math.min(end, Math.max(0, this.items.length - 1))

    await this.$nextTick()

    if (this.items.length) {
      await this.updateMetadata()
      this.updatePositions()
    }

    if (end >= this.items.length && this.hasMore) {
      this.$emit('load-more', this.items.length)
    }
  }

  async updateMetadata() {
    const diff = this.items.length - this.itemsMetadata.length

    if (diff > 0) {
      this.itemsMetadata = this.itemsMetadata.concat(
        (new Array(diff) as (ItemMetadata | null)[]).fill(null).map((m, i) => ({
          height: 0,
          width: 0,
          top: 0,
          data: this.items[this.itemsMetadata.length + i],
          node: null
        }))
      )
    }

    this.itemsMetadata.forEach(m => (m.node = null))

    await this.$nextTick()

    const nodes = this.$refs.item as HTMLElement[]

    for (let i = this.attachedRange.begin; i <= this.attachedRange.end; i++) {
      const meta = this.itemsMetadata[i]

      meta.node = nodes[i - this.attachedRange.begin]
      meta.width = meta.node.offsetWidth
      meta.height = meta.node.offsetHeight
      meta.data = this.items[i]
    }
  }

  updatePositions() {
    let curPos = this.anchor.scrollTop - this.anchor.item.offset
    let i = this.anchor.item.index

    while (i > this.attachedRange.begin) {
      curPos -= this.itemsMetadata[i].height
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

    this.scrollHeight = Math.max(this.scrollHeight, curPos)
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

    if (this.items.length) {
      this.itemsMetadata = (new Array(
        this.items.length
      ) as (ItemMetadata | null)[])
        .fill(null)
        .map((m, i) => ({
          height: 0,
          width: 0,
          top: 0,
          data: this.items[i],
          node: null
        }))
    }

    await this.fill(0, this.calculatedThreshold.after)
    await this.$nextTick()

    this.onScroll()
    this.isInit = true
  }

  @Watch('items', { immediate: false })
  async onScroll() {
    const delta = this.scroller.scrollTop - this.anchor.scrollTop

    if (this.scroller.scrollTop === 0) {
      this.anchor.item = { index: 0, offset: 0 }
    } else {
      this.anchor.item = this.getItem(this.anchor.item, delta)
    }

    this.anchor.scrollTop = this.scroller.scrollTop

    const lastScreenItem = this.getItem(
      this.anchor.item,
      this.isSelfContained
        ? this.scroller.offsetHeight
        : this.scroller.offsetHeight -
            Math.min(
              0,
              (this.$el as HTMLElement).offsetTop - this.scroller.scrollTop
            )
    )

    if (delta < 0) {
      this.fill(
        this.anchor.item.index - this.calculatedThreshold.after,
        lastScreenItem.index + this.calculatedThreshold.before
      )
    } else {
      this.fill(
        this.anchor.item.index - this.calculatedThreshold.before,
        lastScreenItem.index + this.calculatedThreshold.after
      )
    }
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
      :key="item.index"
      ref="item"
      class="infinite-scroller__item"
      :style="{ transform: `translate3d(0, ${item.top}px, 0)` }"
    >
      <slot :item="item.data"></slot>
    </component>
    <component
      :is="itemTag"
      v-if="hasMore && attachedRange.end >= items.length - 1"
      class="infinite-scroller__item infinite-scroller__item--placeholder"
      :style="{ transform: `translate3d(0, ${scrollHeight}px, 0)` }"
    >
      <slot name="loading">Loading...</slot>
    </component>
    <component
      :is="itemTag"
      ref="scrollPlaceholder"
      class="infinite-scroller__scroll-placeholder"
      :style="{ transform: `translate3d(0, ${scrollHeight}px, 0)` }"
    ></component>
  </component>
</template>

<style lang="scss">
.infinite-scroller {
  &__scroll-placeholder {
    display: block;
    height: 1px;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: transform 0.2s;
    width: 1px;
  }

  &__item {
    position: absolute;
  }
}
</style>
