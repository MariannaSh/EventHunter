import router from './router.js'

const { createApp } = Vue

const app = createApp({
  data() {
    return {
      currentView: ''
    }
  },
  created() {
    window.addEventListener('hashchange', this.route)
    this.route()
  },
  methods: {
    async route() {
      const path = location.hash.slice(1) || '/'
      this.currentView = await router(path)
    }
  },
  template: `<component :is="currentView"></component>`
})

app.mount('#app')
