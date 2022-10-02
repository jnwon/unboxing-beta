import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

export default createStore({
    state: {
        ub_user: null,
        ub_tags: null,
        ub_fingerPrint: '',
        // ub_myList : {
        //     currentList: [],
        //     latestPostId: ''
        // }
    },
    mutations: {
        setUserInfo(state, user) {
            state.ub_user = user;
        },
        setTutorialStep (state, step) {
            state.ub_user.tutorial = step;
        },
        setTags(state, tags) {
            state.ub_tags = tags;
        },
        setFingerPrint(state, fingerPrint) {
            state.ub_fingerPrint = fingerPrint;
        },
        // setCurrentList(state, list) {
        //     state.ub_myList.currentList = list;
        // },
        // setLatestPostId(state, postId) {
        //     state.ub_myList.latestPostId = postId;
        // }
    },
    plugins: [
        createPersistedState()
    ]
});