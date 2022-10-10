<template>
    <div class="container">
        <h2><i class="fas fa-box-open"/></h2>
        <div id="step1" style="opacity: 0">
          <h3> {{ $t('goodbye') }} </h3>
        </div>
    </div>
  </template>
  
  <script>
  
  export default {
    name: 'GoodbyeUnboxing',
    data() {
      return {
      }
    },
    created() {
      if(navigator.language != 'ko'){
          this.$i18n.locale = 'en'
      }
    },
    async mounted() {
        window.$('#step1').animate({opacity: 0}, 'slow');
        window.$('#step1').animate({opacity: 1}, 'slow');
        window.$('#step1').animate({opacity: 1}, 2000);
        window.$('#step1').animate({opacity: 0}, 'slow', function() {location.href="/list"});
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
  