<template>
  <div>
    <div class='tools-bar'>
      <el-button size='mini' @click='handleAdd()'>新增主题分类</el-button>
    </div>
    <div class='table-block'>
      <el-table :data='dataList' v-loading='tableLoading' :height='maxHeight'>
        <el-table-column prop='category_id' label='类别ID'></el-table-column>
        <el-table-column prop='category_name' label='类别名称'></el-table-column>
        <el-table-column prop='topics_count' label='包含主题（个）'></el-table-column>
        <el-table-column prop='sort' label='排序'></el-table-column>
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
    <el-dialog title='新增/修改主题类别' :visible.sync='showEditDialog' class='edit-dialog' width='500'>
      <div class='config-block'>
        <table>
          <tr>
            <td>类别ID</td>
            <td>
              <el-input v-model='idInp' @input='handleGetDetail(idInp)'/>
            </td>
          </tr>
          <tr>
            <td>类别名称</td>
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
import { constants } from 'crypto';
export default {
  data(){
    return{
      tableLoading: false,
      dataList: [],
      paginate: '',
      maxHeight: 0,
      showEditDialog: false,
      currentPage: 1,
      currentScope: '',
      idInp: '',
      sortInp: '',
      uploadCover: '',
      nameTips: ''
    }
  },
  created(){
    this.maxHeight = window.innerHeight - 210
    this.handleGetList()
  },
  methods: {
    handleAdd: function(){
      this.currentScope = ''
      this.idInp = ''
      this.sortInp =''
      this.nameTips = ''
      this.showEditDialog = true
    },
    handleUploadSuccess: function(res,file){
      this.uploadCover = file.response.url
    }, 
    bindPageChange: function(val){
      this.currentPage = val
      let data = {
        page: val
      }
      this.handleGetList(data)
    },
    handleGetList: function(data){
      this.$utils.axiosRequest('GET', `/boot-topic-categories`, data, '', res=>{
        this.dataList = res.data.list
        this.paginate = res.data.paginate
      },res=>{

      })
    },
    handleShowEdit: function(scope){
      this.currentScope = scope
      this.idInp = scope.row.category_id
      this.sortInp = scope.row.sort
      this.handleGetDetail(scope.row.category_id)
      this.showEditDialog = true
    },
    handleCloseEdit: function(){
      this.showEditDialog = false
    },
    handleDelete: function(scope){
      this.$confirm('是否执行此操作', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          id: scope.row.id
        }
        this.$utils.axiosRequest('POST', `/boot-topic-category/delete`, '', data, res=>{
          this.bindPageChange(this.currentPage)
        },res=>{

        })
      }).catch()
    },
    handleGetDetail: function(id){
      if(id == ""){
        this.nameTips = ''
        return 
      }
      let data = {
        id
      }
      this.$utils.axiosRequest('GET', `/topic/category/info`, data, '', res=>{
        this.nameTips = res.data.info.name
      },res=>{})
    },
    handleEdit: function(){
      let data = {
        id: this.currentScope==""?undefined:this.currentScope.row.id,
        category_id: this.idInp,
        sort: this.sortInp
      }
      console.log(data)
      this.$utils.axiosRequest('POST', `/boot-topic-category/store`, '', data, res=>{
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
