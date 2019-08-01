<template>
  <div>
    <div class='tools-bar'>
      <el-input size='mini' class='search-inp' v-model='keyword' placeholder="输入用户昵称/用户ID/手机号搜索" @change='handleSearch'/>
      <el-button type='primary' size='mini' @click='handleSearch'>搜索</el-button>
      <el-button type='primary' class='btn' size='mini' @click='handleClear'>重置</el-button>
      <el-date-picker class='date-picker' value-format='yyyy-MM-dd' v-model="dataRange" type="daterange" @change='handleSearch' range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" size='mini'>
      </el-date-picker>
      <el-select class='status-selector' v-model='typeInp' placeholder='类别' @change='handleSearch' size='mini'>
        <el-option v-for='(item,index) in statusList' :key='index' :label='item.label' :value='item.value'></el-option>
      </el-select>
    </div>
    <div class='table-block'>
      <el-table :data='dataList' v-loading='tableLoading' :height='maxHeight'>
        <el-table-column prop='id' label='用户ID'></el-table-column>
        <el-table-column prop='name' label='用户昵称' ></el-table-column>
        <el-table-column label='用户头像'>
          <template slot-scope='scope'>
            <img class='table-img' :src='scope.row.avatar'/>
          </template>
        </el-table-column>
        <el-table-column prop='created_at' label='注册时间'></el-table-column>
        <el-table-column prop='last_login_at' label='最后登陆时间'></el-table-column>
        <el-table-column prop='phone' label='手机号'></el-table-column>
        <el-table-column label='是否开发者'>
          <template slot-scope='scope'>
            {{scope.row.developer?"是":"否"}}
          </template>
        </el-table-column>
        <el-table-column label='订阅主题'>
          <template slot-scope='scope'>
            <el-button type='text' @click='handleShowTopicList(scope,1)'>{{scope.row.topic_follow_count}}</el-button>
          </template>
        </el-table-column>
        <el-table-column label='创建主题'>
          <template slot-scope='scope'>
            <el-button type='text' @click='handleShowTopicList(scope,0)'>{{scope.row.create_topic_count}}</el-button>
          </template>
        </el-table-column>
        <el-table-column label='创建机器人'>
          <template slot-scope='scope'>
            <el-button type='text' @click='handleShowBotList(scope)'>{{scope.row.create_bot_count}}</el-button>
          </template>
        </el-table-column>
        <el-table-column label='发表评论'>
          <template slot-scope='scope'>
            <el-button type='text' @click='handleShowCommentList(scope)'>{{scope.row.create_comment_count}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class='pagination'>
        <el-pagination v-if="dataList.length!=0"  :total='paginate.total' :page-size=20 layout='total,prev,pager,next,jumper' @current-change='bindPageChange'></el-pagination>
      </div>
      <el-dialog title='主题配置' :visible.sync="showConfigDialog" class='edit-dialog' width='400'>
        <div class='item' v-for='(item,index) in configList' :key='index'>
          <div class='info-block'>
            <img :src='item.icon' class='icon'/>
            <span class='name'>{{item.name}}</span>
          </div>
          <div class='config-block' v-for='(param,idx) in item.params' :key='idx'>
            <div class='title' style="font-size:14px;margin: 5px 0;text-align:left">参数{{idx+1}}--{{param.type}}</div>
            <table border='0'>
              <tr>
                <td class='td-label'>字段名</td>
                <td style="text-align:left"><el-input class='inp' v-model='param.name' :disabled="true"/></td>
              </tr>
              <tr v-if='param.type=="input"'>
                <td class='td-label'>提示</td>
                <td style="text-align:left"><el-input class='inp' v-model='param.placeholder' :disabled="true"/></td>
              </tr>
              <tr>
                <td class='td-label'>选项</td>
                <td style="text-align:left">
                  <el-input class='inp' v-if='param.type == "input"' v-model='param.jobValue'/>
                  <el-input class='inp' v-if='param.type == "webhook"' :disabled='true' v-model='param.jobValue'/>
                  <!-- <el-input class='inp' v-if='param.type=="list"' type='textarea' :rows='5' v-model='param.values'/> -->
                  <el-radio-group v-if='param.type=="list"' v-model="param.jobValue">
                    <el-radio :label="value" v-for="value in param.values" :key='value' >{{value}}</el-radio>
                  </el-radio-group>
                  <el-checkbox-group v-model="param.jobValue" v-if='param.type=="checkbox"'>
                    <el-checkbox v-for="value in param.values" :label='value' :key='value'>{{value}}</el-checkbox>
                  </el-checkbox-group>
                </td>
              </tr>
            </table>
          </div>
        </div>
        <div class='filter-block' style="margin-top:20px">
          <div class='title' style="font-size:14px;margin: 5px 0">过滤器</div>
          <table border='0'>
            <template v-for="(item,idx) in filterList">
              <tr v-if='item.params.type == 1&&item.name=="keywords"' :key='idx'>
                <td class='td-label'>包含关键词</td>
                <td>
                  <el-tag
                    :key="tag"
                    v-for="(tag,index) in item.params.keywords"
                    closable
                    @close="handleClose1(idx,index)">
                    {{tag}}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="item.visible"
                    v-model="keywordInp1"
                    ref="saveTagInput"
                    size="small"
                    :autofocus="true"
                    @keyup.enter.native="handleInputConfirm1(idx)"
                    @blur="handleInputConfirm1(idx)"
                  >
                  </el-input>
                  <el-button v-if="!item.visible" class="button-new-tag" size="small" @click="handleShowInp(idx)">+ New Tag</el-button>
                </td>
              </tr>
              <tr v-if='item.params.type == 2&&item.name=="keywords"' :key='idx'>
                <td class='td-label'>排除关键词</td>
                <td>
                  <el-tag
                    :key="tag"
                    v-for="(tag,index) in item.params.keywords"
                    closable
                    @close="handleClose2(idx,index)">
                    {{tag}}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="item.visible"
                    v-model="keywordInp2"
                    ref="saveTagInput"
                    size="small"
                    :autofocus="true"
                    @keyup.enter.native="handleInputConfirm2(idx)"
                    @blur="handleInputConfirm2(idx)"
                  >
                  </el-input>
                  <el-button v-if="!item.visible" class="button-new-tag" size="small" @click="handleShowInp(idx)">+ New Tag</el-button>
                </td>
              </tr>
              <tr v-if='item.params.type == 1&&item.name=="preg"' :key='idx'>
                <td class='td-label'>正则表达式包含</td>
                <td><el-input v-model="item.params.pattern" class='inp'/></td>
              </tr>
              <tr v-if='item.params.type == 2&&item.name=="preg"' :key='idx'>
                <td class='td-label'>正则表达式排除</td>
                <td><el-input v-model="item.params.pattern" class='inp'/></td>
              </tr>
              <tr v-if='item.name=="forward"' :key='idx'>
                <td class='td-label'>结果转发</td>
                <td><el-input v-model="item.params.url" class='inp'/></td>
              </tr>
            </template>
          </table>
        </div>
        <div class='btn-block'>
          <el-button type='primary' @click='handleConfigSave()'>确定</el-button>
          <el-button @click='handleConfigClose()'>取消</el-button>
        </div>
      </el-dialog>
      <el-dialog title='主题列表' :visible.sync='showTopicPop' class='edit-dialog' width='1000px'>
        <el-table :data='topicList'>
          <el-table-column prop='id' label='主题ID'></el-table-column>
          <el-table-column prop='created_at' label='创建时间'></el-table-column>
          <el-table-column prop='name' label='主题名称'></el-table-column>
          <el-table-column label='主题头像'>
            <template slot-scope='scope'>
              <img class='table-img' :src='scope.row.icon'/>
            </template>
          </el-table-column>
          <el-table-column prop='description' label='主题介绍'></el-table-column>
          <el-table-column prop='category_name' label='所属类别'></el-table-column>
          <el-table-column label='主题配置'>
            <template slot-scope='scope'>
              <el-button type='text' @click='showConfig(scope)'>点击查看</el-button>
            </template>
          </el-table-column>
          <el-table-column label='状态'>
            <template slot-scope='scope'>
              {{scope.row.public == 2? "上架":scope.row.public == 1?"审核中":"私密"}}
            </template>
          </el-table-column>
          <el-table-column prop='follows_count' label='订阅人数'></el-table-column>
          <el-table-column prop='cards_count' label='动态总数'></el-table-column>
        </el-table>
        <div class='pagination'>
          <el-pagination v-if="topicList.length!=0"  :total='topicPaginate.total' :page-size=20 layout='total,prev,pager,next,jumper' @current-change='bindPageChange2'></el-pagination>
        </div>
      </el-dialog>
      <el-dialog title='机器人列表' :visible.sync='showBotPop' class='edit-dialog' width='1000px'>
        <el-table :data='dataList3'>
          <el-table-column prop='id' label='机器人ID'></el-table-column>
          <el-table-column prop='created_at' label='创建时间'></el-table-column>
          <el-table-column label='头像'>
            <template slot-scope='scope'>
              <img class='table-img' :src='scope.row.icon'/>
            </template>
          </el-table-column>
          <el-table-column prop='name' label='名称'></el-table-column>
          <el-table-column prop='description' label='功能介绍'></el-table-column>
          <el-table-column label='类别' prop='category_name'></el-table-column>
          <el-table-column label='服务主题'>
            <template slot-scope='scope'>
              <el-button type='text'>{{scope.row.serve_topics_count}}</el-button>
            </template>
          </el-table-column>
          <el-table-column label='使用人数'>
            <template slot-scope='scope'>
              <el-button type='text'>{{scope.row.serve_users_count}}</el-button>
            </template>
          </el-table-column>
          <el-table-column label='运行状态'>
            <template slot-scope='scope'>
              {{scope.row.status == 3?"繁忙":scope.row.status == 2?"离线":"活跃"}}
            </template>
          </el-table-column>
          <el-table-column prop='category_name' label='审核状态'>
            <template slot-scope='scope'>
              {{scope.row.type == 3?"上架":scope.row.type==2?"审核":"下架"}}
            </template>
          </el-table-column>
        </el-table>
        <div class='pagination'>
          <el-pagination v-if="dataList3.length!=0"  :total='paginate3.total' :page-size=20 layout='total,prev,pager,next,jumper' @current-change='bindPageChange3'></el-pagination>
        </div>
      </el-dialog>
      <el-dialog title='评论列表' :visible.sync='showCommentPop' class='edit-dialog' width='1000px'>
        <el-table :data='dataList4'>
          <el-table-column prop='id' label='评论ID'></el-table-column>
          <el-table-column prop='created_at' label='发表时间'></el-table-column>
          <el-table-column prop='content' label='评论内容'>
            <template slot-scope='scope'>
              <el-popover placement='top-start' width='200' trigger="hover" :content='scope.row.content'>
                <div slot='reference' class='omit-3'>{{scope.row.content}}</div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column prop='card_id' label='信息ID'></el-table-column>
          <el-table-column prop='card_text' label='信息简介'>
            <template slot-scope='scope'>
              <el-popover placement='top-start' width='200' trigger="hover" :content='scope.row.card_text'>
                <div slot='reference' class='omit-3'>{{scope.row.card_text}}</div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column prop='topic_id' label='主题ID'></el-table-column>
          <el-table-column prop='topic_name' label='主题名称'></el-table-column>
          <el-table-column label='操作'>
            <template slot-scope='scope'>
              <el-button type='text' v-if='scope.row.deleted_at==""' @click='handleDelete(scope.row.id)'>删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class='pagination'>
          <el-pagination v-if="dataList4.length!=0"  :total='paginate4.total' :page-size=20 layout='total,prev,pager,next,jumper' @current-change='bindPageChange4'></el-pagination>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return{
      keyword: '',
      dataRange:'',
      typeInp: '',
      statusList: [{
        label: '全部',
        value: ''
      },{
        label: '开发者',
        value: 1
      },{
        label: '非开发者',
        value: 0
      }],
      dataList: [],
      dataList3: [],
      dataList4: [],
      topicList: [],
      tableLoading: false,
      maxHeight: 0,
      currentScope: '',
      currentScope2: '',
      currentScope3: '',
      currentScope4: '',
      currentPage: 1,
      currentPage2: 1,
      currentPage3: 1,
      currentType: 0,
      showTopicPop: false,
      showBotPop: false,
      showCommentPop:false,
      showConfigDialog: false,
      configList: [],
      filterList: [],
      keywordList1: [],
      keywordList2: [],
      patternInp1: '',
      patternInp2: '',
      keywordInp1: '',
      keywordInp2: '',
      isDistinct: false,
      inputVisible1: false,
      inputVisible2: false,
      urlInp: '',
      paginate: '',
      paginate3: '',
      paginate4: '',
      topicPaginate: ''
    }
  },
  created(){
    this.maxHeight = window.innerHeight - 210
    console.log(this.maxHeight)
    this.handleGetList()
  },
  methods:{
     showConfig: function(scope){
      this.configList= []
      this.filterList= []
      this.keywordList1= []
      this.keywordList2= []
      this.patternInp1= ''
      this.patternInp2= ''
      this.keywordInp1= ''
      this.keywordInp2= ''
      this.isDistinct= false
      this.inputVisible1= false
      this.inputVisible2= false
      this.urlInp= ''
      this.currentScope2 = scope
      let data = {
        id: scope.row.id
      }
      this.$utils.axiosRequest('GET', `/topic/robots-and-filters`, data, '', res=>{
        for(let i of res.data.filters){
          if(i.name=="keywords"){
            i.visible = false
          }
        }
        this.configList = res.data.robots
        this.filterList = res.data.filters
        this.showConfigDialog = true
      },res=>{

      })
    },
    handleInputConfirm1:function(index){
      if(this.keywordInp1.trim()!=""){
        // this.keywordList1.push(this.keywordInp1)
        this.filterList[index].params.keywords.push(this.keywordInp1)
      }
      this.keywordInp1 = ''
      this.filterList[index].visible = false
    },
    handleInputConfirm2: function(index){
      if(this.keywordInp2.trim()!=""){
        this.filterList[index].params.keywords.push(this.keywordInp2)
      }
      this.keywordInp2 = ''
      this.filterList[index].visible = false
    },
    handleConfigClose: function(){
      this.showConfigDialog = false
    },
    handleConfigSave: function(){
      let bots = []
      for(let i of this.configList){
        let item = {
          id: i.id,
          params: {}
        }
        for(let j of i.params){
          item.params[j.key] = j.jobValue
          if(j.type == 'webhook'){
            item.webhooks = {
              [j.key]:j.jobValue
            }
          }
        }
        bots.push(item)
      }
      let filters = this.filterList
      for(let i of filters){
        if(typeof i.visible != 'undefined'){
          delete i.visible
        }
      }
      let data = {
        id: this.currentScope2.row.id,
        bots: JSON.stringify(bots),
        filters: JSON.stringify(filters)
      }
      this.$utils.axiosRequest('POST', `/topic/robots-and-filters/update`, '', data, res=>{
        this.showConfigDialog = false
      },res=>{
        this.showConfigDialog = false
      })
    },
    handleShowInp: function(index){
      this.filterList[index].visible = true
      this.$nextTick(()=>{
        console.log(this.$refs)
        console.log(this.$refs.saveTagInput)
        this.$refs.saveTagInput[0].$refs.input.focus()
      })
    },
    handleClose1: function(arrayIndex,paramIndex){
      this[`filterList`][arrayIndex].params.keywords.splice(paramIndex,1)
    },
    handleClose2: function(arrayIndex,paramIndex){
      this[`filterList`][arrayIndex].params.keywords.splice(paramIndex,1)
    },
    handleGetList: function(data){
      this.tableLoading = true
      this.$utils.axiosRequest('GET', `/user/list`, data, '', res=>{
        // console.log(res)
        this.tableLoading = false
        this.dataList = res.data.list
        this.paginate = res.data.paginate
      },res=>{
        this.tableLoading = false
      })
    },
    handleSearch: function(){
      let data = {
        keyword: this.keyword,
        start_time: this.dataRange != null ? this.dataRange[0] : '',
        end_time: this.dataRange != null ? this.dataRange[1] : '',
        developer: this.typeInp,
      }
      this.handleGetList(data)
    },
    handleClear: function(){
      this.keyword = ''
      this.dataRange = ''
      this.typeInp = ''
      this.handleGetList()
    },
    handleShowTopicList: function(scope,type){
      this.currentScope = scope
      this.currentType = type
      let data = {
        type,
        user_id: scope.row.id
      }
      this.handleGetTopicList(data)
      this.showTopicPop = true
    },
    handleGetTopicList: function(data){
      this.$utils.axiosRequest('GET', `/user/topic/list`, data, '', res=>{
        this.topicList = res.data.list
        this.topicPaginate = res.data.paginate
      },res=>{

      })
    },
    handleGetBotList: function(){
      let data = {
        page: this.currentPage3,
        user_id: this.currentScope.row.id
      }
      this.$utils.axiosRequest('GET', `/user/bot/list`, data, '', res=>{
        this.dataList3 = res.data.list
        this.paginate3 = res.data.paginate
      },res=>{

      })
    },
    handleGetCommentList: function(){
      let data = {
        page: this.currentPage4,
        user_id: this.currentScope.row.id
      }
      this.$utils.axiosRequest('GET', `/user/comment/list`, data, '', res=>{
        this.dataList4 = res.data.list
        this.paginate4 = res.data.paginate
      },res=>{

      })
    },
    bindPageChange: function(val){
      this.currentPage = val
      let data = {
        keyword: this.keyword,
        start_time: this.dataRange != null ? this.dataRange[0] : '',
        end_time: this.dataRange != null ? this.dataRange[1] : '',
        developer: this.typeInp,
        page: this.currentPage
      }
      this.handleGetList(data)
    },
    bindPageChange2: function(val){
      this.currentPage2 = val
      let data = {
        type: this.currentType,
        user_id: this.currentScope.row.id,
        page: this.currentPage2
      }
      this.handleGetTopicList(data)
    },
    bindPageChange3: function(val){
      this.currentPage3 = val
      this.handleGetBotList()
    },
    bindPageChange4: function(val){
      this.currentPage4 = val 
      this.handleGetCommentList()
    },
    handleShowBotList: function(scope){
      this.currentScope = scope
      this.showBotPop = true
      this.handleGetBotList()
    },
    handleShowCommentList: function(scope){
      this.currentScope = scope
      this.showCommentPop = true
      this.handleGetCommentList()
    },
    handleDelete: function(id){
      this.$confirm('是否执行该操作', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          id
        }
        this.$utils.axiosRequest('POST', `/user/comment/delete`, data, '', res=>{
          this.handleGetCommentList()
        },res=>{

        })
      }).catch(()=>{

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
  .flex-row-center{
    display: flex;
    flex-flow: row;
    justify-content:center;
  }
</style>
