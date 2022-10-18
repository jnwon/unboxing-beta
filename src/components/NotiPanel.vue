<template>
    <div v-if="this.userInfo.user" id="noti" class="sidebar-right">
        <div class="elements-right" style="height: 100%">
            <div class="row" id="notiSections">
            </div>
            <div style="display: flex;"><a href="javascript:void(0)" @click="closeNoti()" style="position:relative; left: 20px"><i class="fa fa-arrow-right"/></a></div>
        </div>
    </div>

    <!-- Modal -->
    <div id="notiSetting" class="modal fade" role="dialog">
        <div class="modal-dialog">
            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
                <div class="modal-body" style="text-align: left;">
                </div>
            </div>
    
        </div>
    </div>
</template>

<script>
// import db from '@/db';

export default {
    name: 'Noti-Panel',
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
        if(this.userInfo.user){
            this.newUserName = this.userInfo.user.name;
            this.newEmail =  this.userInfo.user.email;
        }
    },
    methods: {
        closeNoti() {
            window.$('#noti').css("width", 0);
            window.$('.elements-right').css("opacity", 0);
        }
    }
}
</script>

<style>
    /* The sidebar menu */
    .sidebar-right {
      height: 100%; /* 100% Full-height */
      width: 0; /* 0 width - change this with JavaScript */
      position: fixed;
      z-index: 2; /* Stay on top */
      top: 0;
      right: 0;
      background-color: #80D6EB;
      overflow-x: hidden; 
      padding-top: 20px; /* Place content 60px from the top */
      transition: 0.5s; /* 0.5 second transition effect to slide in the sidebar */
      text-align: right;
    }
    
    /* The sidebar links */
    .sidebar-right a {
      padding: 8px 8px 8px 32px;
      text-decoration: none;
      font-size: medium;
      color: #111;
      display: block;
      transition: 0.3s;
      margin-right: 15px;
    }
    
    /* When you mouse over the navigation links, change their color */
    .sidebar-right a:hover {
      color: #ffffff;
    }

    .elements-right {
        opacity: 0;
        transition: 0.2s;
    }

    @media screen and (max-width: 450px) {
        #notiSections{
            height: auto;
            min-height: 85%;
        }
    }

</style>