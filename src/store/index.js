import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

export default createStore({
    state: {
        ub_user: null,
        ub_tags: null,
        ub_fingerPrint: ''
    },
    mutations: {
        setUserInfo(state, user) {
            state.ub_user = user;
        },
        setTags(state, tags) {
            state.ub_tags = tags;
        },
        setFingerPrint(state, fingerPrint) {
            state.ub_fingerPrint = fingerPrint;
        }
    },
    plugins: [
        createPersistedState()
    ]
});