<template>
    <div class="container">
        <div class="col-sm-2"></div>
            <div class="col-sm-8">
                <div class="row" style="height: auto; min-height: 85%;">
                    <div style="display: flex">
                        <h3 v-if="postTitle == ''"><i class="fa fa-spinner fa-spin"/></h3>
                        <h3 id="post-title" style="text-align: left; margin-right: 5px">{{postTitle}}&nbsp;
                            <span v-if="lock" style="color: green; font-size: medium;"><i class="fa fa-lock" style="position: relative; bottom: 2px"/></span>
                            <span v-else-if="ub_user && ub_user.id == postUserIdFull && constraint == 2" style="color: #337ab7; font-size: medium;"><i class="fas fa-user-friends" style="position: relative; bottom: 2px"/></span>
                            <span v-else-if="ub_user && ub_user.id == postUserIdFull && constraint == 1" style="color: orange; font-size: medium;"><i class="fas fa-user-plus" style="position: relative; bottom: 2px"/></span>
                        </h3>
                        <a href="#" class="dropdown" v-if="!this.ub_user || this.ub_user.id != postUserIdFull"><h3 style="font-size:medium; padding-top: 3px" class="dropdown-toggle" data-toggle="dropdown"><i class="fas fa-ban"></i></h3>
                            <ul class="dropdown-menu dropdown-menu-right" style="text-align:center">
                                <li @click="reportPost()"><span> {{ $t('post-report') }} </span></li>
                                <li class="divider"></li>
                                <li @click="blockPost()"><span> {{ $t('post-block') }} </span></li>
                            </ul>
                        </a>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size:small; color:grey;">{{postDateTime}}<a href="#disqus_thread" style="margin-left: 5px"><i class="fas fa-comment-dots"></i></a></span>
                        <span style="font-size:small; color:grey">
                            <a href="javascript:void(0)" v-if="this.ub_user && this.ub_user.id != postUserIdFull && !following && !follower" style="color: lightgray; margin-right: 5px" @click="followUser()"><i class="fas fa-user-plus"></i></a>
                            <a href="javascript:void(0)" v-else-if="this.ub_user && this.ub_user.id != postUserIdFull && following && !follower" style="color: #337ab7; margin-right: 5px" @click="unfollowUser()"><i class="fas fa-user-plus"></i></a>
                            <a href="javascript:void(0)" v-else-if="this.ub_user && this.ub_user.id != postUserIdFull && !following && follower" style="color: orange; margin-right: 5px" @click="followUser()"><i class="fas fa-user-plus"></i></a>
                            <a href="javascript:void(0)" v-else-if="this.ub_user && this.ub_user.id != postUserIdFull && following && follower" style="color: green; margin-right: 5px" @click="unfollowUser()"><i class="fas fa-user-friends"></i></a>
                            {{postUserName}}({{postUserId}})&nbsp;
                            <a :href="'/'+postUserIdFull" style="margin-right: 8px"><i class="fa fa-home"></i></a>
                            <a href="#" class="dropdown" v-if="!this.ub_user || this.ub_user.id != postUserIdFull"><i class="fas fa-ban dropdown-toggle" data-toggle="dropdown"></i>
                                <ul class="dropdown-menu dropdown-menu-right" style="text-align:center">
                                    <li @click="reportUser()"><span> {{ $t('user-report') }} </span></li>
                                    <li class="divider"></li>
                                    <li @click="blockUser()"><span> {{ $t('user-block') }} </span></li>
                                </ul>
                            </a>
                        </span>
                        
                    </div>
                    <br/>
                    <div class="alert alert-warning" v-if="parent" style="text-align:left; height: 55px;"><span style="font-size:x-large; margin-left: 10px;">⌜ </span><a :href="'/viewer?postId='+parent" style="color:#8a6d3b; font-size:medium; position:relative; bottom: 8px;">{{parentTitle}}</a></div>
                    <div v-html="postContents" id="contentsArea" v-popover:top="$t('tooltip-tutorial-5')"></div>
                    <br/>
                    <div style="text-align: left">
                        <span v-for="(tag, index) in this.postTags" :key="index" style="margin-right: 15px; font-size: large; color: orange"><b>#{{tag.name}}</b></span>
                        <span><i class="fas fa-share-alt" v-mpopover:top="$t('tooltip-share-link')" v-bspopover:top="'<i class=\'fab fa-twitter share\'></i><i class=\'fab fa-facebook share\'></i><img id=\'kakaoshare\' src=\'./img/icons/kakaotalk.png\'/><i class=\'fa fa-link share\'>'"></i></span>
                        <a href="#" style="position:absolute; right: 5%"><i class="fa fa-angle-up"/></a>
                    </div>
                </div>
                <br/>
                <div v-show="postTitle" class="row">
                    <i class="fa fa-arrow-left" @click="moveToList()" style="margin-right: 20%;" v-popover:top="$t('tooltip-tutorial-3')"/>
                    <i v-if="postFingerPrint == this.ub_fingerPrint" class="fa fa-edit" @click="editPost()"/>
                    <i v-if="postFingerPrint == this.ub_fingerPrint" class="fa fa-trash" @click="deleteOk()" style="margin-left: 20%;"/>
                    <i v-else class="far fa-star" v-tooltip="$t('tooltip-developing')" style="margin-left: 20%;"/>
                    <i v-if="isManager" class="fas fa-flag" :style="'float: right;' + (popup? 'color: green' : '')" @click="toggleAnnouncementPopup()"/>
                    <i v-if="isManager" class="fas fa-bullhorn" :style="'float: right; margin-right: 15px; ' + (announcement? 'color: green' : '')" @click="toggleAnnuncement()"/>
                </div>
                <br/>
                <div id="disqus_thread"></div>
                <div class="parent-contents" style="display:none" v-html="parentContents"></div>
        </div>
        <div class="col-sm-2"></div>
        <p></p>
    </div>

    <!-- Modal -->
    <div id="deleteConfirm" class="modal fade" role="dialog">
        <div class="modal-dialog">
    
            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-body">
                    <input type="text" class="form-control" v-model="passwordInput" @keyup.enter="deleteOk()" placeholder="비밀번호를 입력하세요."/>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-warning" @click="deleteOk()">삭제</button>
                    <button type="button" class="btn btn-default" data-dismiss="modal">취소</button>
                </div>
            </div>
    
        </div>
    </div>

    <div id="reportForm" class="modal fade" role="dialog">
        <div class="modal-dialog">
            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <h3> {{ $t('report-form-header') }} </h3>
                </div>
                <div class="modal-body" style="text-align: left; height: auto; overflow-x: hidden">
                    <textarea class="form-control" rows="10" v-model="reportBody"></textarea>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-info" data-dismiss="modal" @click="submitReport()"> {{ $t('report-form-submit') }} </button>
                    <button class="btn btn-default" data-dismiss="modal"> {{ $t('report-form-cancel') }} </button>
                </div>
            </div>
    
        </div>
    </div>
