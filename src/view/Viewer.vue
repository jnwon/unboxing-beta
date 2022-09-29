<template>
    <div class="container">
        <div class="col-sm-2"></div>
            <div class="col-sm-8">
                <div class="row" style="height: auto; min-height: 85%;">
                    <h3 v-if="postTitle == ''"><i class="fa fa-spinner fa-spin"/></h3>
                    <h3 style="text-align: left;">{{postTitle}}</h3>
                    <br/>
                    <div v-html="postContents"></div>
                </div>
                <br/>
                <div v-if="postTitle" class="row">
                    <i class="fa fa-arrow-left" @click="moveToList()" style="margin-right: 20%;"/>
                    <i v-if="postFingerPrint == this.ub_fingerPrint" class="fa fa-trash" @click="deleteOk()" style="margin-left: 20%;"/>
                    <i v-else class="far fa-star" @click="toggleTooltip()" style="margin-left: 20%;"/>
                </div>
                <br/>
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
import { mapState } from 'vuex';

export default {
    name: 'view-Viewer',
    data() {
        return {
            // password: 0,
            passwordInput: '',
            postTitle: '',
            postContents: '',
            postFingerPrint: ''
        }
    },
    async mounted() {
        const postRef = db.ref('postsWithContents/'+this.$route.query.postId);
        try{
            await postRef.get().then((snapshot) => {
                this.postTitle = snapshot.val().title;
                this.postContents = snapshot.val().contents;
                // this.password = snapshot.val().password;
                this.postFingerPrint = snapshot.val().fingerPrint;
            })
            window.$('.fa-star').tooltip({title: "준비중입니다!", trigger: "focus"}); 
        } catch (e) {
            console.log(e);
            alert(e);
        }
    },
    computed: {
        ...mapState(['ub_fingerPrint'])
    },
    methods: {
        toggleTooltip() {
            window.$('.fa-star').tooltip('toggle');
        },
        moveToList() {
            router.push('List');
        },
        deletePost() {
            window.$("#deleteConfirm").modal('show');
        },
        async deleteOk() {
            // if(this.passwordInput == this.password){
            if(confirm('정말로 삭제할까요?')){
                var updates = {};
                updates['/postsWithContents/' + this.$route.query.postId] = null;
                updates['/posts/' + this.$route.query.postId] = null;
                try{
                    await db.ref().update(updates);
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
  