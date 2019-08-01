<style lang="stylus" scoped>
.container  
  margin-top 300px
  display flex
  flex-flow column
  justify-content center
  .title 
    // font-size: 22px
  .inp 
    margin-top: 20px
  .btn-submit 
    margin-top 20px
    width 100%
</style>


<template>
  <el-row class='container' align='middle'>
    <el-col :span='4' :offset='10'>
      <h1 class='title'>欢迎登录快知管理平台</h1>
      <el-input class='inp' placeholder="请输入用户名" v-model="userName" @keyup.native.enter="handleLogin"></el-input>
      <el-input class='inp' placeholder="请输入密码" type="password" v-model='passWord' @keyup.native.enter="handleLogin"></el-input>
      <el-button class='btn-submit' type='primary' @click='handleLogin'>登录</el-button>
    </el-col>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      userName: '',
      passWord: ''
    }
  },
  methods: {
    handleLogin: function(){
      let data = {
        username: this.userName,
        password: this.passWord
      }
      this.$utils.axiosRequest('POST', '/login', '', data, res=>{
        if(res.data.errno == 0){
          global.userInfo = res.data
          let str = JSON.stringify(res.data)
          sessionStorage.setItem('userInfo', str)
          this.$message({
            message: '登陆成功',
            type: 'success'
          })
          this.$router.push('/home/robotsManageView')
        }
      }, res=>{
        this.$message.error(res.data.errmsg)
      })
    }
  }
}
</script>
