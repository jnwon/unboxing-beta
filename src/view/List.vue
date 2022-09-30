<template>
    <div class="container">
        <h2><i class="fas fa-box-open" @click="reload()"/></h2>
        <br/>
        <h3 v-if="fetching"><i class="fa fa-spinner fa-spin"/></h3>
        <div class="row">
            <div class="col-sm-2"></div>
            <div class="col-sm-8">
                <div class="list-group">
                    <a v-for="(post, index) in postData" :key="index" @click="moveToViewer(post.postId)" href="#" class="list-group-item" style="display: flex; justify-content: space-between;">
                        <div style="max-width: 50%; text-align: left;">
                            <span>{{post.title}}&nbsp;<i v-if="post.lock" class="fa fa-lock" style="color: green; font-size: smaller;"/></span>
                        </div>
                        <div style="max-width: 50%">
                            <span :style="'font-size:small; color:' + (post.userId == this.ub_user.id? 'coral' : 'lightgrey')">{{post.userName}}</span><span style="font-size:small; color:lightgrey"> | {{post.timeOffset}}</span>
                        </div>
                    </a>
                </div>
                
                <div v-if="!fetching">
                    <div style="text-align: justify; padding: 10px">
                        <span style="color:lightgrey; margin-right: 20px"><i class="fa fa-star" v-tooltip="'준비중입니다!'"/></span><span @click="toggleListMode()"><b>{{myList? 'ALL' : 'MY'}}</b></span>
                        <i @click="fetchNext()" class="fa fa-plus" style="position:absolute; right: 48%"/>
                        <i @click="moveToEditor()" class="fa fa-pen" style="position:absolute; right: 5%"/>
                    </div>
                    <br/>
                    <div style="text-align:left; margin-left: 10px">
                        
                    </div>
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
import { mapState } from 'vuex';

export default {
    name: 'view-List',
    data() {
        return {
            fetching : true,
            myList : false,
            currentTimestamp : 0,
            lastTimestamp : 0,
            postData: [],
            MyData: [],
            myNextIndex: -1
        }
    },
    async mounted() {
        if(this.ub_user){
            await this.fetchAll();
        }
        else{
            location.href="/";
        }
    },
    computed: {
        ...mapState(['ub_user'])
    },
    methods: {
        reload() {
            location.reload();
        },
        moveToViewer(postId) {
            router.push({name: 'Viewer', query: {postId: postId}});
        },
        moveToEditor() {
            router.push('Editor');
        },
        getLocaleTimeString(timeoffset) {
            var timeoffsetSeconds = (timeoffset / 1000).toFixed();
            if(timeoffsetSeconds < 60){
                return timeoffsetSeconds + '초 전';
            }
            else{
                var timeoffsetMinutes = (timeoffsetSeconds / 60).toFixed();
                if(timeoffsetMinutes < 60){
                    return timeoffsetMinutes + '분 전';
                }
                else{
                    var timeoffsetHours = (timeoffsetMinutes / 60).toFixed();
                    if(timeoffsetHours < 24){
                        return timeoffsetHours + '시간 전';
                    }
                    else{
                        var timeoffsetDays = (timeoffsetHours / 24).toFixed();
                        if(timeoffsetDays < 7) {
                            return timeoffsetDays + '일 전';
                        }
                        else{
                            var timeoffsetWeeks = (timeoffsetDays / 7).toFixed();
                            if(timeoffsetWeeks < 30) {
                                return timeoffsetWeeks + '주 전';
                            }
                            else{
                                var timeoffsetMonths = (timeoffsetWeeks / 30).toFixed();
                                return timeoffsetMonths + '개월 전';
                            }
                        }
                    }
                }
            }
        },
        async fetchAll() {
            this.fetching = true;
            this.postData = [];
            this.currentTimestamp = new Date().getTime();
            const postListRef = db.db.ref('posts').limitToFirst(10);
            var timestamp;
            var timeoffset;
            try{
                await postListRef.orderByChild('timestamp').on("value", (snapshot) => {
                    snapshot.forEach((data) => {
                        timestamp = data.val().timestamp;
                        timeoffset = this.currentTimestamp + timestamp;
                        if(!data.val().lock || data.val().userId == this.ub_user.id){
                            this.postData.push({postId: data.key, title: data.val().title, userId: data.val().userId, userName: data.val().userName, timeOffset: this.getLocaleTimeString(timeoffset), lock: data.val().lock});
                        }
                    })
                    this.lastTimestamp = timestamp;
                    this.fetching = false;
                })
            } catch (e) {
                console.log(e);
                alert(e);
            }
        },
        async fetchNext() {
            if(this.myList && this.myNextIndex >= 0 ){
                for(var i = this.myNextIndex; i >= (this.myNextIndex -10 >=0? this.myNextIndex -10 : 0); i--){
                    this.postData.push(this.MyData[i]);
                }
                this.myNextIndex = i;
            }
            else{
                const postListRef = db.db.ref('posts').limitToFirst(10);
                var timestamp;
                var timeoffset;
                try{
                    await postListRef.orderByChild('timestamp').startAfter(this.lastTimestamp).on("value", (snapshot) => {
                        snapshot.forEach((data) => {
                            timestamp = data.val().timestamp;
                            timeoffset = this.currentTimestamp + timestamp;
                            if(!data.val().lock || data.val().userId == this.ub_user.id){
                                this.postData.push({postId: data.key, title: data.val().title, userId: data.val().userId, userName: data.val().userName, timeOffset: this.getLocaleTimeString(timeoffset), lock: data.val().lock});
                            }
                        })
                        if(timestamp){
                            this.lastTimestamp = timestamp;
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
                await postListRef.orderByChild('userId').startAt(this.ub_user.id).endAt(this.ub_user.id).once("value", (snapshot) => {
                    snapshot.forEach((data) => {
                        timestamp = data.val().timestamp;
                        timeoffset = this.currentTimestamp + timestamp;
                        this.MyData.push({postId: data.key, title: data.val().title, userId: data.val().userId, userName: data.val().userName, timeOffset: this.getLocaleTimeString(timeoffset), lock: data.val().lock});
                    })
                    var myDataLen = this.MyData.length;
                    for(var i=myDataLen-1; i >= (myDataLen -10 >=0? myDataLen -10 : 0); i--){
                        this.postData.push(this.MyData[i]);
                    }
                    this.myNextIndex = i;
                })
                this.fetching = false;
            } catch (e) {
                console.log(e);
                alert(e);
            }
        },
        async toggleListMode(){
            this.myList = !this.myList;
            if(this.myList){
                this.fetchMy();
            }
            else{
                this.fetchAll();
            }
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
</style>
  