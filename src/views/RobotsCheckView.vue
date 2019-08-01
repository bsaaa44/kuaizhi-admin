<template>
  <div>
    <div class='tools-bar'>
      <el-input size='mini' class='search-inp' v-model='keyword' placeholder="输入机器人ID/机器人名称/开发者昵称/开发者ID/功能关键词" @change='handleSearch'/>
      <el-button type='primary' size='mini' @click='handleSearch'>搜索</el-button>
      <el-button type='primary' class='btn' size='mini' @click='handleClear'>重置</el-button>
      <el-date-picker class='date-picker' value-format='yyyy-MM-dd' v-model="dataRange" type="daterange" @change='handleSearch' range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" size='mini'>
      </el-date-picker>
    </div>
    <div class='tools-bar'>
      <el-select class='status-selector' v-model='typeInp' placeholder='类别' @change='handleSearch' size='mini'>
        <el-option v-for='(item,index) in statusList' :key='index' :label='item.label' :value='item.value'></el-option>
      </el-select>
      <el-select class='status-selector' v-model='statusInp' placeholder='运行状态' @change='handleSearch' size='mini'>
        <el-option v-for='(item,index) in statusList2' :key='index' :label='item.label' :value='item.value'></el-option>
      </el-select>
      <el-select class='status-selector' v-model='checkStatusInp' placeholder='审核状态' @change='handleSearch' size='mini'>
        <el-option v-for='(item,index) in statusList3' :key='index' :label='item.label' :value='item.value'></el-option>
      </el-select>
    </div>
    <div class='table-block'>
      <el-table :data='dataList' v-loading='tableLoading' :height='maxHeight'>
        <el-table-column prop='bot_id' label='机器人ID' width="100"></el-table-column>
        <el-table-column prop='created_at' label='创建时间' width="100"></el-table-column>
        <el-table-column label='机器人名称' prop='bot_name' width="150"></el-table-column>
        <el-table-column label='机器人头像' width="100">
          <template slot-scope='scope'>
            <img :src='scope.row.bot_icon' class='table-img'/>
          </template>
        </el-table-column>
        <el-table-column prop="summary" label="推荐语"></el-table-column>
        <el-table-column prop='user_id' label='开发者ID' width="100"></el-table-column>
        <el-table-column prop='username' label='开发者昵称' width="100"></el-table-column>
        <el-table-column prop='token' label='Token'></el-table-column>
        <el-table-column label='基础配置' width="100">
          <!-- <template slot-scope='scope'>
            <el-button type='text'>点击查看</el-button>
          </template> -->
        </el-table-column>
        <el-table-column label='自定义参数' width="100">
          <!-- <template slot-scope='scope'>
            <el-button type='text'>点击查看</el-button>
          </template> -->
        </el-table-column>
        <el-table-column label='更新记录' width="100">
          <template slot-scope='scope'>
            <el-button type='text' @click='handleShowUpdate(scope)'>点击查看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop='bot_status' label='运行状态' width="100">
          <template slot-scope='scope'>{{scope.row.status == 1?"活跃":scope.row.status==2?"离线":"繁忙"}}</template>
        </el-table-column>
        <el-table-column prop='review_status' label='审核状态' width="100">
          <template slot-scope='scope'>
            <div v-if='scope.row.review_status == 0'>审核中</div>
            <el-button type='text' v-if='scope.row.review_status == 1' @click='handleEditSummary(scope)'>已上架</el-button>
            <div v-if='scope.row.review_status == -1'>已下架</div>
          </template>
        </el-table-column>
        <el-table-column label='审核记录' width="100">
          <template slot-scope='scope'>
            <el-button type='text' @click='handleShowCheckData(scope)'>点击查看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop='id' label='审核操作' width="100">
          <template slot-scope='scope'>
            <el-button type='text' v-if='scope.row.review_status == 0||scope.row.review_status == -4||scope.row.review_status == -3||scope.row.review_status == -2||scope.row.review_status == -1' @click='handleOnPut(scope)'>上架</el-button>
            <el-button type='text' v-if='scope.row.review_status == 0' @click='handleRefuse(scope)'>拒绝</el-button>
            <el-button type='text' v-if='scope.row.review_status == 1' @click='handleOutPut(scope)'>下架</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class='pagination'>
      <el-pagination v-if="dataList.length!=0"  :total='paginate.total' :page-size=20 layout='total,prev,pager,next,jumper' @current-change='bindPageChange'></el-pagination>
    </div>
    <el-dialog title='更新记录' :visible.sync='showUpdateDialog' class='data-dialog' width='400'>
      <div v-for='(item,index) in updateList' :key='index' style="margin-top:10px">
        <div class='time'>{{item.created_at}}</div>
        <div class='version'>{{item.version}}</div>
        <div class='text'>{{item.change_log}}</div>
      </div>
      <div v-if='updateList.length<=0'>无</div>
    </el-dialog>
    <el-dialog title='审核记录' :visible.sync='showCheckDialog' class='data-dialog' width='400'>
      <div v-for='(item,index) in checkList' :key='index' style="margin-top:10px">
        <div class='time'>{{item.created_at}}</div>
        <div class='text'>{{item.status == -4?"管理员下架":item.status == -3?"用户主动下架":item.status == -2?"用户取消审核":item.status == -1?"驳回":item.status == 0?"审核中":"已上架"}}</div>
      </div>
      <div v-if='checkList.length<=0'>无</div>
    </el-dialog>
  </div>  
