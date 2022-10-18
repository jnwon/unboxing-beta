<template>
  <noti-panel :userInfo="{user: ub_user, fingerPrint: ub_fingerPrint}"></noti-panel>
  <a href="javascript:void(0)" id="notiShortCut" @click="openNotiPanel()"><i class="fas fa-bell"/><span class="badge" style="font-size:x-small; margin-bottom: 23px;">2</span></a>
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
      ref: null,
      interval: null
    }
  },
  computed: {
      ...mapState(['ub_user', 'ub_noti'])
  },
  mounted() {
    if(this.ub_user){
      this.lastTimestampOfNoti = this.ub_user.lastTimestampOfNoti? this.ub_user.lastTimestampOfNoti : 0;
      this.notifications = this.ub_noti;
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
      window.$('#setting').css("width", 0);
      window.$('.elements').css("opacity", 0);
      window.$('#noti').css("width", "300px");
      window.$('.elements-right').css("opacity", 1);
    },
    fetchNotis() {
      try {
        this.ref.orderByChild('timestamp').endBefore(this.lastTimestampOfNoti).once("value", (snapshot) => {
          if(snapshot.exists()){
            var timestampSave = true;
            var notis = [];
            snapshot.forEach((data) => {
              if(timestampSave){
                this.lastTimestampOfNoti = data.val().timestamp;
                timestampSave = false;
              }
                notis.push({commentId: data.key, postId: data.val().postId, comment: data.val().comment, timestamp: data.val().timestamp});
            })
            this.setLastTimestampOfNoti(this.lastTimestampOfNoti);
            this.notifications = notis.concat(this.notifications);
            this.setNoti(this.notifications);
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
