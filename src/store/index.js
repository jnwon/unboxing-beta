import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

export default createStore({
    state: {
        ub_user: null,
        ub_noti: [],
        ub_blockedList : {
            blockedPosts : [],
            blockedUsers : []
        },
        ub_followList : {
            followingList : [],
            followerList : []
        },
        ub_tags: null,
        ub_fingerPrint: '',
        ub_lastCheckedPopup: '' 
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
        },
        setPrivacyPolicyAgree(state, agree) {
            state.ub_user.privacyPolicyAgree = agree;
        },
        setCheckPopup(state, postId) {
            state.ub_lastCheckedPopup = postId;
        },
        setBlockedPosts(state, postlist) {
            state.ub_blockedList.blockedPosts = postlist;
        },
        setBlockedUsers(state, userlist) {
            state.ub_blockedList.blockedUsers = userlist;
        },
        setBlockedPost(state, postId) {
            state.ub_blockedList.blockedPosts.push(postId);
        },
        setBlockedUser(state, userId) {
            state.ub_blockedList.blockedUsers.push(userId);
        },
        setFollowingList(state, userlist) {
            state.ub_followList.followingList = userlist;
        },
        setFollwingUser(state, userId) {
            state.ub_followList.followingList.push(userId);
        },
        setFollowerList(state, userlist) {
            state.ub_followList.followerList = userlist;
        }
    },
    plugins: [
        createPersistedState()
    ]
});