</template>

<script>
import router from '@/router';
import fb from '@/firebase';
import { mapState, mapMutations } from 'vuex';
import Clipboard from 'clipboard'
import emailjs from '@emailjs/browser';

export default {
    name: 'view-Viewer',
    data() {
        return {
            isManager: false,
            following: false,
            follower: false,
            announcement: false,
            popup : false,
            popupCurrent : '',
            lock: false,
            constraint: 0,
            postTitle: '',
            postContents: '',
            postDateTime: '',
            postUserName: '',
            postUserId: '',
            postUserIdFull: '',
            postTags: {},
            postFingerPrint: '',
            parent: null,
            children: {},
            parentTitle : '',
            parentContents: '',
            postUrl: '',
            reportMode: '',
            reportBody: ''
        }
    },
    created(){
        if(this.ub_fingerPrint == process.env.VUE_APP_MANAGER_FINGERPRINT){
            this.isManager = true;
        }
        if(navigator.language != 'ko' && navigator.language != 'ko-KR'){
            this.$i18n.locale = 'en'
        }
    },
    async mounted() {
        var title;
        var contents;
        var datetime;
        var userName;
        var userIdDisplay;
        var userIdFull;
        var tags;

        if(this.isManager){
            fb.db.ref('announcementPopup').get().then((snapshot) => {
                this.popupCurrent = snapshot.val();
                this.popup = this.$route.query.postId == this.popupCurrent? true : false;
            })
        }

        if(window.Kakao.isInitialized()){
            window.Kakao.cleanup();
        }
        window.Kakao.init('7760cbd5eb273bd5f06a0ede6eba6a86'); 

        var clipboard = new Clipboard('.fa-link', {
            text: function() {
                return location.href
            }
        });
        clipboard.on('success', function(e) {
            console.log(e);
        });
        clipboard.on('error', function(e) {
            console.log(e);
        });

        this.postUrl = location.href;

        (function() { // DON'T EDIT BELOW THIS LINE
            var d = document, s = d.createElement('script');
            s.src = 'https://unboxing-1.disqus.com/embed.js';
            s.setAttribute('data-timestamp', +new Date());
            (d.head || d.body).appendChild(s);
        })();

        const postRef = fb.db.ref('postsWithContents/'+this.$route.query.postId);
        try{
            await postRef.get().then((snapshot) => {
                this.lock = snapshot.val().lock;
                this.constraint = snapshot.val().constraint;
                this.announcement = snapshot.val().announcement;
                title = snapshot.val().title;
                contents = snapshot.val().contents;
                datetime = new Date(-snapshot.val().timestamp).toLocaleString();
                userName = snapshot.val().userName;
                userIdFull = snapshot.val().userId;
                userIdDisplay = userIdFull.slice(snapshot.val().userId.length-4);
                tags = snapshot.val().tags;
                // this.password = snapshot.val().password;
                this.postFingerPrint = snapshot.val().fingerPrint;
                this.parent = snapshot.val().parent;
                this.children = snapshot.val().children;
            })

            var pass = true;
            if(this.constraint == 3) {
                if(this.postFingerPrint != this.ub_fingerPrint){
                    pass = false;
                    alert(this.$t('alert-locked'));
                    this.moveToList();
                }
            }
            else if(this.constraint == 2) {
                if(this.postFingerPrint != this.ub_fingerPrint && !(this.ub_followList.followingList.indexOf(userIdFull) >= 0 && this.ub_followList.followerList.indexOf(userIdFull) >= 0)) {
                    pass = false;
                    alert(this.$t('alert-only-mutual-followers'));
                    this.moveToList();
                }
            }
            else if(this.constraint == 1) {
                if(this.postFingerPrint != this.ub_fingerPrint && !(this.ub_followList.followingList.indexOf(userIdFull) >= 0)) {
                    pass = false;
                    alert(this.$t('alert-only-followers'));
                    this.moveToList();
                }
            }
            
            if (pass) {
                if(isMobile()){
                    contents = contents.replace(/width: 50%/g, "width: 100%");
                    contents = contents.replace(/width: 25%/g, "width: 50%");
                    contents = contents.replace(/width:50%/g, "width: 100%");
                    contents = contents.replace(/width:25%/g, "width: 50%");
                }
                this.postTitle = title;
                this.postContents = contents;
                this.postDateTime = datetime;
                this.postUserName = userName;
                this.postUserId = userIdDisplay;
                this.postUserIdFull = userIdFull;
                this.postTags = tags;

                document.title = title;
                // var contentsText = window.$('#contentsArea').text().substring(0,20);
                // window.$('head').append('<meta property="og:title" content="'+title+'">');
                // window.$('head').append('<meta property="og:description" content="'+contentsText+'">');
                // window.$('head').append('<meta property="og:image" content="/src/assets/android-chrome-512x512.png">');
                
                if(this.postTags && this.ub_tags){
                    this.postTags.forEach((tag) => {
                        this.ub_tags.forEach((t) => {
                            if(t.id == tag.id){
                                tag.name = t.name;
                            }
                        })
                    })
                }

                if(this.ub_followList.followingList.indexOf(this.postUserIdFull) >= 0) {
                    this.following = true;
                }

                if(this.ub_followList.followerList.indexOf(this.postUserIdFull) >= 0) {
                    this.follower = true;
                }
                
                fb.db.ref('posts/' + this.parent + '/title').get().then((snapshot) => {
                    this.parentTitle = snapshot.val();
                })

                if(this.ub_user && this.ub_user.tutorial == 3){
                    window.$("#contentsArea").tooltip('destroy');
                    setTimeout(() => {window.$(".fa-arrow-left").tooltip('show');}, 500)
                }
                else if(this.ub_user && this.ub_user.tutorial == 5) {
                    setTimeout(() => {
                        window.$("#contentsArea").tooltip('show');
                        this.setTutorialStep(0);
                    }, 500)
                }
                else{
                    window.$(".fa-arrow-left").tooltip('destroy');
                    window.$("#contentsArea").tooltip('destroy');
                }

                window.$(document).on('click', "#kakaoshare", () => {
                    var title = window.$('#post-title').text();
                    var contentsText = window.$('#contentsArea').text();
                    var description = contentsText.length > 40? contentsText.substring(0,40) + '..' : contentsText;
                    var imgurl = window.$('#contentsArea img:first').attr('src');
                    if(!imgurl){
                        imgurl = "https://unboxing-200c8.web.app/img/icons/android-chrome-maskable-512x512.png"
                    }
                    window.$('.fa-share-alt').popover('hide');
                    window.Kakao.Share.sendDefault({
                        objectType: 'feed',
                        content: {
                            title: title,
                            description: description,
                            imageUrl: imgurl,
                            link: {
                                mobileWebUrl: location.href,
                                webUrl: location.href
                            },
                        },
                    });
                })

                window.$(document).on('click', ".fa-twitter", () => {
                    window.$('.fa-share-alt').popover('hide');
                    var sendText = window.$('#post-title').text();
                    var sendUrl = location.href
                    window.open("https://twitter.com/intent/tweet?text=" + sendText + "&url=" + sendUrl);
                })

                window.$(document).on('click', ".fa-facebook", () => {
                    window.$('.fa-share-alt').popover('hide');
                    var sendUrl = location.href
                    window.open("http://www.facebook.com/sharer/sharer.php?u=" + sendUrl);
                })

                window.$(document).on('click', ".fa-link", () => {
                    window.$('.fa-share-alt').popover('hide');
                    window.$(".fa-share-alt").tooltip('show');
                    setTimeout(() => {window.$(".fa-share-alt").tooltip('hide');}, 3000)
                })
            }
        } catch (e) {
            console.log(e);
            alert(e);
        }

        function isMobile() {
            var user = navigator.userAgent;
            var is_mobile = false;

            if( user.indexOf("iPhone") > -1 
                || user.indexOf("Android") > -1 
                || user.indexOf("iPad") > -1
                || user.indexOf("iPod") > -1
            ) {
                is_mobile = true; 
            }
            return is_mobile;
        }
    },
    computed: {
        ...mapState(['ub_fingerPrint', 'ub_user', 'ub_tags', 'ub_blockedList', 'ub_followList'])
    },
    methods: {
        ...mapMutations(['setTutorialStep', 'setBlockedPost', 'setBlockedUser', 'setFollowingList', 'setFollwingUser']),
        moveToList() {
            var ownerId = sessionStorage.getItem('currentUnboxingOwnerId');
            if(this.ub_user && this.ub_user.tutorial == 3){
                this.setTutorialStep(4);
            }
            if(ownerId){
                router.push({path: '/'+ownerId, query: {postId: this.$route.query.postId}});    
            }
            else{
                router.push({name: 'List', query: {postId: this.$route.query.postId}});
            }
        },
        editPost() {
            if(this.parent){
                alert(this.$t('alert-editbox'))
            }
            else {
                router.push({name: 'Editor', query: {postId: this.$route.query.postId}});
            }
        },
        deletePost() {
            window.$("#deleteConfirm").modal('show');
        },
        async deleteOk() {
            // if(this.passwordInput == this.password){
            if(confirm(this.$t('confitm-delete'))){
                var updates = {};
                if(this.children){
                    for(var key in this.children){
                        updates['/postsWithContents/' + key] = null;
                        updates['/posts/' + key] = null;
                    }
                }
                if(this.parent){
                    await fb.db.ref('postsWithContents/' + this.parent + '/contents').get().then((snapshot) => {
                        this.parentContents = snapshot.val();
                    })
                    window.$('.parent-contents').find('#'+this.$route.query.postId).remove();
                    updates['/postsWithContents/' + this.parent + '/contents'] = window.$('.parent-contents').html();
                    updates['/postsWithContents/' + this.parent + '/children/' + this.$route.query.postId] = null;
                    updates['/posts/' + this.parent + '/children/' + this.$route.query.postId] = null;
                }
                updates['/postsWithContents/' + this.$route.query.postId] = null;
                updates['/posts/' + this.$route.query.postId] = null;
                try{
                    await fb.db.ref().update(updates);
                    window.$("#deleteConfirm").modal('hide');
                    this.moveToList();
                } catch (e) {
                    console.log(e);
                    alert(e);
                }
            }
            // else{
            //     alert('삭제 비밀번호가 틀렸습니다.');
            // }
        },
        async toggleAnnuncement() {
            this.announcement = !this.announcement;
            var updates = {};
            if(this.children){
                for(var key in this.children){
                    updates['/postsWithContents/' + key + '/announcement'] = this.announcement;
                    updates['/posts/' + key + '/announcement'] = this.announcement;
                }
            }
            updates['/postsWithContents/' + this.$route.query.postId + '/announcement'] = this.announcement;
            updates['/posts/' + this.$route.query.postId + '/announcement'] = this.announcement;
            try{
                await fb.db.ref().update(updates);
            } catch (e) {
                console.log(e);
                alert(e);
            }
        },
        async toggleAnnouncementPopup() {
            this.popup = !this.popup;
            if(this.popup && this.$route.query.postId != this.popupCurrent) {
                this.popupCurrent = this.$route.query.postId
            }
            else if(!this.popup && this.$route.query.postId == this.popupCurrent) {
                this.popupCurrent = null;
            }
            fb.db.ref('announcementPopup').set(this.popupCurrent);
        },
        reportPost() {
            if(this.ub_user){
                this.reportMode = 'post';
                window.$('#reportForm').modal('show');
            }
            else {
                alert(this.$t('report-alert'));
            }
        },
        reportUser() {
            if(this.ub_user){
                this.reportMode = 'user';
                window.$('#reportForm').modal('show');
            }
            else {
                alert(this.$t('report-alert'));
            }
        },
        submitReport() {
            var templateId = 'template_uis7qxi';
            var body = '';
            try{
                if(this.reportMode == 'post'){
                    body = this.ub_user.name + '(' + this.ub_user.id + ') 님으로부터의 게시물 신고 | '
                                + '게시물 제목: ' + this.postTitle + '(' + this.postUrl + ') | '
                                + '게시물 작성자: ' + this.postUserName + '(' + this.postUserIdFull + ') | '
                                + '신고내용: ' + this.reportBody + ' ==================================='
                    emailjs.init('F69oNO4Ob024R0ygE');
                    emailjs.send("service_qqdc6ym",templateId,{
                        title: '[Unboxing]게시물 신고',
                        mail_to: 'unboxing.manager@gmail.com',
                        body: body
                    },'F69oNO4Ob024R0ygE');
                }
                else{
                    body = this.ub_user.name + '(' + this.ub_user.id + ') 님으로부터의 이용자 신고 | '
                                + '신고 이용자: ' + this.postUserName + '(' + this.postUserIdFull + ') | '
                                + '관련 게시물: ' + this.postTitle + '(' + this.postUrl + ') | '
                                + '신고내용: ' + this.reportBody + ' ==================================='
                    emailjs.init('F69oNO4Ob024R0ygE');
                    emailjs.send("service_qqdc6ym",templateId,{
                        title: '[Unboxing]이용자 신고',
                        mail_to: 'unboxing.manager@gmail.com',
                        body: body
                    },'F69oNO4Ob024R0ygE');
                }
                alert(this.$t('report-sucsess'));
            } catch (e) {
                console.log(e);
                alert(e);
            }
        },
        blockPost() {
            if(this.ub_user){
                if(confirm(this.$t('block-confirm'))){
                    this.setBlockedPost(this.$route.query.postId);
                    const newBlockedPostRef = fb.db.ref('users/' + this.ub_user.id + '/blockedPosts').push();
                    newBlockedPostRef.set({postId: this.$route.query.postId});
                    location.href = '/list'
                }
            }
            else {
                alert(this.$t('report-alert'));
            }
        },
        blockUser() {
            if(this.ub_user){
                if(confirm(this.$t('block-confirm'))){
                    this.setBlockedUser(this.postUserIdFull);
                    const newBlockedUserRef = fb.db.ref('users/' + this.ub_user.id + '/blockedUsers').push();
                    newBlockedUserRef.set({userId: this.postUserIdFull});
                    location.href = '/list'
                }
            }
            else {
                alert(this.$t('report-alert'));
            }
        },
        followUser() {
            this.setFollwingUser(this.postUserIdFull);
            fb.db.ref('users/' + this.ub_user.id + '/followingList/' + this.postUserIdFull).set(true);
            fb.db.ref('users/' + this.postUserIdFull + '/followerList/' + this.ub_user.id).set(true);
            this.following = true;
        },
        unfollowUser() {
            var filtered = this.ub_followList.followingList.filter((data) => {
                return data != this.postUserIdFull;
            });
            this.setFollowingList(filtered);
            fb.db.ref('users/' + this.ub_user.id + '/followingList/' + this.postUserIdFull).set(null);
            fb.db.ref('users/' + this.postUserIdFull + '/followerList/' + this.ub_user.id).set(null);
            this.following = false;
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
html, body, #app, .container, .col-sm-8{
    height: 100%
}

img {
    max-width: 100%;
    height: auto;
}

iframe {
    max-width: 100%;
    height: 360px;
}

.alert-warning {
    width: 100%;
    display: block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
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
  