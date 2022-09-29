<template>
    <div class="container" style="opacity: 0">
          <h2><i class="fas fa-box-open"/></h2>
          <div id="step1">
            <h3>이름을 입력하세요.</h3>
            <br/>
            <div class="row">
                <div class="col-sm-3"></div>
                <div class="col-sm-6">
                    <div class="input-group">
                        <input type="text" class="form-control" v-model="nameInput" @keydown.enter="createAccount()">
                        <div class="input-group-btn">
                          <button class="btn btn-default">
                            <i @click="createAccount()" class="fa fa-check"/>
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
          window.$('input').focus();
          window.$('input').animate({left: 0}, 'fast', function() {window.$('input').blur();})
          window.$('input').animate({left: 0}, 'fast', function() {window.$('input').focus();})
          window.$('input').animate({left: 0}, 'fast', function() {window.$('input').blur();})
          window.$('input').animate({left: 0}, 'fast', function() {window.$('input').focus();})
          window.$('input').animate({left: 0}, 'fast', function() {window.$('input').blur();})
        }
        else{
          const fingerPrint = crypto.HmacMD5(this.nameInput + new Date().getTime(), 'test').toString();        
          var userListRef = db.ref('users');
          var newUserRef = userListRef.push();
          var newUserKey = newUserRef.key;
  
          try {
            await newUserRef.set({
              name: this.nameInput,
              tags: null,
              fingerPrint: fingerPrint
            });
            var tagListRef = db.ref('users/' + newUserKey + '/tags');
            var newTagRef1 = tagListRef.push();
            var newTagRef2 = tagListRef.push();
            var newTagKey1 = newTagRef1.key;
            var newTagKey2 = newTagRef2.key;
            var updates = {};
            updates['users/' + newUserKey + '/tags/' + newTagKey1] = {name: '일상'};
            updates['users/' + newUserKey + '/tags/' + newTagKey2] = {name: '공부'};
            await db.ref().update(updates);
  
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
  