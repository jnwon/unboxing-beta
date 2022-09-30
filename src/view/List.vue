<template>
    <div class="container">
        <h2><i class="fas fa-box-open" @click="reload()"/></h2>
        <br/>
        <h3 v-if="init"><i class="fa fa-spinner fa-spin"/></h3>
        <div class="row">
            <div class="col-sm-2"></div>
            <div class="col-sm-8">
                <div class="list-group">
                    <a v-for="(post, index) in postData" :key="index" @click="moveToViewer(post.postId)" href="#" class="list-group-item" style="display: flex; justify-content: space-between;">
                        <span>{{post.title}}&nbsp;<i v-if="post.lock" class="fa fa-lock" style="color: green; font-size: smaller;"/></span>
                        <div>
                            <span :style="'font-size:small; color:' + (post.userId == this.ub_user.id? 'coral' : 'lightgrey')">{{post.userName}}</span><span style="font-size:small; color:lightgrey"> | {{post.timeOffset}}</span>
                        </div>
                    </a>
                </div>
                <div v-if="!init" style="position:relative">
                    <i @click="fetchNext()" class="fa fa-plus"/>
                    <i @click="moveToEditor()" class="fa fa-pen" style="position:absolute; right: 0"/>
                </div>
            </div>
            <div class="col-sm-2"></div>
        </div>
        <p></p>
        <!-- <button v-if="!init" type="submit" class="btn btn-info" @click="querying()">querying</button> -->
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
            init : true,
            currentTimestamp : 0,
            lastTimestamp : 0,
            postData: []
        }
    },
    async mounted() {
        this.currentTimestamp = new Date().getTime();
        const postListRef = db.ref('posts').limitToFirst(10);
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
                this.init = false;
                this.lastTimestamp = timestamp;
            })
        } catch (e) {
            console.log(e);
            alert(e);
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
        async fetchNext() {
            const postListRef = db.ref('posts').limitToFirst(10);
            var timestamp;
            var timeoffset;
            try{
                await postListRef.orderByChild('timestamp').startAfter(this.lastTimestamp).on("value", (snapshot) => {
                    snapshot.forEach((data) => {
                        timestamp = data.val().timestamp;
                        timeoffset = this.currentTimestamp + timestamp;
                        this.postData.push({postId: data.key, title: data.val().title, timeOffset: this.getLocaleTimeString(timeoffset)});
                    })
                    this.lastTimestamp = timestamp;
                })
            } catch (e) {
                console.log(e);
                alert(e);
            }
        },
        async querying() {
            var updates = {};
            const postListRef = db.ref('postsWithContents');
            await postListRef.get().then((snapshots) => {
                snapshots.forEach((snapshot) => {
                    updates['/postsWithContents/' + snapshot.key + '/password'] = 1234;
                })
            })
            await db.ref().update(updates);
            console.log('updated!');
        }
    }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
  