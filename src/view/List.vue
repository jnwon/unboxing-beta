<template>
    <div class="container">
        <h2><i class="fas fa-box-open" @click="reload()"/></h2>
        <h3 v-if="$route.params.userId && !fetching"> {{ ownerName + $t('unboxing-name') }} &nbsp;Unboxing </h3>
        <br/>
        <h3 v-if="fetching"><i class="fa fa-spinner fa-spin"/></h3>

        <setting-panel :userInfo="{user: ub_user, fingerPrint: ub_fingerPrint}"
                        @saveNewUserName="saveNewUserName" @saveNewEmail="saveNewEmail" @logOut="logOut" @setAnnouncement="setAnnouncement"/>
        <!-- <noti-panel :userInfo="{user: ub_user, fingerPrint: ub_fingerPrint}"></noti-panel> -->

        <div id="main" class="row">
            <div class="col-sm-2"></div>
            <div class="col-sm-8">
                <div class="list-group" v-if="!$route.params.userId && (!this.ub_user || !this.ub_user.noAnnouncement)">
                    <a v-for="(post, index) in announceData" :key="index" @click="moveToViewer(post.postId)" :id="post.postId" href="#" class="list-group-item" style="display: flex; justify-content: space-between;">
                        <div class="announceTitle" :style="'text-align: left; ' + (post.postId == '-NELJ6iKT-aFCiDYIQIQ' ? 'color: coral' : '')">
                            <span>{{post.title}}&nbsp;<i v-if="post.lock" class="fa fa-lock" style="color: green; font-size: smaller;"/></span>
                        </div>
                        <div class="announceMeta">
                            <span :style="'font-size:small; color:' + (this.ub_user && post.userId == this.ub_user.id? 'coral' : 'lightgrey')">{{post.userName}}</span><span style="font-size:small; color:lightgrey"> | {{post.timeOffset}}</span>
                        </div>
                    </a>
                </div>
                <div class="list-group" v-popover:bottom="$t('tooltip-tutorial-4-3')">
                    <a v-for="(post, index) in postData" :key="index" @click="moveToViewer(post.postId, post.userId)" :id="post.postId" href="#" class="list-group-item" style="display: flex; justify-content: space-between;">
                        <div class="postTitle" style="text-align: left;">
                            <span>{{post.title}}&nbsp;<i v-if="post.lock" class="fa fa-lock" style="color: green; font-size: smaller;"/></span>
                        </div>
                        <div class="postMeta">
                            <span :style="'font-size:small; color:' + (this.ub_user && post.userId == this.ub_user.id? 'coral' : 'lightgrey')">{{post.userName}}</span><span style="font-size:small; color:lightgrey"> | {{post.timeOffset}}</span>
                        </div>
                    </a>
                </div>
                
                <div v-show="!fetching">
                    <div style="text-align: justify; padding: 10px">
                        <span style="color:lightgrey; margin-right: 20px"><i class="fa fa-star" v-tooltip="$t('tooltip-developing')"/></span>
                        <span v-if="this.ub_user && !$route.params.userId" style="margin-right: 20px" @click="toggleListMode()" id="myBtn" v-popover:top="$t('tooltip-tutorial-4-1')"><b>{{myList? 'ALL' : 'MY'}}</b></span>
                        <span v-if="$route.params.userId" style="margin-right: 20px" @click="goGome()"><i class="fa fa-home"></i></span>
                        <!-- <span style="margin-right: 20px" @click="toggleListType()"><i :class="listView? 'fa fa-list' : 'fa fa-newspaper'"/></span> -->
                        <span v-if="$route.params.userId"><i class="fas fa-share-alt" v-mpopover:top="$t('tooltip-unboxing-link')" v-bspopover:top="'<img id=\'kakaoshare\' src=\'./img/icons/kakaotalk.png\'/><i class=\'fa fa-link share\'>'"></i></span>
                        <span v-show="myList && !$route.params.userId" @click="openSetting()"><i class="fas fa-cog"/></span>
                        <span style="position:absolute; right: 48%"><i @click="fetchNext(10)" class="fas fa-plus-circle"/></span>
                        <span style="position:absolute; right: 5%" id="fa-pen" v-popover:top="$t('tooltip-tutorial-1')"><i @click="moveToEditor()" class="fa fa-pen"/></span>
                    </div>
                    <div v-show="myList && !editTag" style="text-align:left; margin-left: 10px">
                        <span v-for="(ub_tag, index) in ubTags" :key="index" :id="index == 0 ? 'tagList' : ''" v-popover:top="index == 0 ? $t('tooltip-tutorial-4-2') : ''" :style="'margin-right: 15px; font-size: large;' + (tags[ub_tag.id]? 'color: orange' : 'color: lightgrey')" @click="toggleTag(ub_tag.id)"><b>#{{ub_tag.name}}</b></span>
                        <i v-if="!$route.params.userId" class="fa fa-edit" @click="editTags()"></i>
                    </div>
                    <div v-show="editTag" style="text-align:left; margin-left: 10px">
                        <span v-for="(tag, index) in this.tagsEditing" :key="index" style="margin-right: 15px"><input type="text" v-model="tag.name" style="width: 20%; margin-right: 5px; margin-bottom: 10px;"/><i class="fas fa-times-circle" @click="deleteTags(index, tag.id)"/></span>
                        <i class="fa fa-plus" style="margin-right: 10px;" @click="addTags()"></i>
                        <i class="fa fa-check" style="margin-left: 10px; margin-right: 10px;" @click="completeEditTags()"></i>
                        <i class="fa fa-undo" style="margin-left: 10px;" @click="cancelEditTags()"></i>
                    </div>
                    <br/>
                </div>
            </div>
            <div class="col-sm-2"></div>
        </div>
        <p></p>
        <!-- <button v-if="!fetching" type="submit" class="btn btn-info" @click="querying()">querying</button> -->
    </div>
