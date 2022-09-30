<template>
    <div class="container" style="opacity: 0">
          <h2><i class="fas fa-box-open"/></h2>
          <div id="step1">
            <h3>처음 오셨나요?<br/>사용하실 이름을 입력하세요.</h3>
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
            <h3>또는 백업된 계정 Key를<br/>입력하세요.</h3>
            <br/>
            <div class="row">
                <div class="col-sm-3"></div>
                <div class="col-sm-6">
                    <div class="input-group">
                        <input id="keyInput" type="text" class="form-control" v-model="keyInput" @keydown.enter="recoverAccount()">
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
              <h3><b><span style="color:#80D6EB">{{this.nameInput}}</span></b> 님!</h3>
              <h3>Unboxing에 오신 것을</h3>
              <h3>환영합니다 :)</h3>
          </div>
          <div id="step3" style="opacity: 0">
              <h3 style="color:lightcoral"><i class="fa fa-exclamation-circle"/></h3>
              <h4>생성한 계정정보는 브라우저의<br/>'인터넷 사용 기록 삭제'를 하기 전까지<br/>유효합니다!</h4>
          </div>
          <p></p>
      </div>
  </template>
  
  <script>
  import { mapState, mapMutations } from 'vuex';
  import crypto from 'crypto-js';
  import db from '@/db';
  
  export default {
    name: 'HelloUnboxing',
    data() {
      return {
        nameInput : ''
      }
    },
    computed: {
      ...mapState(['ub_user', 'ub_fingerPrint'])
    },
    mounted() {
      if(!this.ub_user){
        window.$('.container').animate({opacity: 0}, 'slow');
        window.$('.container').animate({opacity: 1}, 'slow');
      }
      else{
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
          var userListRef = db.db.ref('users');
          var newUserRef = userListRef.push();
          var newUserKey = newUserRef.key;
  
          try {
            await newUserRef.set({
              name: this.nameInput,
              tags: null,
              fingerPrint: fingerPrint
            });
            var tagListRef = db.db.ref('users/' + newUserKey + '/tags');
            var newTagRef1 = tagListRef.push();
            var newTagRef2 = tagListRef.push();
            var newTagKey1 = newTagRef1.key;
            var newTagKey2 = newTagRef2.key;
            var updates = {};
            updates['users/' + newUserKey + '/tags/' + newTagKey1] = {name: '일상'};
            updates['users/' + newUserKey + '/tags/' + newTagKey2] = {name: '공부'};
            await db.db.ref().update(updates);
  
            this.setFingerPrint(fingerPrint);
            this.setUserInfo({
              id: newUserKey,
              name: this.nameInput,
              tutorial: 1
            });
            this.setTags([
                {id: newTagKey1, name: '일상'},
                {id: newTagKey2, name: '공부'}
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
          window.$('#keyInput').focus();
          window.$('#keyInput').animate({left: 0}, 'fast', function() {window.$('#keyInput').blur();})
          window.$('#keyInput').animate({left: 0}, 'fast', function() {window.$('#keyInput').focus();})
          window.$('#keyInput').animate({left: 0}, 'fast', function() {window.$('#keyInput').blur();})
          window.$('#keyInput').animate({left: 0}, 'fast', function() {window.$('#keyInput').focus();})
          window.$('#keyInput').animate({left: 0}, 'fast', function() {window.$('#keyInput').blur();})
        }
        else{
          var userListRef = db.db.ref('users');
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
                alert("존재하지 않는 계정정보입니다.");
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
  