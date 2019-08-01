<template>
  <div>
    <div class='tools-bar'>
      <el-button size='mini' @click='handleAddBot()'>新增机器人</el-button>
    </div>
    <div class='table-block'>
      <el-table :data='dataList' v-loading='tableLoading' :height='maxHeight'>
        <el-table-column prop='id' label='机器人ID'></el-table-column>
        <el-table-column label='头像'>
          <template slot-scope='scope'>
            <img :src='scope.row.icon' class='table-img'/>
          </template>
        </el-table-column>
        <el-table-column prop='name' label='名称'></el-table-column>
        <el-table-column prop='description' label='功能介绍'></el-table-column>
        <el-table-column prop='category' label='类别'></el-table-column>
        <el-table-column prop='serve_topics_count' label='服务主题'></el-table-column>
        <el-table-column prop='serve_users_count' label='使用人数'></el-table-column>
        <el-table-column label='运行状态'>
          <template slot-scope='scope'>
            {{scope.row.status == 1?"活跃":scope.row.status == 2?"离线":"繁忙"}}
          </template>
        </el-table-column>
        <el-table-column label='审核状态'>
          <template slot-scope='scope'>
            <el-button v-if='scope.row.type==3' type='text' @click='showEditPop(scope)'>已上架</el-button>
            <div v-if='scope.row.type==1'>已下架</div>
            <div v-if='scope.row.type==2'>审核中</div>
          </template>
        </el-table-column>
        <el-table-column prop='sort' label='顺序'></el-table-column>
        <el-table-column prop='id' label='操作'>
          <template slot-scope='scope'>
            <el-button type='text' @click='handleShowEdit(scope)'>修改</el-button>
            <el-button type='text' @click='handleDelete(scope)'>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class='pagination'>
      <el-pagination v-if="dataList.length!=0"  :total='paginate.total' :page-size=20 layout='total,prev,pager,next,jumper' @current-change='bindPageChange'></el-pagination>
    </div>
    <el-dialog title='添加热门机器人' :visible.sync='showEditDialog' class='edit-dialog' width='500'>
      <div class='config-block'>
        <table>
          <tr>
            <td>机器人ID</td>
            <td>
              <el-input v-model='idInp' @input='handleGetBotDetail(idInp)'/>
            </td>
          </tr>
          <tr>
            <td>机器人名称</td>
            <td>
              {{nameTips}}
            </td>
          </tr>
          <tr>
            <td>排序</td>
            <td>
              <el-input v-model='sortInp'/>
            </td>
          </tr>
        </table>
      </div>
      <div class='btn-block'>
        <el-button type='primary' @click='handleEdit()'>确定</el-button>
        <el-button @click='handleCloseEdit()'>取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data(){
    return{
      tableLoading: false,
      tableLoading2: false,
      upLoading: false,
      dataList: [],
      dataList2: [],
      maxHeight: 0,
      showEditDialog: false,
      idInp: '',
      sortInp: '',
      uploadCover: '',
      nameTips: '',
      paginate: '',
      currentScope: '',
      currentPage: 1
    }
  },
  created(){
    this.maxHeight = window.innerHeight - 210
    this.handleGetList()
  },
  methods: {
    handleShowEdit: function(scope){
      this.currentScope = scope
      this.idInp = scope.row.id
      this.handleGetBotDetail(scope.row.id)
      this.showEditDialog = true
    },
    handleGetBotDetail: function(id){
      if(id == ""){
        this.nameTips = ''
        return 
      }
      let data = {
        id
      }
      this.$utils.axiosRequest('GET', `/robot/info`, data, '', res=>{
        this.nameTips = res.data.info.name
      },res=>{})
    },
    handleDelete: function(scope){
      this.$confirm('是否执行此操作', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          id: scope.row.id,
          old_id: scope.row.id,
          is_hot: 0
        }
        this.$utils.axiosRequest('POST', `/hot-robot/store`, '', data, res=>{
          this.bindPageChange(this.currentPage)
        },res=>{

        })
      }).catch()
    },
    handleAddBot: function(){
      this.idInp = ''
      this.currentScope = ''
      this.nameTips = ''
      this.showEditDialog = true
    },
    bindPageChange: function(val){
      this.currentPage = val
      let data = {
        page: val
      }
      this.handleGetList(data)
    },
    handleGetList: function(data){
      this.$utils.axiosRequest('GET', `/hot-robot/list`, data, '', res=>{
        this.dataList = res.data.list 
        this.paginate = res.data.paginate
      },res=>{

      })
    },
    handleCloseEdit: function(){
      this.showEditDialog = false
    },
    handleEdit: function(){
      let data = {
        old_id: this.currentScope == ""?undefined:this.currentScope.row.id,
        sort: this.sortInp,
        id: this.idInp,
        is_hot: 1
      }
      this.$utils.axiosRequest('POST', `/hot-robot/store`, '', data, res=>{
        this.showEditDialog = false
        this.handleGetList({page: this.currentPage})
      },res=>{

      })
    }
  }  
}
</script>
<style lang="stylus" scoped>
  .omit-3{
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    cursor pointer;
    color:#409EFF
  }
  .tools-bar{
    text-align:center  
    margin-bottom 10px   
  }
  .tools-bar .search-inp{
    width 20%
    margin-right 20px
  }
  .tools-bar .btn{
    margin-right: 20px
  }
  .tools-bar .date-picker{
    margin-right 20px
  }
  .tools-bar .status-selector {
    margin-right 20px
  }
  .table-img 
    width 50px
  .edit-dialog 
    .inp-block
      display flex
      flex-flow row
      align-items center 
      justify-content center
      td
        padding 10px
      label
        // margin-right 20px
      .inp 
        width 300px
    .btn-block 
      margin-top 10px
  .content-block 
    display flex
    flex-flow row
    align-items center
    margin-bottom 20px
    .label 
      flex-shrink 0
    .inp 
      flex-grow 1
  .uploader
    margin-right 20px
    margin-top 10px
    width: 100px;
    height: 100px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  .img-cover 
    width: 100px;
    height: 100px;
    display: block;
  .uploader:hover 
    border-color: #409EFF;
  .avatar-uploader-icon 
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
  .upload-container 
    display flex;
    flex-flow row;
    align-items center
    .uploader 
      margin-right  10px
  .config-block{
    display flex;
    flex-flow column;
    align-items: center;
    margin-bottom 10px
    .inp{
      width: 300px
    }
    h2{
      margin-bottom: 4px
    }
    table{
      td{
        padding: 5px
      }
    }
  }
</style>
