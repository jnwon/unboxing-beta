<template>
  <noti-panel :noti="ub_noti" :user="ub_user" ref="notiPanel"></noti-panel>
  <a href="javascript:void(0)" id="notiShortCut" style="opacity: 0" @click="openNotiPanel()"><i class="fas fa-bell"/><span class="badge" style="font-size:x-small; margin-bottom: 23px;">{{unread}}</span></a>
  <router-view/>
</template>

<script>
import db from '@/db';
import NotiPanel from '@/components/NotiPanel.vue';
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'App',
  components: { NotiPanel },
  data() {
    return {
      notifications: [],
      lastTimestampOfNoti: 0,
      unread: 0,
      ref: null,
      interval: null
    }
  },
  computed: {
      ...mapState(['ub_user', 'ub_noti'])
  },
  mounted() {
    window.$('#notiShortCut').hide();
    if(this.ub_user){
      this.lastTimestampOfNoti = this.ub_user.lastTimestampOfNoti? this.ub_user.lastTimestampOfNoti : 0;
      this.notifications = this.ub_noti;
      this.notifications.forEach((comment) => {
        if(!comment.read){
          this.unread++;
        }
      })
      this.ref = db.db.ref('/notifications/' + this.ub_user.id);
      this.interval = setInterval(this.fetchNotis, 1000);
    }
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
  methods: {
    ...mapMutations(['setNoti', 'setLastTimestampOfNoti']),
    openNotiPanel() {
      window.$('#notiShortCut').hide();
      window.$('#notiShortCut').css("opacity", 0)
      window.$('#setting').css("width", 0);
      window.$('.elements').css("opacity", 0);
      window.$('#noti').css("width", "300px");
      window.$('.elements-right').css("opacity", 1);
    },
    fetchNotis() {
      try {
        this.ref.orderByChild('timestamp').endBefore(this.lastTimestampOfNoti).once("value", async (snapshot) => {
          if(snapshot.exists()){
            var timestampSave = true;
            var notis = [];
            snapshot.forEach((data) => {
              if(timestampSave){
                this.lastTimestampOfNoti = data.val().timestamp;
                timestampSave = false;
              }
              notis.push({commentId: data.key, postId: data.val().postId, postTitle: data.val().postTitle, comment: data.val().comment, timestamp: data.val().timestamp, read: data.val().read});
              this.unread++;
            })
            if(!timestampSave && window.$('.sidebar-right').css('width') == '0px'){
              window.$('#notiShortCut').show();
              window.$('#notiShortCut').animate({opacity: 1}, 'fast');
              window.$('#notiShortCut').animate({opacity: 0}, 'fast');
              window.$('#notiShortCut').animate({opacity: 1}, 'fast');
              window.$('#notiShortCut').animate({opacity: 0}, 'fast');
              window.$('#notiShortCut').animate({opacity: 1}, 'fast');
            }
            this.setLastTimestampOfNoti(this.lastTimestampOfNoti);
            db.db.ref('users/' + this.ub_user.id + '/lastTimestampOfNoti').set(this.lastTimestampOfNoti);
            this.notifications = notis.concat(this.notifications);
            await this.setNoti(this.notifications);
            this.$refs.notiPanel.notiRendering();
          }
        })
      } catch(e) {
        console.log(e);
        alert(e);
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#notiShortCut {
  font-size: large;
  position: fixed;
  z-index: 1;
  bottom: 40%;
  right: 22%;
}

@media screen and (max-width: 450px) {
  #notiShortCut {
    position: fixed;
    z-index: 1;
    bottom: 55px;
    right: 22px;
  }
}
</style>
