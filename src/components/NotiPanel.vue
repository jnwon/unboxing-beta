<template>
    <div v-if="this.user" id="noti" class="sidebar-right">
        <div class="elements-right" style="height: 100%">
            <div class="row" id="notiSections">
                <div v-if="notiRendered.length == 0" style="text-align:center">
                    <span>{{$t('noti-noitem')}}</span>
                </div>
                <div v-else class="panel-group" style="float: right; width: 90%; padding-right: 30px; opacity: 0.7;">
                    <div v-for="(noti, index) in notiRendered" :key="index" @click="openNotiPost(noti.postId)" :class="noti.read? 'panel panel-default' : 'panel panel-info'">
                        <div class="panel-heading">{{ noti.postTitle }}</div>
                        <div class="panel-body"> ㄴ <a class="notis" href="javascript:void(0)">{{ noti.comment }}</a></div>
                    </div>
                </div>
            </div>
            <div style="display: flex;"><a class="btns" href="javascript:void(0)" @click="closeNoti()" style="position:relative; left: 20px"><i class="fa fa-arrow-right"/></a><a class="btns" href="javascript:void(0)" style="padding-left: 20px"><i class="fas fa-cog" onclick="$('#notiSetting').modal('show')"/></a></div>
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
        user: {
            type: Object,
            default: null
        },
        noti: {
            type: Array,
            default: null
        }
    },
    data() {
        return {
            notiRendered: []
        };
    },
    mounted() {
        window.$(".sidebar-right").attrchange({
            trackValues: true, // set to true so that the event object is updated with old & new values
            callback: (evnt) => {
                if(evnt.attributeName == "style") { // which attribute you want to watch for changes
                    if(evnt.newValue.search(/inline/i) == -1) {
                        // your code to execute goes here...
                        this.notiRendering();
                    }
                }
            }
        });
    },
    methods: {
        notiRendering() {
            this.notiRendered = [];
            var currentTimestamp = new Date().getTime();
            this.noti.forEach((item) => {
                var timeoffset = currentTimestamp + item.timestamp;
                this.notiRendered.push({postId: item.postId, postTitle: item.postTitle, comment: item.comment, timeoffset: this.getLocaleTimeString(timeoffset), read: item.read})
            })
        },
        closeNoti() {
            window.$('#noti').css("width", 0);
            window.$('.elements-right').css("opacity", 0);
        },
        openNotiPost(postId) {
            //읽음처리
            this.$router.push({name: 'Viewer', query: {postId: postId, ownerId: this.user.id, loginId: this.user.id}});
        },
        getLocaleTimeString(timeoffset) {
            var timeoffsetSeconds = (timeoffset / 1000).toFixed();
            if(timeoffsetSeconds < 60){
                return timeoffsetSeconds + this.$t('seconds-tail');
            }
            else{
                var timeoffsetMinutes = (timeoffsetSeconds / 60).toFixed();
                if(timeoffsetMinutes < 60){
                    return timeoffsetMinutes + this.$t('minutes-tail');
                }
                else{
                    var timeoffsetHours = (timeoffsetMinutes / 60).toFixed();
                    if(timeoffsetHours < 24){
                        return timeoffsetHours + this.$t('hours-tail');
                    }
                    else{
                        var timeoffsetDays = (timeoffsetHours / 24).toFixed();
                        if(timeoffsetDays < 7) {
                            return timeoffsetDays + this.$t('days-tail');
                        }
                        else{
                            var timeoffsetWeeks = (timeoffsetDays / 7).toFixed();
                            if(timeoffsetWeeks < 30) {
                                return timeoffsetWeeks + this.$t('weeks-tail');
                            }
                            else{
                                var timeoffsetMonths = (timeoffsetWeeks / 30).toFixed();
                                return timeoffsetMonths + this.$t('months-tail');
                            }
                        }
                    }
                }
            }
        },
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
      text-align: left;
    }
    
    /* The sidebar links */
    .sidebar-right a.btns {
      padding: 8px 8px 8px 32px;
      text-decoration: none;
      font-size: medium;
      color: #111;
      display: block;
      transition: 0.3s;
      margin-right: 15px;
    }
    
    /* When you mouse over the navigation links, change their color */
    .sidebar-right a.btns:hover {
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
    .panel-heading {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

</style>