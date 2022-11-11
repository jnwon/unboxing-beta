<template>
    <div class="container" v-if="this.ub_user">
        <div id="overlay" style="display: none"><h3 style="position: fixed; top: 50%; left: 50%"><i class="fa fa-spinner fa-spin"/></h3></div>
        <div class="col-sm-1"></div>
        <div class="col-sm-10">
            <div class="row">
                <div class="col-sm-4">
                    <input type="text" class="form-control" :placeholder="$t('placeholder-posttitle')" v-model="postTitle">
                </div>
                <div class="col-sm-8" style="text-align: left; padding-top:5px">
                    <span v-for="(ub_tag, index) in this.ub_tags" :key="index" :style="'margin-right: 15px; font-size: large;' + (tags[ub_tag.id]? 'color: orange' : 'color: lightgrey')" @click="toggleTag(ub_tag.id)"><b>#{{ub_tag.name}}</b></span>
                </div>
            </div>
            <br/>
            <div class="row">
                <div id="summernote" v-popover:top="$t('tooltip-tutorial-2-1')"></div>
                <!-- <button @click="boxTravel()">each</button> -->
                <i class="fa fa-arrow-left" @click="cancelPost()" style="margin-right: 20%;"/>
                <i v-if="!isEditmode" class="fas fa-folder-open" @click="loadTempPosts()" v-popover:top="$t('tooltip-load-temp-fail')"/>
                <i v-if="!isEditmode" class="fas fa-save" @click="submitPost(this.loadedTempPostId, true)" v-popover:top="$t('tooltip-save-temp')"/>
                <i :class="submitting ? 'fa fa-spinner fa-spin' : 'fa fa-upload'" @click="submitPost(this.loadedTempPostId, false)" style="margin-left: 20%;" v-popover:top="$t('tooltip-tutorial-2-2')"/>
                <i v-if="isManager" class="fas fa-flag" :style="'float: right;' + (popup? 'color: green' : '')" @click="toggleAnnouncementPopup()"/>
                <i v-if="isManager" class="fas fa-bullhorn" :style="'float: right; margin-right: 15px; ' + (announcement? 'color: green' : '')" @click="toggleAnnouncement()"/>
                <i v-else :class="lock? 'fa fa-lock' : 'fa fa-unlock'" :style="'float: right; ' + (lock? 'color: green' : '')" @click="toggleLock()"/>
            </div>
        </div>
        <div class="col-sm-1"></div>
    </div>

    <!-- Modal -->
    <div id="tempPosts" class="modal fade" role="dialog">
        <div class="modal-dialog">
            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">{{ $t('modal-temp-posts-header') }}</h4>
                </div>
                <div class="modal-body">
                    <div class="list-group">
                        <a v-for="(post, index) in tempPosts" :key="index" :id="post.postId" href="#" class="list-group-item" style="display: flex; justify-content: space-between;">
                            <div @click="openTempPost(post.postId)" style="max-width: 45%; text-align: left;">
                                <span>{{post.title}}</span>
                            </div>
                            <div style="max-width: 55%;">
                                <span style="font-size:small; color:grey">{{post.datetime}}</span><i class="fa fa-times" style="margin-left: 10px" @click="removeTempPost(post.postId)"/>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
    
        </div>
    </div>

    <div id="termsOfUse" class="modal fade" role="dialog">
        <div class="modal-dialog">
            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <h3> {{ $t('setting-termsofuse-header') }} </h3>
                </div>
                <div class="modal-body" style="text-align: left; height: 450px; overflow-x: hidden">
                    <div v-html="termsOfUse"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-info" data-dismiss="modal" @click="touAgree()"> {{ $t('setting-privacypolicy-agree') }} </button>
                    <button class="btn btn-default" data-dismiss="modal"> {{ $t('setting-privacypolicy-close') }} </button>
                </div>
            </div>
    
        </div>
    </div>
</template>

<script>
import router from "@/router";
import fb from '@/firebase';
import tou from '@/assets/TermsOfUse.js'
import { mapState, mapMutations } from "vuex";

