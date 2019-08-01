<template>
  <div>
    <div class='table-block'>
      <el-table :data='dataList' v-loading='tableLoading' :height='maxHeight'>
        <el-table-column prop='id' label='卡片ID'></el-table-column>
        <el-table-column prop='name' label='卡片名称'></el-table-column>
        <el-table-column label='包含主题'>
          <template slot-scope='scope'>
            <el-button type='text' @click='handleShowTheme(scope)' style="width:100%">{{scope.row.topics_count}}</el-button>
          </template>
        </el-table-column>
        <el-table-column label='状态'>
          <template slot-scope='scope'>
            {{scope.row.visible == 1?"上架":"下架"}}
          </template>
        </el-table-column>
        <el-table-column prop="sort" label='顺序'>
          <!-- <template slot-scope='scope'>
            <el-button type='text' style="width:100%">{{scope.row.sort}}</el-button>
          </template> -->
        </el-table-column>
        <el-table-column label='操作'>
          <template slot-scope='scope'>
            <el-button type='text' v-if='scope.row.visible == 1' @click='handlePutGoods(scope,0)'>下架</el-button>
            <el-button type='text' v-else @click='handlePutGoods(scope,1)'>上架</el-button>
            <el-button type='text' @click='handleShowEdit(scope)'>修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class='pagination'>
      <el-pagination v-if="dataList.length!=0"  :total='paginate.total' :page-size=20 layout='total,prev,pager,next,jumper' @current-change='bindPageChange'></el-pagination>
    </div>
    <el-dialog title='修改卡片' :visible.sync='showEditDialog' class='edit-dialog' width='500'>
      <div class='config-block'>
        <table>
          <tr>
            <td>卡片名称</td>
            <td>
              <el-input v-model='nameInp'/>
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
    <el-dialog title='卡片主题' :visible.sync='showThemeDialog' class='edit-dialog' width='500'>
      <el-button size='mini' @click='handleAddTheme()' type='primary'>新增主题</el-button>
      <el-table :data='dataList2' v-loading='tableLoading2' >
        <el-table-column prop='topic_id' label='主题ID'></el-table-column>
        <el-table-column label='主题头像'>
          <template slot-scope='scope'>
            <img :src='scope.row.icon'/>
          </template>
        </el-table-column>
        <el-table-column prop='name' label='主题名称'></el-table-column>
        <el-table-column prop='sort' label='排序'></el-table-column>
        <el-table-column label='操作'>
          <template slot-scope='scope'>
            <el-button type='text' @click='handleThemeEdit(scope)'>修改</el-button>
            <el-button type='text' @click='handleThemeDelete(scope)'>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class='pagination'>
        <el-pagination v-if="dataList2.length!=0"  :total='paginate2.total' :page-size=20 layout='total,prev,pager,next,jumper' @current-change='bindPageChange2'></el-pagination>
      </div>
    </el-dialog>
    <el-dialog title='新增/修改主题' :visible.sync='showEditThemeDialog' class='edit-dialog' width='500'>
      <div class='config-block'>
        <table>
          <tr>
            <td>主题ID</td>
            <td><el-input v-model='idInp' @input='handleGetTopicDetail(idInp)'/></td>
          </tr>
          <tr>
            <td>主题名称</td>
            <td>{{nameTips}}</td>
          </tr>
          <tr>
            <td>排序</td>
            <td><el-input v-model='sortInp'/></td>
          </tr>
        </table>
      </div>
      <div class='btn-block'>
        <el-button type='primary' @click='handleThemeConfirm()'>确定</el-button>
        <el-button @click='handleThemeCancel()'>取消</el-button>
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
      tableLoading2: false,
      dataList: [],
      dataList2: [],
      maxHeight: 0,
      showEditDialog: false,
      nameTips: '',
      showThemeDialog: false,
      showEditThemeDialog: false,
      paginate: '',
      paginate2: '',
      nameInp: '',
      sortInp: '',
      idInp: '',
      sortInp: '',
      currentPage: 1,
      currentPage2: 1,
      currentScope: '',
      currentScope2: '',
      currentScope3: ''
    }
  },
  created(){
    this.maxHeight = window.innerHeight - 210
    this.handleGetList()
  },
  methods: {
    handleAddTheme: function(){
      this.currentScope3 = ''
      this.idInp = ''
      this.nameTips = ''
      this.sortInp = ''
      this.showEditThemeDialog = true
    },  
    handleThemeDelete: function(scope){
      this.$confirm('是否执行此操作', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          id: scope.row.id
        }
        this.$utils.axiosRequest('POST', `/index-recommend-topic/delete`, '', data, res=>{
          this.handleShowTheme(this.currentScope2,this.currentPage2)
        },res=>{
  
        })
      }).catch()
    },
    handleThemeEdit: function(scope){
      this.currentScope3 = scope
      this.idInp = scope.row.topic_id
      this.sortInp = scope.row.sort
      this.handleGetTopicDetail(scope.row.topic_id)
      this.showEditThemeDialog = true
    },
    handleThemeConfirm: function(){
      let data = {
        id: this.currentScope3==""?undefined:this.currentScope3.row.id,
        collection_id: this.currentScope2.row.id,
        sort: this.sortInp,
        topic_id: this.idInp
      }
      this.$utils.axiosRequest('POST', `/index-recommend-topic/store`, '', data, res=>{
        this.showEditThemeDialog = false
        this.handleShowTheme(this.currentScope2,this.currentPage2)
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
    handleThemeCancel: function(){
      this.showEditThemeDialog = false
    },
    handleShowTheme: function(scope,page){
      this.currentScope2 = scope
      let data = {
        id: scope.row.id,
        page
      }
      this.$utils.axiosRequest('GET', `/index-recommend-topics`, data, '', res=>{
        this.showThemeDialog = true
        this.dataList2 = res.data.list
        this.paginate2 = res.data.paginate
      },res=>{})
    },
    bindPageChange2: function(val){
      this.currentPage2 = val
      this.handleShowTheme(this.currentScope2,val)
    },
    handlePutGoods: function(scope,type){
      this.$confirm('是否执行此操作', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          visible: type,
          name: scope.row.name,
          id: scope.row.id
        }
        this.$utils.axiosRequest('POST', `/index-recommend-topic-collection/store`, data, '', res=>{
          this.handleGetList({page: this.currentPage})
        },res=>{
  
        })
      }).catch(()=>{})
    },
    handleShowEdit: function(scope){
      this.nameTips = ''
      this.currentScope = scope
      this.nameInp = scope.row.name
      this.sortInp = scope.row.sort
      this.showEditDialog = true
    },
    handleGetList: function(data){
      this.$utils.axiosRequest('GET', `/index-recommend-topic-collections`, data, '', res=>{
        this.dataList = res.data.list
        this.paginate = res.data.paginate
      },res=>{})
    },
    bindPageChange: function(val){
      this.currentPage = val
      let data = {
        page: val
      }
      this.handleGetList(data)
    },
    handleCloseEdit: function(){
      this.showEditDialog = false
      this.nameInp = ''
      this.sortInp = ''
      this.currentScope = ''
    },
    handleEdit: function(){
      let data = {
        id: this.currentScope.row.id,
        name: this.nameInp,
        sort: this.sortInp
      }
      this.$utils.axiosRequest('POST', `/index-recommend-topic-collection/store`, '', data, res=>{
        this.handleGetList({page: this.currentPage})
        this.showEditDialog = false
        this.nameInp = ''
        this.sortInp = ''
        this.currentScope = ''
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
