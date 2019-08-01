<style lang="stylus" scoped>
  .header
    width 100%
    height 50px
    background #fff
    color #409EFF
    display flex
    flex-flow row
    justify-content space-between
    padding-left 20px
    padding-right 30px
    align-items center
    box-sizing border-box
    z-index 99
    border-bottom 1px solid #E4E7ED
    // justify-content center
    .text 
      font-size 18px
      font-weight bold
</style>

<template>
  <div class='header'>
    <h1 class='text'>快知管理后台</h1>
    <div class='right'>
      <el-button @click='signOut()' size='mini'>注销</el-button>
    </div>
  </div>
</template>
  
<script>
export default {
  data(){
    return{

    }
  },
  methods: {
    signOut: function(){
      this.$router.push('/')
    }
  }
}
</script>


