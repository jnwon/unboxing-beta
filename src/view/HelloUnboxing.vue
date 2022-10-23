<template>
    <div class="container" style="opacity: 0">
          <h2><i class="fas fa-box-open"/></h2>
          <div id="step1">
            <h3> {{ $t('welcome-1') }} <br/> {{ $t('welcome-2') }} </h3>
            <br/>
            <div class="row">
                <div class="col-sm-3"></div>
                <div class="col-sm-6">
                    <div class="input-group">
                        <input id="nameInput" type="text" class="form-control" v-model="nameInput" @keydown.enter="createAccount()">
                        <div class="input-group-btn">
                          <button class="btn btn-default">
                            <i @click="createAccount()" class="fa fa-check"/>
                          </button>
                        </div>
                    </div>
                </div>
                <div class="col-sm-3"></div>
            </div>
            <br/>
            <br/>
            <h3> {{ $t('welcome-3') }} <br/> {{ $t('welcome-4') }} </h3>
            <br/>
            <div class="row">
                <div class="col-sm-3"></div>
                <div class="col-sm-6">
                    <div class="input-group">
                        <input id="keyInputText" type="text" class="form-control" v-model="keyInput" @keydown.enter="recoverAccount()">
                        <div class="input-group-btn">
                          <button class="btn btn-default">
                            <i @click="recoverAccount()" class="fa fa-check"/>
                          </button>
                        </div>
                    </div>
                </div>
                <div class="col-sm-3"></div>
            </div>
          </div>
          <div id="step2" style="opacity: 0">
              <h3><b><span style="color:#80D6EB">{{this.nameInput}}</span></b> {{ $t('welcome-5') }} </h3>
              <h3> {{ $t('welcome-6') }} </h3>
              <h3> {{ $t('welcome-7') }} </h3>
          </div>
          <div id="step3" style="opacity: 0">
              <h3 style="color:lightcoral"><i class="fa fa-exclamation-circle"/></h3>
              <h4> {{ $t('welcome-8') }} <br/>  {{ $t('welcome-9') }} <br/>  {{ $t('welcome-10') }} </h4>
          </div>
          <p></p>
      </div>
  </template>
  
  <script>
  import { mapState, mapMutations } from 'vuex';
  import crypto from 'crypto-js';
  import fb from '@/firebase';
  
  export default {
    name: 'HelloUnboxing',
    data() {
      return {
        nameInput : ''
      }
    },
    computed: {
      ...mapState(['ub_user', 'ub_tags', 'ub_fingerPrint'])
    },
    created() {
      if(navigator.language != 'ko' && navigator.language != 'ko-KR'){
          this.$i18n.locale = 'en'
      }
    },
    async mounted() {
      if(!this.ub_user){
        window.$('.container').animate({opacity: 0}, 'slow');
        window.$('.container').animate({opacity: 1}, 'slow');
      }
      else{
        try {
          var userId = this.ub_user.id;
          var tutorial = this.ub_user.tutorial;
          var noAnnouncement = this.ub_user.noAnnouncement;
          await fb.db.ref('users/' + userId).get().then((snapshot) => {
            console.log(snapshot.val().name);
            this.setUserInfo({id: userId, name: snapshot.val().name, email: snapshot.val().email, lastTimestampOfNoti: snapshot.val().lastTimestampOfNoti, tutorial: tutorial, noAnnouncement: noAnnouncement})
          })
          var tags = [];
          await fb.db.ref('users/' + userId + '/tags').get().then((snapshot) => {
            snapshot.forEach((data) => {
              tags.push({id: data.key, name: data.val().name});
            })
            this.setTags(tags);
          });
        } catch(e) {
          console.log(e);
          alert(e);
        }
        location.href="/list";
      }
    },
    methods: {
      ...mapMutations(['setUserInfo', 'setTags', 'setFingerPrint']),
      async createAccount() {
        if(!this.nameInput){
          window.$('#nameInput').focus();
          window.$('#nameInput').animate({left: 0}, 'fast', function() {window.$('#nameInput').blur();})
          window.$('#nameInput').animate({left: 0}, 'fast', function() {window.$('#nameInput').focus();})
          window.$('#nameInput').animate({left: 0}, 'fast', function() {window.$('#nameInput').blur();})
          window.$('#nameInput').animate({left: 0}, 'fast', function() {window.$('#nameInput').focus();})
          window.$('#nameInput').animate({left: 0}, 'fast', function() {window.$('#nameInput').blur();})
        }
        else{
          const fingerPrint = crypto.HmacMD5(this.nameInput + new Date().getTime(), 'test').toString();        
          var userListRef = fb.db.ref('users');
          var newUserRef = userListRef.push();
          var newUserKey = newUserRef.key;
  
          try {
            await newUserRef.set({
              name: this.nameInput,
              tags: null,
              fingerPrint: fingerPrint
            });
            var tagListRef = fb.db.ref('users/' + newUserKey + '/tags');
            var newTagRef1 = tagListRef.push();
            var newTagRef2 = tagListRef.push();
            var newTagKey1 = newTagRef1.key;
            var newTagKey2 = newTagRef2.key;
            var updates = {};
            updates['users/' + newUserKey + '/tags/' + newTagKey1] = {name: this.$t('default-tag-1')};
            updates['users/' + newUserKey + '/tags/' + newTagKey2] = {name: this.$t('default-tag-2')};
            await fb.db.ref().update(updates);
  
            this.setFingerPrint(fingerPrint);
            this.setUserInfo({
              id: newUserKey,
              name: this.nameInput,
              tutorial: 1
            });
            this.setTags([
                {id: newTagKey1, name: this.$t('default-tag-1')},
                {id: newTagKey2, name: this.$t('default-tag-2')}
            ])

            window.$('#step1').animate({opacity: 0}, 'slow', function() {window.$('#step1').hide()})
            window.$('#step2').animate({opacity: 0}, 'slow');
            window.$('#step2').animate({opacity: 1}, 'slow');
            window.$('#step2').animate({opacity: 1}, 1000);
            window.$('#step2').animate({opacity: 0}, 'slow', function() {window.$('#step2').hide()})
            window.$('#step3').animate({opacity: 0}, 3000)
            window.$('#step3').animate({opacity: 1}, 'slow')
            window.$('#step3').animate({opacity: 1}, 2000, function() {location.href="/list"});
          } catch (e) {
            console.log(e);
            alert(e);
          }
        }
      },
      async recoverAccount() {
        if(!this.keyInput){
          window.$('#keyInputText').focus();
          window.$('#keyInputText').animate({left: 0}, 'fast', function() {window.$('#keyInputText').blur();})
          window.$('#keyInputText').animate({left: 0}, 'fast', function() {window.$('#keyInputText').focus();})
          window.$('#keyInputText').animate({left: 0}, 'fast', function() {window.$('#keyInputText').blur();})
          window.$('#keyInputText').animate({left: 0}, 'fast', function() {window.$('#keyInputText').focus();})
          window.$('#keyInputText').animate({left: 0}, 'fast', function() {window.$('#keyInputText').blur();})
        }
        else{
          var userListRef = fb.db.ref('users');
          try{
            await userListRef.orderByChild('fingerPrint').startAt(this.keyInput).endAt(this.keyInput).once("value", (snapshot) => {
              if(snapshot.val()){
                const userInfo = snapshot.val();
                const userId = Object.keys(userInfo)[0];
                const userInfoObj = userInfo[userId];
                this.setFingerPrint(userInfoObj.fingerPrint);
                this.setUserInfo({
                  id: userId,
                  name: userInfoObj.name,
                  email: userInfoObj.email,
                  lastTimestampOfNoti : 0,
                  tutorial: 0
                });

                var tags = []
                for (var key in userInfoObj.tags) {
                  tags.push({id: key, name: userInfoObj.tags[key].name})
                }
                this.setTags(tags);

                this.nameInput = userInfoObj.name;
                window.$('#step1').animate({opacity: 0}, 'slow', function() {window.$('#step1').hide()})
                window.$('#step2').animate({opacity: 0}, 'slow');
                window.$('#step2').animate({opacity: 1}, 'slow');
                window.$('#step2').animate({opacity: 1}, 1000);
                window.$('#step2').animate({opacity: 0}, 'slow', function() {window.$('#step2').hide()})
                window.$('#step3').animate({opacity: 0}, 3000)
                window.$('#step3').animate({opacity: 1}, 'slow')
                window.$('#step3').animate({opacity: 1}, 2000, function() {location.href="/list"});
              }
              else {
                alert(this.$t('alert-unknown'));
                return 1;
              }
            });
          } catch(e) {
            console.log(e);
            alert(e);
          }
        }
      }
    }
  }
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style scoped>
  h3 {
    margin: 40px 0 0;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: #42b983;
  }
  </style>
  