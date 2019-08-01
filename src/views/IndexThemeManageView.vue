<template>
  <div>
    <div class='tools-bar'>
      <el-button size='mini' @click='handleAdd()'>新增主题</el-button>
    </div>
    <div class='table-block'>
      <el-table :data='dataList' v-loading='tableLoading' :height='maxHeight'>
        <el-table-column prop='id' label='主题ID'></el-table-column>
        <el-table-column prop='id' label='主题头像'>
          <template slot-scope='scope'>
            <img class='table-img' :src='scope.row.icon'/>
          </template>
        </el-table-column>
        <el-table-column prop='name' label='主题名称'></el-table-column>
        <el-table-column prop='description' label='主题介绍'></el-table-column>
        <el-table-column prop='category' label='所属类别'></el-table-column>
        <el-table-column prop='follow_users_count' label='订阅人数'></el-table-column>
        <el-table-column prop='cards_count' label='动态总数'></el-table-column>
        <el-table-column prop='sort' label='排序'></el-table-column>
        <el-table-column label='操作'>
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
    <el-dialog title='新增/修改主题类别' :visible.sync='showEditDialog' class='edit-dialog' width='500'>
      <div class='config-block'>
        <table>
          <tr>
            <td>主题ID</td>
            <td>
              <el-input v-model='idInp' @input='handleGetTopicDetail(idInp)'/>
            </td>
          </tr>
          <tr>
            <td>主题名称</td>
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
      dataList: [],
      maxHeight: 0,
      showEditDialog: false,
      idInp: '',
      sortInp: '',
      uploadCover: '',
      paginate: '',
      isDisable: false,
      currentPage: 1,
      nameTips: ''
    }
  },
  created(){
    this.maxHeight = window.innerHeight - 210
    this.handleGetList()
  },
  methods: {
    handleAdd: function(){
      this.isDisable = false
      this.currentScope = ""
      this.idInp = ''
      this.sortInp = ''
      this.nameTips = ''
      this.showEditDialog = true
    },
    handleShowEdit: function(scope){
      this.isDisable = true
      this.currentScope = scope
      this.idInp = scope.row.id
      this.sortInp = scope.row.sort
      this.handleGetTopicDetail(scope.row.id)
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
      this.$utils.axiosRequest('GET', `/recommend-topics`, data, '', res=>{
        this.dataList = res.data.list
        this.paginate = res.data.paginate
      },res=>{

      })
    },
    handleGetTopicDetail: function(id){
      if(id == ""){
        this.nameTips = ''
        return 
      }
      let data = {
        id
      }
      this.$utils.axiosRequest('GET', `/topic/info`, data, '', res=>{
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
          old_id:scope.row.id,
          recommend_to_index: 0
        }
        this.$utils.axiosRequest('POST', `/recommend-topic/store`, '', data, res=>{
          this.bindPageChange(this.currentPage)
        },res=>{})
      }).catch()
    },
    handleCloseEdit: function(){
      this.showEditDialog = false
    },
    handleEdit: function(){
      let data = {
        old_id: this.currentScope==""?this.idInp:this.currentScope.row.id,
        id: this.idInp,
        recommend_to_index: 1,
        sort: this.sortInp
      }
      this.$utils.axiosRequest('POST', `/recommend-topic/store`, '', data, res=>{
        this.bindPageChange(this.currentPage)
        this.showEditDialog = false
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
