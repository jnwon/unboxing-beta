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
                <div id="summernote" v-popover:top="'메뉴막대의 박스 아이콘을 눌러서 박스를 생성해보세요.'"></div>
                <!-- <button @click="boxTravel()">each</button> -->
                <i class="fa fa-arrow-left" @click="cancelPost()" style="margin-right: 20%;"/>
                <i :class="submitting ? 'fa fa-spinner fa-spin' : 'fa fa-upload'" @click="submitPost()" style="margin-left: 20%;" v-popover:top="'이제 포스트를 발행해보세요!'"/>
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
import { mapState, mapMutations } from "vuex";

export default {
    name: 'view-Editor',
    data() {
        return {
            isEditmode : false,
            submitting : false,
            tags : [],
            postTags : [],
            lock : false,
            postTitle : '',
            postTimestamp : 0,
            children : {},
            postChildren : {},
            categorySelect : '',
            boxTemplateFront : '<div class="box-component" style="text-align: left;">'
                                +'<blockquote style="text-align: left;">'
                                    +'<select class="box-component" style="margin-right: 5px">',
            boxTemplateRear : '</select>'
                                    +'<input class="box-component" type="text" placeholder="박스 제목을 입력하세요"><i class="fa fa-trash" style="margin-left: 15px"></i><p><br/></p><p><br/></p>'
                                +'</blockquote>'
                            +'</div>',
            boxTutorial : '<p style="color: orange; text-align: left"><b>박스는 포스트 속의 하위 포스트예요.<br/><br/>'
                                +'부모 포스트의 내용에 함께 포함되어있지만, 박스 또한 개별적으로 열람 가능한 하나의 독립적인 포스트지요.<br/><br/>'
                                +'설정해둔 박스 태그분류를 통해 박스끼리만 분류해서 모아서 볼 수도 있답니다 :D<br/><br/>'
                                +'한 포스트 안에 여러 개의 박스를 넣을수도 있어요!</b><br/></p>',
            brTail : '<br/>'
        }
    },
    created(){
        if(!this.ub_user){
            location.href="/";
        }
    },
    async mounted() {

        if(this.ub_user.tutorial == 2){
            window.$('#summernote').tooltip('show');
        }
        else{
            window.$(".fa-upload").tooltip('destroy');
        }

        this.ub_tags.forEach((tag) => {
            this.tags[tag.id] = 0;
            this.categorySelect += '<option value=' + tag.id + '>' + tag.name + '</option>'
        })

        var boxTemplate = this.boxTemplateFront + this.categorySelect + this.boxTemplateRear + (this.ub_user.tutorial == 2? this.boxTutorial : '') + this.brTail;

        function BoxButton(context) {
            var ui = window.$.summernote.ui;

            // create button
            var button = ui.button({
                contents: '<i class="fas fa-box-open"/>',
                tooltip: '박스 생성',
                click: function () {
                // invoke insertText method with 'hello' on editor module.
                    context.invoke('editor.pasteHTML', boxTemplate);
                    window.$('#summernote').tooltip('hide');
                    if(window.$('#summernote').summernote('editor.getLastRange').ec.parentElement.outerHTML.indexOf('note-editable') == -1){
                        window.$('#summernote').summernote('undo');
                    }
                    setTimeout(() => {window.$(".fa-upload").tooltip('show');}, 1500)
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

        window.$('#summernote').summernote('justifyLeft');

        window.$(document).on('click', '.fa-trash', function(){
            window.$(this).closest('div.box-component').remove();
        })

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

        if(this.$route.query.postId){
            this.isEditmode = true;

            var title;
            var contents;
            var fingerPrint;
            const postRef = db.db.ref('postsWithContents/'+this.$route.query.postId);
            try{
                await postRef.get().then((snapshot) => {
                    this.lock = snapshot.val().lock;
                    title = snapshot.val().title;
                    contents = snapshot.val().contents;
                    fingerPrint = snapshot.val().fingerPrint;
                    this.postTimestamp = snapshot.val().timestamp;
                    if(snapshot.val().tags){
                        this.postTags = snapshot.val().tags;
                    }
                    if(snapshot.val().children){
                        this.postChildren = snapshot.val().children;
                    }
                })
                if(fingerPrint != this.ub_fingerPrint){
                    alert("포스트 작성자만 수정할 수 있습니다.");
                    this.cancelPost();
                }
                else{
                    this.postTitle = title;
                    if(this.postTags.length > 0) {
                        this.postTags.forEach((tag) => {
                            this.tags[tag.id] = true;
                        })
                    }
                    window.$('#summernote').summernote('pasteHTML', contents);
                    window.$(document).find(".fa-trash").css("display", '');

                    var categories = this.categorySelect;
                    window.$("div.box-component").each(function(index, element){
                        var selectedTagId = window.$(element).find("span.box-component").attr("tagid");
                        var boxTitle = window.$(element).find("h3.box-component").text();
                        window.$(element).find("h3.box-component").replaceWith('<select class="box-component" style="margin-right: 5px">' + categories + '</select>');
                        window.$(element).find("span.box-component").replaceWith('<input class="box-component" type="text" value="' + boxTitle + '">');
                        window.$(element).find("select.box-component").val(selectedTagId).attr("selected", true);
                    })
                }
            } catch (e) {
                console.log(e);
                alert(e);
            }
            
        }
    },
    computed: {
        ...mapState(['ub_user', 'ub_tags', 'ub_fingerPrint'])
    },
    methods: {
        ...mapMutations(['setTutorialStep']),
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
            var date = new Date();
            var boxLock = this.lock;
            var children = this.children;
            var boxUserInfo = this.ub_user;
            var boxFingerPrint = this.ub_fingerPrint;
            var updates = {};
            
            var postListRef = db.db.ref('posts');
            var newPostRef = postListRef.push();
            var postKey = this.isEditmode? this.$route.query.postId : newPostRef.key;

            window.$("div.box-component").each(function(index, element){
                window.$(element).find(".fa-trash").css("display", 'none');
                var isNewBox = false;
                var newBoxRef = postListRef.push()
                var boxKey = window.$(element).prop("id")? window.$(element).prop("id") : newBoxRef.key;
                if(!window.$(element).prop("id")){
                    isNewBox = true;
                    window.$(element).prop("id", boxKey);
                    window.$(element).attr("timestamp", -date.getTime());
                }

                var tags = [{
                    id: window.$(element).find("select.box-component").val(),
                    name: window.$(element).find("select.box-component option:checked").text()
                }]
                var titleInput = window.$(element).find("input.box-component").val();
                var title = titleInput? titleInput : date.toLocaleString() + '에 저장된 박스입니다.'
                window.$(element).find("input.box-component").replaceWith('<span class="box-component" tagid="'+tags[0].id+'" style="font-size: large; color: orange"><b>#'+tags[0].name+'</b></span>');
                window.$(element).find("select.box-component").replaceWith('<h3 class="box-component">' + title + '</h3>');
                
                var contents = window.$(element).html();
                var timestamp = isNewBox? -date.getTime() : Number(window.$(element).attr("timestamp"));
                var lock = boxLock;
                var userId = boxUserInfo.id;
                var userName = boxUserInfo.name;
                var fingerPrint = boxFingerPrint;

                updates['/postsWithContents/' + boxKey] = {
                    title: title,
                    contents: contents,
                    timestamp: timestamp,
                    lock: lock,
                    userId: userId,
                    userName: userName,
                    tags: tags,
                    fingerPrint: fingerPrint,
                    parent: postKey
                };
                updates['/posts/' + boxKey] = {
                    title: title,
                    timestamp: timestamp,
                    lock: lock,
                    userId: userId,
                    userName: userName,
                    tags: tags,
                    parent: postKey
                };

                children[boxKey] = title;
            })
            
            for(var key in children) {
                delete this.postChildren[key];
            }
            for(var ley in this.postChildren) {
                updates['/postsWithContents/' + ley] = null;
                updates['/posts/' + ley] = null;
            }

            var title = this.postTitle == '' ? date.toLocaleString() + '에 저장된 글입니다.' : this.postTitle;
            var contents = window.$(".note-editable").html();
            var selectedTags = {}
            var i=0, k=0;
            for(var mey in this.tags) {
                if(this.tags[mey]){
                    selectedTags[k++] = {id: mey, name: this.ub_tags[i].name}
                }
                i++;
            }

            try {
                updates['/postsWithContents/' + postKey] = {
                    title: title,
                    contents: contents,
                    timestamp: this.isEditmode? this.postTimestamp : -date.getTime(),
                    lock: this.lock,
                    userId: this.ub_user.id,
                    userName: this.ub_user.name,
                    tags: selectedTags,
                    fingerPrint: this.ub_fingerPrint,
                    children: this.children
                };
                updates['/posts/' + postKey] = {
                    title: title,
                    timestamp: this.isEditmode? this.postTimestamp : -date.getTime(),
                    lock: this.lock,
                    userId: this.ub_user.id,
                    userName: this.ub_user.name,
                    tags: selectedTags,
                    children: this.children
                };
                this.submitting = true;
                window.$('#summernote').summernote('disable');
                await db.db.ref().update(updates);
                if(this.ub_user.tutorial == 2){
                    this.setTutorialStep(3);
                }
                window.$("#registerPassword").modal('hide');
                if(!this.isEditmode){
                    sessionStorage.removeItem('lastTimestamp');
                    sessionStorage.removeItem('myNextIndex');
                }
                router.push({name: 'Viewer', query: {postId: postKey}})
            } catch (e) {
                console.log(e);
                alert(e);
                window.$("#registerPassword").modal('hide');
            }
        },
        cancelPost() {
            router.push("List");
        }
    }
}

</script>