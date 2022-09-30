<template>
    <div class="container">
        <div class="col-sm-1"></div>
        <div class="col-sm-10">
            <div class="row">
                <div class="col-sm-4">
                    <input type="text" class="form-control" placeholder="포스트 제목을 입력하세요" v-model="postTitle">
                </div>
            </div>
            <br/>
            <div class="row">
                <div id="summernote"></div>
                <!-- <button @click="boxTravel()">each</button> -->
                <i class="fa fa-arrow-left" @click="cancelPost()" style="margin-right: 20%;"/>
                <i :class="submitting ? 'fa fa-spinner fa-spin' : 'fa fa-upload'" @click="submitPost()" style="margin-left: 20%;"/>
                <i :class="lock? 'fa fa-lock' : 'fa fa-unlock'" :style="'float: right; ' + (lock? 'color: green' : '')" @click="toggleLock()"/>
            </div>
        </div>
        <div class="col-sm-1"></div>
    </div>

    <!-- Modal -->
    <div id="registerPassword" class="modal fade" role="dialog">
        <div class="modal-dialog">
    
            <!-- Modal content-->
            <div class="modal-content">
            <div class="modal-body">
                <input type="text" class="form-control" v-model="passwordInput" @keyup.enter="submitPost()" placeholder="삭제 비밀번호를 설정하세요."/>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" :disabled="submitting" v-html="submitting ? '<i class=\'fa fa-spinner fa-spin\'/>' : '저장'" @click="submitPost()"></button>
                <button type="button" class="btn btn-default" data-dismiss="modal">취소</button>
            </div>
            </div>
    
        </div>
    </div>
</template>

<script>
import router from "@/router";
import db from '@/db';
import { mapState } from "vuex";

export default {
    name: 'view-Editor',
    data() {
        return {
            submitting : false,
            // passwordInput : '',
            lock : false,
            postTitle : '',
            categorySelect : '',
            postMetadataFront : '<div class="post-component" style="text-align: left;"><select class="post-component">',
            postMetadataRear : '</select>'
                                    +'&nbsp;&nbsp;'
                                    +'<input class="post-component" type="text" placeholder="포스트 제목을 입력하세요">'
                                +'</div><br/>',
            boxTemplateFront : '<div class="box-component" style="text-align: left;">'
                                +'<blockquote>'
                                    +'<select class="box-component">',
            boxTemplateRear : '</select>'
                                    +'&nbsp;&nbsp;'
                                    +'<input class="box-component" type="text" placeholder="박스 제목을 입력하세요"><p><br/></p><p><br/></p>'
                                +'</blockquote>'
                            +'</div><br/>'
        }
    },
    async mounted() {
        this.categorySelect += '<option>그림</option><option>영어단어</option><option>한자공부</option>';

        // var postMetadata = this.postMetadataFront + this.categorySelect + this.postMetadataRear;
        var boxTemplate = this.boxTemplateFront + this.categorySelect + this.boxTemplateRear;

        function BoxButton(context) {
            var ui = window.$.summernote.ui;

            // create button
            var button = ui.button({
                contents: '<i class="fas fa-box-open"/>',
                tooltip: '박스 생성',
                click: function () {
                // invoke insertText method with 'hello' on editor module.
                    context.invoke('editor.pasteHTML', boxTemplate);
                    if(window.$('#summernote').summernote('editor.getLastRange').ec.parentElement.outerHTML.indexOf('note-editable') == -1){
                        window.$('#summernote').summernote('undo');
                    }
                }
            });

            return button.render();   // return button as jquery object
        }

        window.$('#summernote').summernote({
            lang: 'ko-KR',
            height: window.innerHeight-300,
            blockquoteBreakingLevel: 0,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'italic', 'underline', 'clear']],
                ['fontname', ['fontname']],
                ['color', ['color']],
                ['boxButton', ['box']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video']],
                ['view', ['undo', 'redo']],
                // ['view', ['undo', 'redo', 'codeview']],
            ],
            buttons: {
                box: BoxButton
            }
        });

        window.$('#summernote').summernote('justifyLeft');
        // window.$('#summernote').summernote('editor.pasteHTML', postMetadata);
    },
    computed: {
        ...mapState(['ub_user', 'ub_fingerPrint'])
    },
    methods: {
        boxTravel(){
            window.$("div.box-component").each(function(index, element){
                console.log(index, element);
            })
        },
        setPassword() {
            window.$("#registerPassword").modal('show');
        },
        toggleLock() {
            this.lock = !this.lock;
        },
        async submitPost() {
            // if(this.passwordInput){
                var date = new Date();
                var title = this.postTitle == '' ? date.toLocaleString() + '에 저장된 글입니다.' : this.postTitle;
                var contents = window.$(".note-editable").html();
                var postListRef = db.ref('posts');
                var newPostRef = postListRef.push();
                var newPostKey = newPostRef.key;
                var updates = {};
                try {
                    updates['/postsWithContents/' + newPostKey] = {
                        title: title,
                        contents: contents,
                        timestamp: -date.getTime(),
                        lock: this.lock,
                        // password: this.passwordInput
                        userId: this.ub_user.id,
                        userName: this.ub_user.name,
                        tag: null,
                        fingerPrint: this.ub_fingerPrint
                    };
                    updates['/posts/' + newPostKey] = {
                        title: title,
                        timestamp: -date.getTime(),
                        lock: this.lock,
                        userId: this.ub_user.id,
                        userName: this.ub_user.name,
                        tag: null
                    };
                    this.submitting = true;
                    window.$('#summernote').summernote('disable');
                    await db.ref().update(updates);
                    window.$("#registerPassword").modal('hide');
                    router.push({name: 'Viewer', query: {postId: newPostKey}})
                } catch (e) {
                    console.log(e);
                    alert(e);
                    window.$("#registerPassword").modal('hide');
                }
            // }
            // else{
            //     alert("삭제 비밀번호 설정은 필수입니다!")
            // }
        },
        cancelPost() {
            router.push("List");
        }
    }
}

</script>