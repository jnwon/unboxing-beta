<template>
    <div v-if="this.userInfo.user" id="setting" class="sidebar">
        <div class="elements">
            <a href="javascript:void(0)" v-if="!editingUsername" id="setting-UserName" @click="editUserName()"><span style="margin-right:15px; color:lightcyan;"><b>{{this.userInfo.user.name}}</b></span><span><i class="fa fa-edit"/></span></a>
            <div v-else style="padding: 8px 8px 5px 32px;">
                <input type="text" v-model="newUserName" @keydown.enter="completeEditUserName()" style="width:120px; margin-right: 5px;"/>
                <i class="fa fa-check" style="margin-left: 10px; margin-right: 10px;" @click="completeEditUserName()"></i>
                <i class="fa fa-undo" style="margin-left: 10px; margin-right: 10px;" @click="cancelEditUserName()"></i>
            </div>
            <a v-if="userInfo.user.email && !editingEmail && !authingEmail" href="javascript:void(0)" @click="editingEmail = true"><span style="margin-right:15px;" id="setting-Email" v-popover:top="$t('tooltip-setting-email')">{{this.userInfo.user.email}}</span><span><i class="fa fa-edit"/></span></a>
            <a v-else-if="!userInfo.user.email && !editingEmail && !authingEmail" href="javascript:void(0)" @click="editingEmail = true">{{ $t('setting-email-register') }}</a>
            <div v-else-if="editingEmail && !authingEmail" style="padding: 8px 8px 5px 32px;">
                <input type="text" id="inputEmail" placeholder="sample@sam.ple" v-model="newEmail" v-popover:top="$t('tooltip-setting-email-input')" @keydown.enter="authEmail()" style="width:120px; margin-right: 5px;"/>
                <i class="fa fa-check" style="margin-left: 10px; margin-right: 10px;" @click="authEmail()"></i>
                <i class="fa fa-undo" style="margin-left: 10px; margin-right: 10px;" @click="cancelEditEmail()"></i>
            </div>
            <div v-else-if="!editingEmail && authingEmail" style="padding: 8px 8px 5px 32px;">
                <input type="text" id="inputAuth" :placeholder="$t('setting-placeholder-authnumber')" v-model="authNumber" v-popover:top="$t('tooltip-setting-auth-input')" @keydown.enter="confirmAuth()" style="width:120px; margin-right: 5px;"/>
                <i class="fa fa-check" style="margin-left: 10px; margin-right: 10px;" @click="confirmAuth()"></i>
                <i class="fa fa-undo" style="margin-left: 10px; margin-right: 10px;" @click="cancelEditEmail()"></i>
            </div>
            <div style="display: flex;"><a href="javascript:void(0)" style="position:relative; left: 170px" v-tooltip="$t('tooltip-developing')">My Unboxing</a><a href="javascript:void(0)" style="position:absolute; right: 0px"><i class="fas fa-wrench"></i></a></div>
            <a href="javascript:void(0)" @click="toggleAnnouncementView()"> {{ this.userInfo.user.noAnnouncement ? $t('setting-accouncement-no') : $t('setting-accouncement-yes') }} </a>
            <br/>
            <a href="javascript:void(0)" @click="logOut()">{{ $t('setting-logout') }}</a>
            <a href="javascript:void(0)" @click="backup()">{{ $t('setting-backup') }}</a>
            <a href="javascript:void(0)" style="color:crimson" @click="remove()">{{ $t('setting-remove') }}</a>
            <div style="display: flex;"><a href="javascript:void(0)" @click="closeSetting()" style="position:relative; left: 230px"><i class="fa fa-arrow-left"/></a><a href="javascript:void(0)" style="position:absolute; right: 0px"><i class="fas fa-info-circle" onclick="$('#info').modal('show')"></i></a></div>
        </div>
    </div>

    <!-- Modal -->
    <div id="info" class="modal fade" role="dialog">
        <div class="modal-dialog">
            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
                <div class="modal-body" style="text-align: left;">
                    <p>・&nbsp;{{ $t('info-version-label') + $t('info-version') }}</p>
                    <p>・&nbsp;{{ $t('info-contact') }}<a href="mailto:unboxing.manager@gmail.com?subject=[Unboxing]">unboxing.manager@gmail.com</a></p>
                    <p>・&nbsp;{{ $t('info-oss') }}</p>
                    <p v-for="(os, index) in ossList" :key="index" style="padding-left: 10px; margin-bottom: 5px;">
                        <span>{{os.libraryName}}&nbsp;|&nbsp;{{os.version}}&nbsp;|&nbsp;{{os._license}}&nbsp;License</span>
                    </p>
                </div>
            </div>
    
        </div>
    </div>
</template>

<script>
import db from '@/db';
import oss from '@/oss/ossList.json';
import emailjs from '@emailjs/browser';

