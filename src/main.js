import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

const app = createApp(App)

app.directive('tooltip', {
    mounted(el, binding) {
        window.$(el).tooltip({
            title: binding.value,
            triger: 'focus'
        })
    }
})

app.directive('popover', {
    mounted(el, binding) {
        window.$(el).tooltip({
            title: binding.value,
            placement: binding.arg,
            triger: 'manual'
        })
    }
})

app.use(router)
app.use(store)
app.mount('#app')
