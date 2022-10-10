import { createWebHistory, createRouter } from "vue-router";

import Hello from '@/view/HelloUnboxing.vue'
import Goodbye from '@/view/GoodbyeUnboxing.vue'
import List from '@/view/List.vue'
import Editor from '@/view/Editor.vue'
import Viewer from '@/view/Viewer.vue'

export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Hello',
            component: Hello
        },
        {
            path: '/bye',
            name: 'Goodbye',
            component: Goodbye
        },
        {
            path: '/list',
            name: 'List',
            component: List
        },
        {
            path: '/editor',
            name: 'Editor',
            component: Editor
        },
        {
            path: '/viewer',
            name: 'Viewer',
            component: Viewer
        },
    ]
})