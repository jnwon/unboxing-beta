import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from '@/locales'
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
            trigger: 'manual click'
        })
    }
})

app.directive('mpopover', {
    mounted(el, binding) {
        window.$(el).tooltip({
            title: binding.value,
            placement: binding.arg,
            trigger: 'manual'
        })
    }
})

app.directive('bspopover', {
    mounted(el, binding) {
        window.$(el).popover({
            content: binding.value,
            placement: binding.arg,
            html: true
        })
    }
})

app.use(router)
app.use(store)
app.use(i18n)
app.mount('#app')
