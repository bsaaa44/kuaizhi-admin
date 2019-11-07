<template>
  <div>
    <div class='tools-bar'>
      <el-input size='mini' class='search-inp' v-model='keyword' placeholder="输入类别ID/类别名称" @change='handleSearch'/>
      <el-button type='primary' size='mini' @click='handleSearch'>搜索</el-button>
      <el-button type='primary' class='btn' size='mini' @click='handleClear'>重置</el-button>
      <el-button class='btn' size='mini' @click='handleAdd()'>新增类别</el-button>
    </div>  
    <div class='table-block'>
      <el-table :data='dataList' v-loading='tableLoading' :height='maxHeight'>
        <el-table-column prop='id' label='类别ID' ></el-table-column>
        <el-table-column prop='name' label='类别名称' ></el-table-column>
        <el-table-column prop='image' label='类别图片' >
          <template slot-scope='scope'>
            <img :src='scope.row.image' class='table-img'/>
          </template>
        </el-table-column>
        <el-table-column prop='topics_count' label='包含主题（个）' ></el-table-column>
        <el-table-column prop='sort' label='排序'></el-table-column>
        <el-table-column label='状态'>
          <template slot-scope='scope'>
            {{scope.row.visible == 1?"上架":scope.row.visible==0?"下架":"隐藏但可搜索"}}
          </template>
        </el-table-column>
        <el-table-column label='操作' >
          <template slot-scope='scope'>
            <el-button type='text' @click='handleShowEdit(scope)'>修改</el-button>
            <el-button type='text' @click='handleDelete(scope)'>删除</el-button>
            <el-button type='text' v-if='scope.row.visible!=1' @click='handlePut(scope,1)'>上架</el-button>
            <el-button type='text' v-if='scope.row.visible!=0' @click='handlePut(scope,0)'>下架</el-button>
            <el-button type='text' @click='handlePut(scope,2)'>改为隐藏但可搜索</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class='pagination'>
      <el-pagination v-if="dataList.length!=0"  :total='paginate.total' :page-size=20 layout='total,prev,pager,next,jumper' @current-change='bindPageChange'></el-pagination>
    </div>
    <el-dialog title='新增/修改类目' :visible.sync='showEditDialog' class='edit-dialog' width='300'>
      <div class='inp-block'>
        <div class='content-block'>
          <el-upload v-loading='upLoading' :show-file-list="false" class='uploader' :action='$global.hostUrl+"/upload"' :on-success='handleUploadSuccess'>
            <img v-if='uploadCover.length>0' :src='uploadCover' class='img-cover'>
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </div>
        <table border='0'>
          <tr>
            <td><label for='nameInp'>分类名称</label></td>
            <td><el-input id='nameInp' placeholder="请输入分类名称" v-model='nameInp' class='inp'/></td>
          </tr>
          <tr>
            <td><label for='nameInp'>排序</label></td>
            <td><el-input id='nameInp' placeholder="请输入排序（数字小靠前）" v-model='sortInp' class='inp'/></td>
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
      keyword: '',
      dataList: [],
      tableLoading: false,
      maxHeight: 0,
      paginate: '',
      currentPage: 1,
      currentScope: '',
      showEditDialog: false,
      upLoading: false,
      uploadCover: '',
      sortInp: '',
      nameInp: ''
    }
  },
  created(){
    this.maxHeight = window.innerHeight - 210
    this.handleGetList()
  },
  methods: {
    handlePut: function(scope,status){
      this.$confirm('是否执行该操作', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let data = {
            id: scope.row.id,
            visible: status
          }
          this.$utils.axiosRequest('POST', `/topic/category/visible`, '', data, res=>{
            this.bindPageChange(this.currentPage)
          },res=>{

          })
        }).catch(()=>{

        }) 
    },
    bindPageChange: function(val){
      this.currentPage = val
      let data = {
        keyword : this.keyword,
        page: this.currentPage
      }
      this.handleGetList(data)
    },
    handleClear: function(){
      this.keyword = ''
      this.currentPage = 1
      this.handleGetList()
    },
    handleCloseEdit: function(){
      this.uploadCover = false
      this.nameInp = ''
      this.showEditDialog = false
    },
    handleSearch: function(){
      let data = {
        keyword: this.keyword
      }
      this.handleGetList(data)
    },
    handleGetList: function(data){
      this.$utils.axiosRequest('GET', `/topic/category/list`, data, '', res=>{
        this.dataList = res.data.list,
        this.paginate = res.data.paginate
      },res=>{

      })
    },
    handleUploadSuccess: function(res,file){
      this.uploadCover = file.response.url
    },  
    handleEdit: function(){
      let data = {
        id: this.currentScope ==''?undefined:this.currentScope.row.id,
        sort: this.sortInp,
        image: this.uploadCover,
        name: this.nameInp
      }
      this.$utils.axiosRequest('POST', `/topic/category/store`, '', data, res=>{
        this.bindPageChange(this.currentPage)
        this.showEditDialog = false
      },res=>{

      })
    },
    handleAdd: function(){
      this.currentScope = ''
      this.showEditDialog = true
    },
    handleShowEdit: function(scope){
      this.currentScope = scope
      this.nameInp = scope.row.name
      this.sortInp = scope.row.sort
      this.uploadCover = scope.row.image
      this.showEditDialog = true
    },
    handleDelete: function(scope){
      this.$confirm('是否删除该类别', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          id: scope.row.id
        }
        this.$utils.axiosRequest('POST', `/topic/category/delete`, '', data, res=>{
          this.bindPageChange(this.currentPage)
        },res=>{

        })
      }).catch(()=>{

      })  
    }
  }
}
</script>

<style lang="stylus" scoped>
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
      flex-flow column
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
</style>