</template>

<script>
import router from '@/router';
import db from '@/db';
import { mapMutations, mapState } from 'vuex';
import Clipboard from 'clipboard'
import SettingPanel from '@/components/SettingPanel.vue';
// import NotiPanel from '@/components/NotiPanel.vue';

export default {
    name: 'view-List',
    components: { SettingPanel },
    data() {
        return {
            isManager : false,
            ownerName : '',
            fetching : true,
            myList : false,
            userId : '',
            listView : true,
            editTag : false,
            currentTimestamp : 0,
            lastTimestamp : 0,
            announceData: [],
            postData: [],
            MyData: [],
            myNextIndex: -1,
            ubTags: [],
            tags: [],
            tagsEditing : [],
            tagsRemoved : [],
            filters: [],
        }
    },
    watch: {
        myList: function (val) {
            sessionStorage.setItem('myList', val);
        },
        lastTimestamp: function (val) {
            sessionStorage.setItem('lastTimestamp', val);
        },
        myNextIndex: function (val) {
            sessionStorage.setItem('myNextIndex', val);
        },
        filters: {
            handler(val) {
                var filters = {}
                for(var key in val) {
                    filters[key] = val[key]
                }
                sessionStorage.setItem('filters', JSON.stringify(filters));
            },
            deep: true
        }
    },
    created() {
        if(this.ub_fingerPrint == process.env.VUE_APP_MANAGER_FINGERPRINT){
            this.isManager = true;
        }
        if(navigator.language != 'ko' && navigator.language != 'ko-KR'){
            this.$i18n.locale = 'en'
        }
    },
    async mounted() {

        document.title = "unboxing-beta";

        if(this.$route.params.userId){
            try{
                await db.db.ref('users/' + this.$route.params.userId + '/name').get().then(async (snapshot) => {
                    if(snapshot.exists){
                        this.userId = this.$route.params.userId;
                        this.ownerName = snapshot.val();
                        this.myList = true;
                        if(!this.$route.query.postId){
                            sessionStorage.clear();
                        }
                        await db.db.ref('users/' + this.$route.params.userId + '/tags').get().then((snapshot) => {
                            snapshot.forEach((data) => {
                            this.ubTags.push({id: data.key, name: data.val().name});
                            })
                        });
                    }
                })
            } catch(e) {
                console.log(e);
                alert(e);
            }
        }
        else{
            this.userId = this.ub_user? this.ub_user.id : '';
            this.ubTags = this.ub_tags;
        }

        history.replaceState({}, null, location.pathname);

        if(this.ub_user || this.$route.params.userId){
            this.ubTags.forEach((tag) => {
                this.tags[tag.id] = 0;
            })
        }

        if(!this.$route.params.userId){
            this.myList = sessionStorage.getItem('myList') == "true" ? true : false;
        }
        var filtersObjStr = sessionStorage.getItem('filters');
        if(filtersObjStr){
            var filtersObj = JSON.parse(filtersObjStr)
            for(var key in filtersObj){
                this.tags[filtersObj[key]] = true;
                this.filters.push(filtersObj[key])
            }
        }

        try{
            const postListRef = db.db.ref('posts');
            await postListRef.orderByChild('userId').startAt(process.env.VUE_APP_MANAGER_USERID).endAt(process.env.VUE_APP_MANAGER_USERID).once("value", (snapshot) => {
                var announcements = [];
                snapshot.forEach((data) => {
                    if(!data.val().temp && data.val().announcement){
                        var dateTime = '';
                        var timeOffset = '';
                        if(this.$i18n.locale == 'ko'){
                            dateTime = new Date(-data.val().timestamp).toLocaleString().split(" ");
                            timeOffset = dateTime[0]+dateTime[1]+dateTime[2];
                        }
                        else {
                            dateTime = new Date(-data.val().timestamp).toLocaleString().split(",");
                            timeOffset = dateTime[0];
                        }
                        announcements.push({postId: data.key, title: data.val().title, userId: "", userName: data.val().userName, timeOffset: timeOffset, lock: data.val().lock});
                    }
                })

                var announcelen = announcements.length;
                for(var i = announcelen-1; i >= 0; i--){
                    this.announceData.push(announcements[i]);
                }
            });
        } catch(e) {
            console.log(e);
            alert(e);
        }

        if(this.myList){
            await this.fetchMy();
        }
        else{
            await this.fetchAll();
        }

        if(window.Kakao.isInitialized()){
            window.Kakao.cleanup();
        }
        window.Kakao.init('7760cbd5eb273bd5f06a0ede6eba6a86'); 

        new Clipboard('.fa-link', {
            text: function() {
                return location.href
            }
        });

        window.$(document).on('click', "#kakaoshare", () => {
            var title = this.ownerName + '의 Unboxing';
            var imgurl = "https://unboxing-200c8.web.app/img/icons/android-chrome-maskable-512x512.png"
            window.$('.fa-share-alt').popover('hide');
            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: title,
                    imageUrl: imgurl,
                    link: {
                        mobileWebUrl: location.href,
                        webUrl: location.href
                    },
                },
            });
        })

        window.$(document).on('click', ".fa-link", () => {
            window.$('.fa-share-alt').popover('hide');
            window.$(".fa-share-alt").tooltip('show');
            setTimeout(() => {window.$(".fa-share-alt").tooltip('hide');}, 3000)
        })

        if(this.$route.query.postId && (!this.ub_user || this.ub_user.tutorial != 4)){
            window.$("#"+this.$route.query.postId).focus();
        }

        if(this.ub_user && this.ub_user.tutorial == 1){
            setTimeout(() => {window.$("#fa-pen").tooltip('show');}, 500)
        }
        else{
            window.$("#fa-pen").tooltip('destroy');
        }

        if(this.ub_user && this.ub_user.tutorial == 4){
            setTimeout(() => {window.$("#myBtn").tooltip('show');}, 500)
        }
        else{
            window.$("#myBtn").tooltip('destroy');
            window.$("#tagList").tooltip('destroy');
            window.$(".list-group").tooltip('destroy');
        }
    },
    computed: {
        ...mapState(['ub_user', 'ub_tags', 'ub_fingerPrint'])
    },
    methods: {
        ...mapMutations(['setUserInfo', 'setTags', 'setFingerPrint', 'setTutorialStep', 'setUserName', 'setEmail', 'setNoAnnouncement']),
        reload() {
            location.reload();
        },
        moveToViewer(postId, ownerId) {
            if(this.ub_user && this.ub_user.tutorial == 4){
                this.setTutorialStep(5);
            }
            router.push({name: 'Viewer', query: {postId: postId, ownerId: ownerId, loginId: this.ub_user? this.ub_user.id : '', userId: this.$route.params.userId ? this.userId : ''}});
        },
        moveToEditor() {
            if(this.ub_user && this.ub_user.tutorial == 1){
                this.setTutorialStep(2);
            }
            router.push('Editor');
        },
        async toggleListMode() {
            this.myList = !this.myList;
            if(this.myList){
                this.fetchMy();
            }
            else{
                this.fetchAll();
            }
            if(this.ub_user && this.ub_user.tutorial == 4){
                window.$("#myBtn").tooltip('destroy');
                setTimeout(() => {window.$("#tagList").tooltip('show');}, 500)
            }
        },
        toggleListType() {
            this.listView = !this.listView;
        },
        toggleTag(tagId) {
            this.tags[tagId] = !this.tags[tagId];
            if(this.tags[tagId]){
                this.filters.push(tagId);
            }
            else{
                this.filters = this.filters.filter((e) => e != tagId);
            }
            this.fetchMy();
            if(this.ub_user && this.ub_user.tutorial == 4){
                window.$("#tagList").tooltip('destroy');
                setTimeout(() => {window.$(".list-group").tooltip('show');}, 500)
            }
        },
        editTags() {
            this.editTag = true;
            this.tagsEditing = [];
            this.ubTags.forEach((tag) => {
                this.tagsEditing.push({id: tag.id, name: tag.name});
            })
            this.tagsRemoved = [];
            this.ubTags.forEach((tag) => {
                this.tags[tag.id] = 0;
            })
            this.filters = [];
        },
        deleteTags(index, tagId) {
            this.tagsEditing.splice(index, 1);
            if(tagId && this.tagsRemoved.indexOf(tagId) == -1){
                this.tagsRemoved.push(tagId);
            }
        },
        addTags() {
            this.tagsEditing.push({id: null, name: ''});
        },
        completeEditTags() {
            var blankNameExist = false;
            this.tagsEditing.forEach((t) => {
                if(t.name == ''){
                    blankNameExist = true;
                }
            })
            if(blankNameExist){
                alert(this.$t('alert-tagname'));
            }
            else {
                this.tagsEditing.forEach(async (tag) => {
                    var tagListRef = db.db.ref('users/' + this.ub_user.id + '/tags')
                    var tagRef;
                    if(tag.id){
                        tagRef = db.db.ref('users/' + this.ub_user.id + '/tags/' + tag.id);
                        await tagRef.set({name: tag.name});
                    }
                    else{
                        tagRef = tagListRef.push();
                        await tagRef.set({name: tag.name});
                        tag.id = tagRef.key;
                    }
                    this.setTags(this.tagsEditing);
                })
                this.tagsRemoved.forEach(async (id) => {
                    await db.db.ref('users/' + this.ub_user.id + '/tags/' + id).set(null);
                })

                this.editTag = false;
                this.fetchMy();
            }
        },
        cancelEditTags(){
            this.editTag = false;
            this.fetchMy();
        },
        async fetchAll() {
            this.fetching = true;
            this.postData = [];
            this.currentTimestamp = new Date().getTime();
            const postListRef = this.$route.query.postId && sessionStorage.getItem('lastTimestamp')? db.db.ref('posts').orderByChild('timestamp').endAt(Number(sessionStorage.getItem('lastTimestamp'))) : db.db.ref('posts').orderByChild('timestamp').limitToFirst(10);
            var timestamp;
            var timeoffset;
            var pushCount = 0;
            var fetchCount = 0;
            try{
                postListRef.on("value", (snapshot) => {
                    snapshot.forEach((data) => {
                        fetchCount++;
                        timestamp = data.val().timestamp;
                        timeoffset = this.currentTimestamp + timestamp;
                        if(!data.val().temp){
                            if(!data.val().lock || (this.ub_user && data.val().userId == this.ub_user.id)){
                                if(!this.isManager && (data.val().userId != process.env.VUE_APP_MANAGER_USERID)){
                                    this.postData.push({postId: data.key, title: data.val().title, userId: data.val().userId, userName: data.val().userName, timeOffset: this.getLocaleTimeString(timeoffset), lock: data.val().lock});
                                    pushCount++;
                                }
                                else if(this.isManager){
                                    this.postData.push({postId: data.key, title: data.val().title, userId: data.val().userId, userName: data.val().userName, timeOffset: this.getLocaleTimeString(timeoffset), lock: data.val().lock});
                                    pushCount++;
                                }
                            }
                        }
                    })
                    this.lastTimestamp = timestamp;
                    this.fetching = false;

                    var remainCount = 10 - pushCount;
                    if(fetchCount > 0 && remainCount > 0){
                        this.fetchNext(remainCount)
                    }
                })
            } catch (e) {
                console.log(e);
                alert(e);
            }
        },
        async fetchNext(offset) {
            if(this.myList && this.myNextIndex >= 0 ){
                for(var i = this.myNextIndex; i >= (this.myNextIndex -10 >=0? this.myNextIndex -10 : 0); i--){
                    this.postData.push(this.MyData[i]);
                }
                this.myNextIndex = i;
            }
            else if(!this.myList){
                const postListRef = db.db.ref('posts').limitToFirst(Number(offset));
                var timestamp;
                var timeoffset;
                var pushCount = 0;
                var fetchCount = 0;
                try{
                    postListRef.orderByChild('timestamp').startAfter(this.lastTimestamp).on("value", (snapshot) => {
                        snapshot.forEach((data) => {
                            fetchCount++;
                            timestamp = data.val().timestamp;
                            timeoffset = this.currentTimestamp + timestamp;
                            if(!data.val().temp){
                                if(!data.val().lock || (this.ub_user && data.val().userId == this.ub_user.id)){
                                    if(!this.isManager && (data.val().userId != process.env.VUE_APP_MANAGER_USERID)){
                                        this.postData.push({postId: data.key, title: data.val().title, userId: data.val().userId, userName: data.val().userName, timeOffset: this.getLocaleTimeString(timeoffset), lock: data.val().lock});
                                        pushCount++;
                                    }
                                    else if(this.isManager){
                                        this.postData.push({postId: data.key, title: data.val().title, userId: data.val().userId, userName: data.val().userName, timeOffset: this.getLocaleTimeString(timeoffset), lock: data.val().lock});
                                        pushCount++;
                                    }
                                }
                            }
                        })
                        if(timestamp){
                            this.lastTimestamp = timestamp;
                        }
                        var remainCount = offset - pushCount;
                        if(fetchCount > 0 && remainCount > 0){
                            this.fetchNext(remainCount)
                        }
                    })
                } catch (e) {
                    console.log(e);
                    alert(e);
                }
            }
        },
        async fetchMy(){
            this.fetching = true;
            this.postData = [];
            this.MyData = [];
            this.currentTimestamp = new Date().getTime();
            const postListRef = db.db.ref('posts');
            var timestamp;
            var timeoffset;
            try{
                await postListRef.orderByChild('userId').startAt(this.userId).endAt(this.userId).once("value", (snapshot) => {
                    snapshot.forEach((data) => {
                        if(!data.val().temp){
                            timestamp = data.val().timestamp;
                            timeoffset = this.currentTimestamp + timestamp;
                            if(this.filters.length > 0){
                                var tagMatched = false;
                                if(data.val().tags){
                                    data.val().tags.forEach((tag) => {
                                        if(this.filters.indexOf(tag.id) >= 0){
                                            tagMatched = true;
                                            return 0;
                                        }
                                    })
                                }
                                if(tagMatched){
                                    if(!data.val().lock || (this.ub_user && data.val().userId == this.ub_user.id)){
                                        this.MyData.push({postId: data.key, title: data.val().title, userId: data.val().userId, userName: data.val().userName, timeOffset: this.getLocaleTimeString(timeoffset), lock: data.val().lock});
                                    }
                                }
                            }
                            else{
                                if(!data.val().lock || (this.ub_user && data.val().userId == this.ub_user.id)){
                                    this.MyData.push({postId: data.key, title: data.val().title, userId: data.val().userId, userName: data.val().userName, timeOffset: this.getLocaleTimeString(timeoffset), lock: data.val().lock});
                                }
                            }
                        }
                    })
                    var myDataLen = this.MyData.length;
                    if(this.$route.query.postId && sessionStorage.getItem('myNextIndex')){
                        for(var i=myDataLen-1; i > Number(sessionStorage.getItem('myNextIndex')); i--){
                            this.postData.push(this.MyData[i]);
                        }
                    } else {
                        for(i=myDataLen-1; i >= (myDataLen -10 >=0? myDataLen -10 : 0); i--){
                            this.postData.push(this.MyData[i]);
                        }
                    }
                    this.myNextIndex = i;
                })
                this.fetching = false;
            } catch (e) {
                console.log(e);
                alert(e);
            }
        },
        getLocaleTimeString(timeoffset) {
            var timeoffsetSeconds = (timeoffset / 1000).toFixed();
            if(timeoffsetSeconds < 60){
                return timeoffsetSeconds + this.$t('seconds-tail');
            }
            else{
                var timeoffsetMinutes = (timeoffsetSeconds / 60).toFixed();
                if(timeoffsetMinutes < 60){
                    return timeoffsetMinutes + this.$t('minutes-tail');
                }
                else{
                    var timeoffsetHours = (timeoffsetMinutes / 60).toFixed();
                    if(timeoffsetHours < 24){
                        return timeoffsetHours + this.$t('hours-tail');
                    }
                    else{
                        var timeoffsetDays = (timeoffsetHours / 24).toFixed();
                        if(timeoffsetDays < 7) {
                            return timeoffsetDays + this.$t('days-tail');
                        }
                        else{
                            var timeoffsetWeeks = (timeoffsetDays / 7).toFixed();
                            if(timeoffsetWeeks < 30) {
                                return timeoffsetWeeks + this.$t('weeks-tail');
                            }
                            else{
                                var timeoffsetMonths = (timeoffsetWeeks / 30).toFixed();
                                return timeoffsetMonths + this.$t('months-tail');
                            }
                        }
                    }
                }
            }
        },
        openSetting() {
            window.$('#noti').css("width", 0);
            window.$('.elements-right').css("opacity", 0);
            window.$('#setting').css("width", "350px");
            window.$('.elements').css("opacity", 1);
        },
        saveNewUserName(userName) {
            try {
                this.setUserName(userName);
                db.db.ref('users/' + this.ub_user.id + '/name').set(userName);
            }
            catch (e) {
                console.log(e);
                alert(e);
            }
        },
        saveNewEmail(email) {
            try {
                this.setEmail(email);
                db.db.ref('users/' + this.ub_user.id + '/email').set(email);
            }
            catch (e) {
                console.log(e);
                alert(e);
            }
        },
        logOut() {
            this.setUserInfo(null);
            this.setTags(null);
            this.setFingerPrint('');
            localStorage.removeItem('vuex');
            sessionStorage.clear();
            location.href='/bye';
        },
        setAnnouncement() {
            var announcment = this.ub_user.noAnnouncement
            this.setNoAnnouncement(!announcment)
        },
        goGome() {
            sessionStorage.clear();
            location.href="/List"
        },

        async querying() {
            var updates = {};
            const postListRef = db.db.ref('postsWithContents');
            await postListRef.get().then((snapshots) => {
                snapshots.forEach((snapshot) => {
                    updates['/postsWithContents/' + snapshot.key + '/password'] = 1234;
                })
            })
            await db.db.ref().update(updates);
            console.log('updated!');
        }
    }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

