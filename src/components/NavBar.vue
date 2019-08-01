<style lang="stylus" scoped>
.container {
  height: 100%;

  .nav-bar {
    height: 100%;
  }
}
</style>

<template>
  <div class="container">
    <el-menu class="nav-bar" default-active="/home/robotsManageView" mode="vertical" :router="true">
      <el-menu-item index="/home/robotsManageView">机器人管理</el-menu-item>
      <el-menu-item index="/home/categoryManageView">机器人类别</el-menu-item>
      <el-menu-item index="/home/robotsCheckView">机器人审核</el-menu-item>
      <el-menu-item index="/home/topicManageView">主题管理</el-menu-item>
      <el-menu-item index="/home/topicCategoryManageView">主题类别</el-menu-item>
      <el-menu-item index="/home/dataManageView">信息管理</el-menu-item>
      <el-menu-item index="/home/cardMonitorView">信息审核</el-menu-item>
      <el-menu-item index="/home/tabManageView">首页推荐卡片</el-menu-item>
      <el-menu-item index="/home/bannerManageView">机器人banner</el-menu-item>
      <el-menu-item index="/home/hotManageView">热门机器人</el-menu-item>
      <el-menu-item index="/home/guidCategoryManageView">引导页分类</el-menu-item>
      <el-menu-item index="/home/indexThemeManageView">首页推荐主题</el-menu-item>
      <el-menu-item index="/home/userManageView">用户管理</el-menu-item>
      <el-menu-item index="/home/keywordManageView">搜索关键词</el-menu-item>
      <el-menu-item index="/home/gzhManageView">微信公众号管理</el-menu-item>
      <el-menu-item index="/home/qrcodeManageView">二维码管理</el-menu-item>
      <el-menu-item index="/home/originalRobotManage">原创机器人</el-menu-item>
      <el-menu-item index="/home/originalCardManage">原创内容</el-menu-item>
      <el-menu-item index="/home/botsMonitor">机器人监控</el-menu-item>
      <el-menu-item index="/home/pictureMonitor">图片监控</el-menu-item>
      <el-menu-item index="/home/topicsMonitor">主题任务监控</el-menu-item>
      <el-menu-item index="/home/mediaMonitor">视频图片监控</el-menu-item>
      <el-menu-item index="/home/labelManageView">标签管理</el-menu-item>
      <!-- <el-menu-item index="/home/groupQrcodeManage">内测群图片</el-menu-item> -->
    </el-menu>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>
