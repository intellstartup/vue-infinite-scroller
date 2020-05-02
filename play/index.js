import InfiniteScroller from '../src/InfiniteScroller.vue'
import Vue from 'vue'
import { play } from 'vue-play'

Vue.component('infinite-scroller', InfiniteScroller)

const items = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \
  Donec sodales rhoncus augue, eu tincidunt lorem finibus eu. Proin semper ipsum sit \
  amet neque auctor commodo. Praesent imperdiet nunc id mollis maximus. Quisque \
  consectetur eu neque eu posuere. Aliquam erat volutpat. Donec malesuada commodo \
  ex, eget imperdiet massa interdum eget. Donec auctor lorem ac massa pellentesque, \
  maximus mollis magna fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing \
  elit. Maecenas quis enim id magna ultricies eleifend eu et nibh. Aenean ornare, \
  est lobortis porta consectetur, lacus erat molestie tortor, eu vehicula arcu \
  Donec sodales rhoncus augue, eu tincidunt lorem finibus eu. Proin semper ipsum sit \
  amet neque auctor commodo. Praesent imperdiet nunc id mollis maximus. Quisque \
  consectetur eu neque eu posuere. Aliquam erat volutpat. Donec malesuada commodo \
  ex, eget imperdiet massa interdum eget. Donec auctor lorem ac massa pellentesque, \
  maximus mollis magna fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing \
  elit. Maecenas quis enim id magna ultricies eleifend eu et nibh. Aenean ornare, \
  est lobortis porta consectetur, lacus erat molestie tortor, eu vehicula arcu \
  Donec sodales rhoncus augue, eu tincidunt lorem finibus eu. Proin semper ipsum sit \
  amet neque auctor commodo. Praesent imperdiet nunc id mollis maximus. Quisque \
  consectetur eu neque eu posuere. Aliquam erat volutpat. Donec malesuada commodo \
  ex, eget imperdiet massa interdum eget. Donec auctor lorem ac massa pellentesque, \
  maximus mollis magna fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing \
  elit. Maecenas quis enim id magna ultricies eleifend eu et nibh. Aenean ornare, \
  est lobortis porta consectetur, lacus erat molestie tortor, eu vehicula arcu \
  lorem ut orci.'
  .replace(/[.,]/g, '')
  .replace(/(?:\s){2,}/g, ' ')
  .split(' ')

play('InfiniteScroller')
  .add('Inside a container', {
    data() {
      return {
        items: items.slice()
      }
    },
    template: `
    <div style="overflow: auto; height: calc(100vh - 20px)">
      <p style="margin: 50px 0">Lorem ipsum dolor sit amet</p>
      <infinite-scroller :items="items">
        <template slot-scope="{item}">{{ item }}</template>
      </infinite-scroller>
    </div>
    `
  })
  .add('Self contained', {
    data() {
      return {
        items: items.slice()
      }
    },
    template: `
      <infinite-scroller :items="items" style="overflow: auto; height: 150px">
        <template slot-scope="{item}">{{ item }}</template>
      </infinite-scroller>
    `
  })
  .add('Variable height', {
    data() {
      return {
        items: items.slice().map(m => ({ open: false, data: m }))
      }
    },
    template: `
      <div>
        <p>Click on any item to have their height changed:</p>
        <infinite-scroller :items="items" :threshold="2" style="overflow: auto; height: 250px">
          <div
            slot-scope="{item}"
            @click="item.open = !item.open"
            :style="{ padding: item.open ? '30px 10px' : '0', border: item.open ? '1px solid black' : '0' }"
          >
            {{ item.data }}
          </div>
        </infinite-scroller>
      </div>
    `
  })
  .add('Dynamic content', {
    data() {
      return {
        items: items.slice(0, 60),
        hasMore: true,
        loading: false
      }
    },
    methods: {
      more(from) {
        if (this.loading) {
          return
        }

        this.loading = true

        setTimeout(() => {
          this.items = this.items.concat(items.slice(from, from + 50))
          this.hasMore = this.items.length < items.length
          this.loading = false
        }, Math.max(500, Math.random() * 2000))
      }
    },
    template: `
      <infinite-scroller
        :items="items"
        :has-more="hasMore"
        @load-more="more"
        style="overflow: auto; height: 150px"
      >
        <template slot-scope="{item}">{{ item }}</template>
      </infinite-scroller>
    `
  })