</template>

<script>
export default {
  data(){
    return{
      keyword: '',
      dataRange: '',
      typeInp: '',
      statusInp: '',
      checkStatusInp: '',
      maxHeight: 0,
      paginate: '',
      dataList: [],
      statusList: [{
        label: '请选择',
        value: ''
      }],
      statusList2: [{
        label: '请选择',
        value: ''
      },{
        label: '活跃',
        value: 1
      },{
        label: '离线',
        value: 2
      },{
        label: '繁忙',
        value: 3
      }],
      statusList3: [{
        label: '已上架',
        value: 1
      },{
        label: '审核中',
        value: 0
      },{
        label: '已下架',
        value: -1
      }],
      tableLoading: false,
      showUpdateDialog:false,
      showCheckDialog: false,
      updateList: [],
      checkList: []
    }
  },
  created(){
    this.maxHeight = window.innerHeight - 210
    this.handleGetCateGoryList()
    this.handleGetList()
  },
  methods: {
    handleGetCateGoryList: function(){
      this.$utils.axiosRequest('GET', `/topic/all-category`, '', '', res=>{
        console.log(res)
        for(let item of res.data.list){
          this.statusList.push({
            label: item.name,
            value: item.id
          })
        }
      },res=>{
      })
    },
    handleShowUpdate: function(scope){
      let data = {
        id: scope.row.bot_id
      }
      this.$utils.axiosRequest('GET', `/robot/update/list`, data, '', res=>{
        this.showUpdateDialog = true
        this.updateList = res.data.list
      },res=>{

      })
    },
    handleShowCheckData: function(scope){
      let data = {
        id: scope.row.bot_id
      }
      this.$utils.axiosRequest('GET', `/robot/review/history`, data, '', res=>{
        this.showCheckDialog = true
        this.checkList = res.data.list
      },res=>{

      })
    },
    handleRefust: function(scope){
      this.$confirm('是否执行该操作', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          id: scope.row.id,
          status: -1
        }
        this.$utils.axiosRequest('POST', `/robot/review/handle`, '', data, res=>{
           this.bindPageChange(this.currentPage)
        },res=>{

        })
      }).catch(()=>{

      })  
    },
    handleEditSummary: function(scope){
      this.$prompt('请输入上架推荐语','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: scope.row.summary
      }).then(({value})=>{
        if(value==""){
          this.$message.error('推荐语不能为空');
        }else{
          let data = {
            id: scope.row.bot_id,
            summary: value
          }
          this.$utils.axiosRequest('POST', `/robot/store`, '', data, res=>{
            this.bindPageChange(this.currentPage)
          },res=>{
  
          })
        }
      }).catch(()=>{})
    },
    handleOutPut: function(scope){
      this.$prompt('是否执行该操作', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        let data = {
          id: scope.row.id,
          status: -1,
          reason: value?value: ''
        }
        this.$utils.axiosRequest('POST', `/robot/review/handle`, '', data, res=>{
          this.bindPageChange(this.currentPage)
        },res=>{

        })
      }).catch(() => {
  
      })
    },
    handleOnPut: function(scope){
      this.$prompt('请输入上架推荐语','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: scope.row.summary
      }).then(({value})=>{
        let data = {
          reason: '',
          summary: value,
          id: scope.row.id,
          status: 1
        }
        this.$utils.axiosRequest('POST', `/robot/review/handle`, '', data, res=>{
          this.bindPageChange(this.currentPage)
        },res=>{

        })
      }).catch(()=>{})
    },
    handleRefuse: function(scope){
      this.$prompt('是否执行该操作', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(({ value }) => {
          let data = {
            id: scope.row.id,
            status: -1,
            reason: value?value: ''
          }
          this.$utils.axiosRequest('POST', `/robot/review/handle`, '', data, res=>{
            this.bindPageChange(this.currentPage)
          },res=>{

          })
      }).catch()
    },
    handleSearch: function(){
      let data = {
        keyword: this.keyword,
        start_time: this.dataRange != null ? this.dataRange[0] : '',
        end_time: this.dataRange != null ? this.dataRange[1] : '',
        category: this.typeInp,
        status: this.statusInp,
        type: this.checkStatusInp
      }
      this.handleGetList(data)
    },
    bindPageChange: function(val){
      this.currentPage = val
      let data = {
        keyword: this.keyword,
        start_time: this.dataRange != null ? this.dataRange[0] : '',
        end_time: this.dataRange != null ? this.dataRange[1] : '',
        category: this.typeInp,
        status: this.statusInp,
        type: this.checkStatusInp,
        page:val
      }
      this.handleGetList(data)
    },
    handleClear: function(){
      this.keyword = ''
      this.dataRange = ''
      this.typeInp = ''
      this.statusInp = ''
      this.checkStatusInp = ''
      this.handleGetList()
    },
    handleGetList: function(data){
      this.tableLoading = true
      this.$utils.axiosRequest('GET', `/robot/review/list`, data, '', res=>{
        this.dataList = res.data.list
        this.paginate = res.data.paginate
        this.tableLoading = false
      },res=>{
        this.tableLoading = false
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
</style>