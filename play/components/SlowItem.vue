<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

interface Pokemon {
  id: String
  number: String
  name: String
}

@Component({
  name: 'SlowItem'
})
export default class SlowItem extends Vue {
  @Prop({ type: String, required: true })
  private id!: string

  @Prop({ type: Number, required: true })
  private index!: number

  private item: Pokemon | null = null

  get imageSrc(): string {
    const number = this.item!.number
    return `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${number}.png`
  }

  getPokemon() {
    const url = 'https://graphql-pokemon.now.sh/graphql'
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `{
          pokemon (id: "${this.id}") {
            id
            number
            name
          }
        }`
      })
    }

    return fetch(url, options)
      .then(response => response.json())
      .then(json => {
        this.item = json.data.pokemon
      })
  }

  mounted() {
    this.fibo(25)
    this.getPokemon()
  }

  fibo(n: number): number {
    if (n < 2) {
      return 1
    }

    return this.fibo(n - 2) + this.fibo(n - 1)
  }
}
</script>

<template>
  <div class="slow-item">
    <div class="index">{{ index }}</div>
    <div v-if="item" class="img">
      <img width="48" height="48" :src="imageSrc" />
    </div>
    <div v-if="item" class="name">{{ item.name }}</div>
    <div v-else class="loading">Loading...</div>
  </div>
</template>

<style lang="scss" scoped>
.slow-item {
  display: flex;
  flex-flow: row;
  align-items: center;
  width: 500px;
  padding: 0.5rem;
  border-top: 1px solid lightgray;

  div {
    margin-right: 1rem;
  }
}
</style>
