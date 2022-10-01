<template>
    <div class="container">
        <div class="col-sm-1"></div>
        <div class="col-sm-10">
            <div class="row">
                <div class="col-sm-4">
                    <input type="text" class="form-control" placeholder="포스트 제목을 입력하세요" v-model="postTitle">
                </div>
                <div class="col-sm-8" style="text-align: left; padding-top:5px">
                    <span v-for="(ub_tag, index) in this.ub_tags" :key="index" :style="'margin-right: 15px; font-size: large;' + (tags[ub_tag.id]? 'color: orange' : 'color: lightgrey')" @click="toggleTag(ub_tag.id)"><b>#{{ub_tag.name}}</b></span>
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
            tags : [],
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
    created(){
        if(!this.ub_user){
            location.href="/";
        }
    },
    async mounted() {

        this.ub_tags.forEach((tag) => {
            this.tags[tag.id] = 0;
            this.categorySelect += '<option>' + tag.name + '</option>'
        })

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
            },
            callbacks: {
                onImageUpload: async function(files) {
                    for(var i=0; i < files.length; i++){
                        var ref = db.storage.ref().child(new Date().getTime()+'_'+files[i].name);
                        window.$('#summernote').summernote('disable');
                        await ref.put(files[i]).then(() => {
                            ref.getDownloadURL().then(async (url) => {
                                await window.$('#summernote').summernote('insertImage', url, function ($image) {
                                    $image.css('max-width', '100%')
                                });
                                window.$('#summernote').summernote('enable');
                                window.$('#summernote').summernote('pasteHTML', '<p style="text-align: left;"><br/></p>');
                            })
                        })
                    }
                }
            }
        });

        // function isMobile() {
        //     var user = navigator.userAgent;
        //     var is_mobile = false;

        //     if( user.indexOf("iPhone") > -1 
        //         || user.indexOf("Android") > -1 
        //         || user.indexOf("iPad") > -1
        //         || user.indexOf("iPod") > -1
        //     ) {
        //         is_mobile = true; 
        //     }
        //     return is_mobile;
        // }

        window.$('#summernote').summernote('justifyLeft');
        // window.$('#summernote').summernote('editor.pasteHTML', postMetadata);
    },
    computed: {
        ...mapState(['ub_user', 'ub_tags', 'ub_fingerPrint'])
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
        toggleTag(tagId) {
            this.tags[tagId] = !this.tags[tagId];
        },
        toggleLock() {
            this.lock = !this.lock;
        },
        async submitPost() {
            // if(this.passwordInput){
                var date = new Date();
                var title = this.postTitle == '' ? date.toLocaleString() + '에 저장된 글입니다.' : this.postTitle;
                var contents = window.$(".note-editable").html();
                var selectedTags = {}
                var i=0, k=0;
                for(var key in this.tags) {
                    if(this.tags[key]){
                        selectedTags[k++] = {id: key, name: this.ub_tags[i].name}
                    }
                    i++;
                }

                var postListRef = db.db.ref('posts');
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
                        tags: selectedTags,
                        fingerPrint: this.ub_fingerPrint
                    };
                    updates['/posts/' + newPostKey] = {
                        title: title,
                        timestamp: -date.getTime(),
                        lock: this.lock,
                        userId: this.ub_user.id,
                        userName: this.ub_user.name,
                        tags: selectedTags
                    };
                    this.submitting = true;
                    window.$('#summernote').summernote('disable');
                    await db.db.ref().update(updates);
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