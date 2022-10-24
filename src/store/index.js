import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

export default createStore({
    state: {
        ub_user: null,
        ub_noti: [],
        ub_tags: null,
        ub_fingerPrint: '',
    },
    mutations: {
        setUserInfo(state, user) {
            state.ub_user = user;
        },
        setUserName(state, name) {
            state.ub_user.name = name;
        },
        setEmail(state, email) {
            state.ub_user.email = email;
        },
        setNoAnnouncement(state, flag) {
            state.ub_user.noAnnouncement = flag;
        },
        setTutorialStep (state, step) {
            state.ub_user.tutorial = step;
        },
        setLastTimestampOfNoti (state, timestamp) {
            state.ub_user.lastTimestampOfNoti = timestamp;
        },
        setNoti(state, notis) {
            state.ub_noti = notis;
        },
        setNotiRead(state, index) {
            state.ub_noti[index].read = true;
        },
        setTags(state, tags) {
            state.ub_tags = tags;
        },
        setFingerPrint(state, fingerPrint) {
            state.ub_fingerPrint = fingerPrint;
        },
        setCheckEmergency(state, check) {
            state.ub_user.checkEmergency = check;
        }
    },
    plugins: [
        createPersistedState()
    ]
});