export default {
    name: 'Setting-Panel',
    props: {
        userInfo: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            editingUsername: false,
            editingEmail: false,
            authingEmail: false,
            authNumber: null,
            ranNum: null,
            newUserName: '',
            newEmail: '',
            ossList: []
        };
    },
    mounted() {
        oss.forEach((os) => {
            this.ossList.push(os);
        })
        this.ossList.push({libraryName: 'font-awesome', version: '5.8.2', _license: 'CC BY 4.0'});
        this.ossList.push({libraryName: 'bootstrap', version: '3.4.1', _license: 'MIT'});
        this.ossList.push({libraryName: 'jquery', version: '3.6.0', _license: 'MIT'});
        this.ossList.push({libraryName: 'summernote', version: '0.8.18', _license: 'MIT'});

        if(this.userInfo.user){
            this.newUserName = this.userInfo.user.name;
            this.newEmail =  this.userInfo.user.email;
        }
    },
    methods: {
        closeSetting() {
            window.$('#setting').css("width", 0);
            window.$('.elements').css("opacity", 0);
        },
        editUserName() {
            this.editingUsername = true;
        },
        completeEditUserName() {
            this.$emit('saveNewUserName', this.newUserName);
            this.editingUsername = false;
        },
        cancelEditUserName() {
            this.newUserName = this.userInfo.user.name;
            this.editingUsername = false;
        },
        authEmail() {
            if(this.newEmail){
                this.ranNum = Math.floor(Math.random()*(9999-1111+1)) + 1111;
                // var templateId = navigator.language == 'ko'? 'template_1b8u4wi' : 'template_uis7qxi';
                var templateId = 'template_1b8u4wi';
                try{
                    emailjs.init('F69oNO4Ob024R0ygE');
                    emailjs.send("service_qqdc6ym",templateId,{
                        to_name: this.userInfo.user.name,
                        authcode: this.ranNum,
                        mail_to: this.newEmail,
                        reply_to: 'unboxing.manager@gmail.com'
                    },'F69oNO4Ob024R0ygE');
    
                    alert(this.$t('alert-setting-authnumber'));
                    this.authingEmail = true;
                    this.editingEmail = false;
                } catch (e) {
                    console.log(e);
                    alert(e);
                }
            }
            else{
                window.$("#inputEmail").tooltip('show');
            }
        },
        confirmAuth() {
            if(this.authNumber){
                if(this.authNumber == this.ranNum){
                    this.$emit('saveNewEmail', this.newEmail);
                    this.authingEmail = false;
                    this.editingEmail = false;
                    setTimeout(function() {
                        window.$("#setting-Email").tooltip('show');
                    }, 500)
                    setTimeout(function() {
                        window.$("#setting-Email").tooltip('hide');
                    }, 3000)
                }
                else{
                    alert(this.$t('alert-setting-wrongauth'))
                }
            }
            else{
                window.$("#inputAuth").tooltip('show');
            }
        },
        cancelEditEmail() {
            this.newEmail = this.userInfo.user.email;
            this.authingEmail = false;
            this.editingEmail = false;
        },
        backup() {
            if(this.userInfo.user.email){
                var templateId = 'template_uis7qxi';
                try{
                    emailjs.init('F69oNO4Ob024R0ygE');
                    emailjs.send("service_qqdc6ym",templateId,{
                        to_name: this.userInfo.user.name,
                        accountkey: this.userInfo.fingerPrint,
                        mail_to: this.newEmail,
                        reply_to: 'unboxing.manager@gmail.com'
                    },'F69oNO4Ob024R0ygE');
    
                    alert(this.$t('alert-setting-backup'));
                } catch (e) {
                    console.log(e);
                    alert(e);
                }
            }
            else{
                alert(this.$t('alert-setting-noemail'))
            }
        },
        logOut() {
            if(confirm(this.$t('confirm-logout'))){
                this.$emit('logOut');
            }
        },
        async remove() {
            if(confirm(this.$t('confirm-remove'))){
                var updates = {};
                try{
                    await db.db.ref('posts').orderByChild('userId').startAt(this.userInfo.user.id).endAt(this.userInfo.user.id).once("value", (snapshot) => {
                        snapshot.forEach((data) => {
                            updates['/posts/' + data.key] = null;
                        })
                    })
                    await db.db.ref('postsWithContents').orderByChild('userId').startAt(this.userInfo.user.id).endAt(this.userInfo.user.id).once("value", (snapshot) => {
                        snapshot.forEach((data) => {
                            updates['/postsWithContents/' + data.key] = null;
                        })
                    })
                    db.db.ref().update(updates);
                    db.db.ref('users/' + this.userInfo.user.id).remove()
                    this.$emit('logOut');
                } catch (e) {
                    console.log(e);
                    alert(e);
                }
            }
        },
        toggleAnnouncementView() {
            this.$emit('setAnnouncement');
        }
    }
}
</script>

<style>
    /* The sidebar menu */
    .sidebar {
      height: 100%; /* 100% Full-height */
      width: 0; /* 0 width - change this with JavaScript */
      position: fixed; /* Stay in place */
      z-index: 1; /* Stay on top */
      top: 0;
      left: 0;
      background-color: #80D6EB;
      overflow-x: hidden; /* Disable horizontal scroll */
      padding-top: 60px; /* Place content 60px from the top */
      transition: 0.5s; /* 0.5 second transition effect to slide in the sidebar */
      text-align: right;
    }
    
    /* The sidebar links */
    .sidebar a {
      padding: 8px 8px 8px 32px;
      text-decoration: none;
      font-size: medium;
      color: #111;
      display: block;
      transition: 0.3s;
      margin-right: 15px;
    }
    
    /* When you mouse over the navigation links, change their color */
    .sidebar a:hover {
      color: #ffffff;
    }

    .elements {
        opacity: 0;
        transition: 0.2s;
    }

</style>