<template>
  <div>
    <div class='tools-block'>
      <el-button type="primary" @click="handleAdd()" size="mini">新增</el-button>
    </div>
    <div class='table-block'>
      <el-table :data='dataList' v-loading='tableLoading' :height='maxHeight'>
        <el-table-column prop='id' label='关键词ID'></el-table-column>
        <el-table-column label='类别'>
          <template slot-scope='scope'>
            {{scope.row.type == 1?"主题":"机器人"}}
          </template>
        </el-table-column>
        <el-table-column prop='keyword' label='关键词'></el-table-column>
        <el-table-column prop='sort' label='排序'></el-table-column>
        <el-table-column prop='id' label='操作'>
          <template slot-scope='scope'>
            <el-button type='text' @click='handleDelete(scope)'>删除</el-button>
            <el-button type='text' @click="handleShowEdit(scope)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class='pagination'>
      <el-pagination v-if="dataList.length!=0"  :total='paginate.total' :page-size=20 layout='total,prev,pager,next,jumper' @current-change='bindPageChange'></el-pagination>
    </div>
    <el-dialog title='新增/修改关键词' :visible.sync="showConfigDialog" width='300px'>
      <el-form :model="configForm" label-position="left" label-width="70px">
        <el-form-item label="关键词">
          <el-input v-model="configForm.keyword" placeholder="请输入关键词" />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="configForm.type" placeholder="请选择类别">
            <el-option label="主题热门" :value="1" />
            <el-option label="机器人热门" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="序号">
          <el-input placeholder="请输入序号" v-model="configForm.sort"/>
        </el-form-item>
        <el-form-item>
          <el-button @click="onCancel">取消</el-button>
          <el-button type="primary" @click="onSubmit">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data(){
    return{
      currentScope: '',
      tableLoading: false,
      configForm: '',
      dataList: [],
      currentPage: 1,
      maxHeight: 0,
      paginate: '',
      showConfigDialog: false
    }
  },
  created(){
    this.maxHeight = window.innerHeight - 210
    this.handleGetList()
  },
  methods: {
    handleAdd: function(){
      this.currentScope = ""
      this.configForm = {
        keyword: "",
        type: "",
        sort: ""
      }
      this.showConfigDialog = true
    },
    onCancel: function(){
      this.configForm = ""
      this.showConfigDialog = false
    },
    handleShowEdit: function(scope){
      this.currentScope = scope
      let configForm = {
        keyword: scope.row.keyword,
        sort: scope.row.sort,
        type: scope.row.type
      }
      this.configForm = configForm
      this.showConfigDialog = true
    },
    onSubmit: function(){
      let data = {
        id: this.currentScope == ""?undefined: this.currentScope.row.id,
        keyword: this.configForm.keyword,
        sort: this.configForm.sort,
        type: this.configForm.type
      }
      this.$utils.axiosRequest('POST', `/search/hot-word/store`, '', data, res=>{
        this.bindPageChange(this.currentPage)
        this.showConfigDialog = false
      },res=>{

      })
    },
    handleDelete: function(scope){
      this.$confirm('是否执行该操作', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          id: scope.row.id
        }
        this.$utils.axiosRequest('POST', `/search/hot-word/delete`, '', data, res=>{
          this.bindPageChange(this.currentPage) 
        },res=>{
  
        })
      }).catch()
    },
    bindPageChange: function(val){
      this.currentPage = val
      this.handleGetList()
    },
    handleGetList: function(){
      let data = {
        page: this.currentPage
      }
      this.$utils.axiosRequest('GET', `/search/hot-words`, data, '', res=>{
        this.dataList = res.data.list
        this.paginate = res.data.paginate
      },res=>{

      })
    }
  }
}
</script>


<style lang="stylus" scoped>

</style>
