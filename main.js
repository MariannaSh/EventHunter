import router from './router.js'

const { createApp } = Vue

const app = createApp({
  data() {
    return {
      viewComponent: { template: '<div>Ładowanie...</div>' }
    }
  },
  created() {
    window.addEventListener('hashchange', this.route)
    this.route()
  },
  methods: {
    async route() {
      const path = location.hash.slice(1) || '/'
      console.log("Routing to:", path);
      const component = await router(path)
      console.log("Component:", component.template); 
      this.viewComponent = component
    }
  },
  components: {
    DynamicView: {
      props: ['component'],
      template: `<div v-html="component.template"></div>`
    }
  },
  template: `<DynamicView :component="viewComponent" :key="viewComponent.template" />`
})

app.mount('#app')