/* Style page content - use this if you want to push the page content to the right when you open the side navigation */
#main {
  transition: margin-left .5s; /* If you want a transition effect */
}
.postTitle {
    max-width: 75%;
    display: block;/* 블록태그로 만들어준다 */
    text-overflow: ellipsis;/* 말줄임 css */
    white-space: nowrap;/*글자를 한줄로 모아준다*/
    overflow: hidden;
}
.postMeta {
    max-width: 25%;
    display: block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
@media screen and (max-width: 450px) {
  .postTitle {
    max-width: 50%;
    display: block;/* 블록태그로 만들어준다 */
    text-overflow: ellipsis;/* 말줄임 css */
    white-space: nowrap;/*글자를 한줄로 모아준다*/
    overflow: hidden;
  }
  .postMeta {
    max-width: 50%;
    display: block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}

.announceTitle {
    max-width: 75%;
}
.announceMeta {
    max-width: 25%;
}
@media screen and (max-width: 450px) {
  .announceTitle {
    max-width: 50%;
  }
  .announceMeta {
    max-width: 50%;
  }
}

.share {
    font-size: large;
    margin-right: 10px;
    /* display: none; */
}

#kakaoshare {
    width: 25px;
    margin-bottom: 5px;
    margin-right: 10px;
}

</style>
  