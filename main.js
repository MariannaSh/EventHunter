import router from './router.js'

const { createApp, h } = Vue

const app = createApp({
  data() {
    return {
      currentComponent: null
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

      if (typeof component === 'object' && (component.template || component.render)) {
        this.currentComponent = component
      } else {
        console.error("Błąd routera: niepoprawny komponent:", component)
        this.currentComponent = {
          template: "<div>Nie udało się załadować komponentu.</div>"
        }
      }
      firebase.auth().onAuthStateChanged((user) => {
        const loginBtn = document.querySelector('.nav-right a');
        if (user && loginBtn) {
          loginBtn.style.visibility = 'hidden';
        }
      });
      
    }

  },
  render() {
    return this.currentComponent
      ? h(this.currentComponent)
      : h('div', 'Ładowanie...')
  }
})

app.mount('#app')
