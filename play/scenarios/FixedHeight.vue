<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import InfiniteScroller from '@/InfiniteScroller.vue'

@Component({
  components: {
    InfiniteScroller
  }
})
export default class FixedHeight extends Vue {
  private items: string[] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \
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
}
</script>

<template>
  <infinite-scroller :items="items" :has-more="false">
    <template slot-scope="{ item }">{{ item }}</template>
  </infinite-scroller>
</template>

<style lang="scss" scoped>
.infinite-scroller {
  overflow: auto;
  height: 150px;
  max-height: 150px;
}
</style>
