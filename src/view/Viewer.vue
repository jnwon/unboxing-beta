<template>
    <div class="container">
        <div class="col-sm-2"></div>
            <div class="col-sm-8">
                <div class="row" style="height: auto; min-height: 85%;">
                    <h3 v-if="postTitle == ''"><i class="fa fa-spinner fa-spin"/></h3>
                    <h3 style="text-align: left;">{{postTitle}}&nbsp;<span v-if="lock" style="color: green; font-size: medium;"><i class="fa fa-lock" style="position: relative; bottom: 2px"/></span></h3>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size:small; color:grey">{{postDateTime}}</span>
                        <span style="font-size:small; color:grey">{{postUserName}}({{postUserId}})</span>
                    </div>
                    <br/>
                    <div class="alert alert-warning" v-if="parent" style="text-align:left; height: 55px;"><span style="font-size:x-large; margin-left: 10px;">⌜ </span><a :href="'/viewer?postId='+parent" style="color:#8a6d3b; font-size:medium; position:relative; bottom: 8px;">{{parentTitle}}</a></div>
                    <div v-html="postContents" id="contentsArea" v-popover:top="$t('tooltip-tutorial-5')"></div>
                    <br/>
                    <div style="text-align: left">
                        <span v-for="(tag, index) in this.postTags" :key="index" style="margin-right: 15px; font-size: large; color: orange"><b>#{{tag.name}}</b></span>
                        <a href="#" style="position:absolute; right: 5%"><i class="fa fa-angle-up"/></a>
                    </div>
                </div>
                <br/>
                <div v-show="postTitle" class="row">
                    <i class="fa fa-arrow-left" @click="moveToList()" style="margin-right: 20%;" v-popover:top="$t('tooltip-tutorial-3')"/>
                    <i v-if="postFingerPrint == this.ub_fingerPrint" class="fa fa-edit" @click="editPost()"/>
                    <i v-if="postFingerPrint == this.ub_fingerPrint" class="fa fa-trash" @click="deleteOk()" style="margin-left: 20%;"/>
                    <i v-else class="far fa-star" v-tooltip="$t('tooltip-developing')" style="margin-left: 20%;"/>
                </div>
                <br/>
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
</template>

<script>
import router from '@/router';
import db from '@/db';
import { mapState, mapMutations } from 'vuex';

export default {
    name: 'view-Viewer',
    data() {
        return {
            // password: 0,
            // passwordInput: '',
            lock: false,
            postTitle: '',
            postContents: '',
            postDateTime: '',
            postUserName: '',
            postUserId: '',
            postTags: {},
            postFingerPrint: '',
            parent: null,
            children: {},
            parentTitle : '',
            parentContents: ''
        }
    },
    created(){
        if(navigator.language != 'ko'){
            this.$i18n.locale = 'en'
        }
    },
    async mounted() {
        var title;
        var contents;
        var datetime;
        var userName;
        var userIdDisplay;
        var tags;
        const postRef = db.db.ref('postsWithContents/'+this.$route.query.postId);
        try{
            await postRef.get().then((snapshot) => {
                this.lock = snapshot.val().lock;
                title = snapshot.val().title;
                contents = snapshot.val().contents;
                datetime = new Date(-snapshot.val().timestamp).toLocaleString();
                userName = snapshot.val().userName;
                userIdDisplay = snapshot.val().userId.slice(snapshot.val().userId.length-4);
                tags = snapshot.val().tags;
                // this.password = snapshot.val().password;
                this.postFingerPrint = snapshot.val().fingerPrint;
                this.parent = snapshot.val().parent;
                this.children = snapshot.val().children;
            })
            if(this.lock && this.postFingerPrint != this.ub_fingerPrint){
                alert(this.$t('alert-locked'));
                this.moveToList();
            }
            else{
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
                this.postTags = tags;
                document.title = title;
                
                if(this.postTags && this.ub_tags){
                    this.postTags.forEach((tag) => {
                        this.ub_tags.forEach((t) => {
                            if(t.id == tag.id){
                                tag.name = t.name;
                            }
                        })
                    })
                }
                
                db.db.ref('posts/' + this.parent + '/title').get().then((snapshot) => {
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
        ...mapState(['ub_fingerPrint', 'ub_user', 'ub_tags'])
    },
    methods: {
        ...mapMutations(['setTutorialStep']),
        moveToList() {
            if(this.ub_user && this.ub_user.tutorial == 3){
                this.setTutorialStep(4);
            }
            router.push({name: 'List', query: {postId: this.$route.query.postId}});
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
                    await db.db.ref('postsWithContents/' + this.parent + '/contents').get().then((snapshot) => {
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
                    await db.db.ref().update(updates);
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
</style>
  