export default {
    name: 'view-Editor',
    data() {
        return {
            termsOfUse : '',
            termsOfUseAgree : false,
            isEditmode : false,
            isEmpty : true,
            isManager : false,
            announcement : false,
            popup : false,
            popupCurrent : '',
            tempPosts : [],
            loadedTempPostId : null,
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
                                    +'<select class="box-component" style="margin-right: 5px; margin-bottom: 10px">',
            boxTemplateRear : '',
            boxTutorial : '',
            brTail : '<br/>'
        }
    },
    created(){
        if(!this.ub_user){
            location.href="/";
        }
        else{
            if(this.ub_fingerPrint == process.env.VUE_APP_MANAGER_FINGERPRINT){
                this.isManager = true;
            }
        }

        if(navigator.language != 'ko' && navigator.language != 'ko-KR'){
            this.$i18n.locale = 'en'
        }
    },
    async mounted() {

        // window.$('.fa-save').on('show.bs.tooltip', function() {
        //     if(!this.submitting){
        //         window.$('.fa-save + .tooltip > .tooltip-inner').css('display', 'block');
        //     }
        // })
        // window.$('.fa-save').on('hide.bs.tooltip', function() {
        //     window.$('.fa-save + .tooltip > .tooltip-inner').css('display', 'none');
        // })

        this.termsOfUse = tou;

        if(this.isManager){
            fb.db.ref('announcementPopup').get().then((snapshot) => {
                this.popupCurrent = snapshot.val();
            })
        }

        await fb.db.ref('posts').orderByChild('userId').startAt(this.ub_user.id).endAt(this.ub_user.id).once("value", (snapshot) => {
            snapshot.forEach((data) => {
                if(data.val().temp && !data.val().parent){
                    this.tempPosts.push({postId: data.key, title: data.val().title, datetime: new Date(-data.val().timestamp).toLocaleString()});
                }
            })
        })

        if(this.tempPosts.length > 0){
            window.$(".fa-folder-open").tooltip('destroy');
        }

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

        this.boxTemplateRear = this.$t('box-template-rear');
        this.boxTutorial = this.$t('box-tutorial');

        var boxTemplate = this.boxTemplateFront + this.categorySelect + this.boxTemplateRear + (this.ub_user.tutorial == 2? this.boxTutorial : '') + this.brTail;

        var lang = this.$t('summernote-lang');
        var boxTooltip = this.$t('summernote-boxTooltip');

        function BoxButton(context) {
            var ui = window.$.summernote.ui;

            // create button
            var button = ui.button({
                contents: '<i class="fas fa-box-open"/>',
                tooltip: boxTooltip,
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
            lang: lang,
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
                this.isManager? ['view', ['undo', 'redo', 'codeview']] : ['view', ['undo', 'redo']],
            ],
            buttons: {
                box: BoxButton
            },
            callbacks: {
                onImageUpload: async function(files) {
                    for(var i=0; i < files.length; i++){
                        var ref = fb.storage.ref().child(new Date().getTime()+'_'+files[i].name);
                        window.$('#summernote').summernote('disable');
                        window.$('#overlay').show();
                        await ref.put(files[i]).then(() => {
                            ref.getDownloadURL().then(async (url) => {
                                await window.$('#summernote').summernote('insertImage', url, function ($image) {
                                    $image.css('max-width', '100%')
                                });
                                window.$('#overlay').hide();
                                window.$('#summernote').summernote('enable');
                                window.$('#summernote').summernote('pasteHTML', '<p style="text-align: left;"><br/></p>');
                            })
                        })
                    }
                },
                onChange: function(contents) {
                    if((contents == '<p style="text-align: left;"><br></p>' || contents == '')){
                        window.$('.fa-folder-open').show();
                        window.$('.fa-save').hide();
                    }
                    else{
                        window.$('.fa-folder-open').hide();
                        window.$('.fa-save').show();
                    }
                }
            }
        });

        window.$('#summernote').summernote('justifyLeft');

        window.$(document).on('click', '.fa-trash', function(){
            window.$(this).closest('div.box-component').remove();
        })

        if(this.$route.query.postId){
            this.isEditmode = true;
            this.loadPost(this.$route.query.postId)
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
        toggleAnnouncement() {
            this.announcement = !this.announcement;
        },
        toggleAnnouncementPopup() {
            this.popup = !this.popup;
        },
        removeTempPost(postId) {
            var updates = {};
            fb.db.ref('posts/'+postId+'/children').get().then(async (snapshot) => {
                if(snapshot.exists()){
                    snapshot.forEach((data) => {
                        updates['/postsWithContents/' + data.key] = null;
                        updates['/posts/' + data.key] = null;
                    })
                }
                updates['/postsWithContents/' + postId] = null;
                updates['/posts/' + postId] = null;
                try {
                    await fb.db.ref().update(updates);
                } catch (e) {
                    console.log(e);
                    alert(e);
                }
            })
            if(this.loadedTempPostId == postId){
                this.loadedTempPostId = null;
            }
            this.tempPosts = this.tempPosts.filter((post) => {return post.postId != postId})
        },
        loadTempPosts() {
            if(this.tempPosts.length == 0){
                window.$(".fa-folder-open").tooltip('show');
                setTimeout(() => {window.$(".fa-folder-open").tooltip('hide');}, 3000)
            }
            else{
                window.$("#tempPosts").modal('show');
            }
        },
        async openTempPost(postId) {
            this.loadedTempPostId = postId;
            this.loadPost(postId);
        },
        async loadPost(postId) {
            var title;
            var contents;
            var fingerPrint;
            const postRef = fb.db.ref('postsWithContents/'+postId);
            try{
                window.$("#tempPosts").modal('hide');
                await postRef.get().then((snapshot) => {
                    this.lock = snapshot.val().lock;
                    this.announcement = snapshot.val().announcement;
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
                    if(this.isManager){
                        this.popup = postId == this.popupCurrent? true : false;
                    }
                })
                if(fingerPrint != this.ub_fingerPrint){
                    alert(this.$t('alert-forbiden'));
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
        },
        touAgree() {
            this.termsOfUseAgree = true;
            this.submitPost();
        },
        async submitPost(loadedTempPostId, isSavedForTemp) {
            if(this.ub_user.tutorial == 2 && !this.termsOfUseAgree){
                window.$('#summernote').tooltip('destroy');
                window.$(".fa-upload").tooltip('destroy');
                window.$('#termsOfUse').modal('show');
                return 0;
            }

            var date = new Date();
            var boxLock = this.lock;
            var announcement = this.announcement;
            var children = this.children;
            var boxUserInfo = this.ub_user;
            var boxFingerPrint = this.ub_fingerPrint;
            var updates = {};
            
            var postListRef = fb.db.ref('posts');
            var newPostRef = postListRef.push();
            var postKey = loadedTempPostId;
            if(!loadedTempPostId) {
                postKey = this.isEditmode? this.$route.query.postId : newPostRef.key;
            }
            var defaultBoxtitleTail = this.$t('default-boxtitle-tail');

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
                var title = titleInput? titleInput : date.toLocaleString() + defaultBoxtitleTail;
                window.$(element).find("input.box-component").replaceWith('<span class="box-component" tagid="'+tags[0].id+'" style="font-size: large; color: orange"><b>#'+tags[0].name+'</b></span>');
                window.$(element).find("select.box-component").replaceWith('<h3 class="box-component">' + title + '</h3>');
                
                var contents = window.$(element).html();
                var timestamp = isNewBox? -date.getTime() : Number(window.$(element).attr("timestamp"));
                var lock = boxLock;
                var userId = boxUserInfo.id;
                var userName = boxUserInfo.name;
                var fingerPrint = boxFingerPrint;
                var temp = isSavedForTemp? true : null;

                updates['/postsWithContents/' + boxKey] = {
                    title: title,
                    contents: contents,
                    timestamp: timestamp,
                    lock: lock,
                    announcement: announcement,
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
                    announcement: announcement,
                    userId: userId,
                    userName: userName,
                    tags: tags,
                    parent: postKey,
                    temp: temp
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

            var title = this.postTitle == '' ? date.toLocaleString() + this.$t('default-posttitle-tail') : this.postTitle;
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
                    announcement: this.announcement,
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
                    announcement: this.announcement,
                    userId: this.ub_user.id,
                    userName: this.ub_user.name,
                    tags: selectedTags,
                    children: this.children,
                    temp: isSavedForTemp? true : null
                };
                this.submitting = true;
                window.$('#summernote').summernote('disable');
                await fb.db.ref().update(updates);
                if(isSavedForTemp){
                    this.loadedTempPostId = postKey;
                    window.$('.fa-save').tooltip('show');
                    setTimeout(() => {window.$('.fa-save').tooltip('hide');}, 3000)
                    this.submitting = false;
                    window.$('#summernote').summernote('enable');
                    var categories = this.categorySelect;
                    window.$("div.box-component").each(function(index, element){
                        var selectedTagId = window.$(element).find("span.box-component").attr("tagid");
                        var boxTitle = window.$(element).find("h3.box-component").text();
                        window.$(element).find("h3.box-component").replaceWith('<select class="box-component" style="margin-right: 5px">' + categories + '</select>');
                        window.$(element).find("span.box-component").replaceWith('<input class="box-component" type="text" value="' + boxTitle + '">');
                        window.$(element).find("select.box-component").val(selectedTagId).attr("selected", true);
                    })
                }
                else{
                    if(this.ub_user.tutorial == 2){
                        this.setTutorialStep(3);
                    }
                    if(!this.isEditmode){
                        sessionStorage.removeItem('lastTimestamp');
                        sessionStorage.removeItem('myNextIndex');
                    }
                    if(this.isManager){
                        if(this.popup && postKey != this.popupCurrent) {
                            await fb.db.ref('announcementPopup').set(postKey);
                        }
                        else if(!this.popup && postKey == this.popupCurrent) {
                            await fb.db.ref('announcementPopup').set(null);
                        }
                    }
                    router.push({name: 'Viewer', query: {postId: postKey}})
                }
            } catch (e) {
                console.log(e);
                alert(e);
            }
        },
        cancelPost() {
            router.push("List");
        }
    }
}

</script>

<style>
/* .fa-save + .tooltip > .tooltip-inner {
    display: none;
} */

#overlay {
    background-color: rgba(128, 128, 128, 0.3);
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
}
</style>