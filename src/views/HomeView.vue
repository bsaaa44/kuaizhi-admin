<style lang="stylus" scoped>
  .container
    height calc( 100vh - 70px) 
    .left 
      // height 95%
      overflow auto
    .right 
      margin-top 20px
      padding 0 20px
      box-sizing: border-box
      // height 95%
      // overflow auto
</style>


<template>
  <div>
    <el-row class='container'>
      <el-col :span='2' class='left'>
        <nav-bar></nav-bar>
      </el-col>
      <el-col :span='22' class='right'>
        <router-view></router-view>
      </el-col>
    </el-row>
    
  </div>
</template>

<script> 
import NavBar from '../components/NavBar.vue'
export default {
  data(){
    return{

    }
  },
  components: {
    NavBar
  }
}
</script>
