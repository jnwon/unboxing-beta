<template>
    <div v-if="this.userInfo" id="setting" class="sidebar">
        <a href="#" v-if="!editingUsername" id="setting-UserName" @click="editUserName()"><span style="margin-right:15px; color:lightcyan;"><b>{{this.userInfo.user.name}}</b></span><span><i class="fa fa-edit"/></span></a>
        <div v-else style="padding: 8px 8px 5px 32px;">
            <input type="text" v-model="newUserName" @keydown.enter="completeEditUserName()" style="width:120px; margin-right: 5px;"/>
            <i class="fa fa-check" style="margin-left: 10px; margin-right: 10px;" @click="completeEditUserName()"></i>
            <i class="fa fa-undo" style="margin-left: 10px; margin-right: 10px;" @click="cancelEditUserName()"></i>
        </div>
        <a href="#">Services</a>
        <a href="#">Clients</a>
        <a href="#">Contact</a>
        <a href="javascript:void(0)" @click="closeSetting()"><i class="fa fa-arrow-left"/></a>
    </div>
</template>

<script>
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
            newUserName: '',
        };
    },
    mounted() {
        this.newUserName = this.userInfo.user.name;
    },
    methods: {
        closeSetting() {
            window.$('#setting').css("width", 0);
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
    }
}
</script>

<style scoped>

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

</style>