<template>
  <div>
    <div class='tools-bar'>
      <el-input size='mini' class='search-inp' v-model='keyword' placeholder="输入主题ID/主题名称/创建者昵称/创建者ID/介绍关键词" @change='handleSearch'/>
      <el-button type='primary' size='mini' @click='handleSearch'>搜索</el-button>
      <el-button type='primary' class='btn' size='mini' @click='handleClear'>重置</el-button>
      <el-date-picker class='date-picker' value-format='yyyy-MM-dd' v-model="dataRange" type="daterange" @change='handleSearch' range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" size='mini'>
      </el-date-picker>
      <el-select class='status-selector' v-model='typeInp' placeholder='类别' @change='handleSearch' size='mini'>
        <el-option v-for='(item,index) in statusList' :key='index' :label='item.label' :value='item.value'></el-option>
      </el-select>
      <el-select class='status-selector' v-model='statusInp' placeholder='运行状态' @change='handleSearch' size='mini'>
        <el-option v-for='(item,index) in statusList2' :key='index' :label='item.label' :value='item.value'></el-option>
      </el-select>
    </div>
    <div class='table-block'>
      <el-table :data='dataList' v-loading='tableLoading' :height='maxHeight'>
        <el-table-column prop='id' label='主题ID' width='100'>
          <template slot-scope='scope'>
            <el-button type='text' @click='handleOpenWeb(scope)'>{{scope.row.id}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop='created_at' label='创建时间' width='100'></el-table-column>
        <!-- <el-table-column prop='created_at' label='最后运行时间' width='100'></el-table-column> -->
        <el-table-column prop='name' label='主题名称' width='100'></el-table-column>
        <el-table-column prop='id' label='主题头像' width='100'>
          <template slot-scope='scope'>
            <img :src='scope.row.icon' class='table-img'/>
          </template>
        </el-table-column>
        <el-table-column prop='user_id' label='创建人ID' width='100'></el-table-column>
        <el-table-column prop='avatar' label='创建人头像' width='100'>
          <template slot-scope='scope'>
            <img :src='scope.row.avatar' class='table-img'/>
          </template>
        </el-table-column>
        <el-table-column prop='user_name' label='创建人昵称' ></el-table-column>
        <el-table-column prop='description' label='主题介绍' ></el-table-column>
        <el-table-column prop='category_name' label='所属类别' width='100'></el-table-column>
        <el-table-column label='主题配置' width='100'>
          <template slot-scope='scope'>
            <el-button @click='showConfig(scope)' type='text'>点击查看</el-button>
          </template>
        </el-table-column>
        <el-table-column label='搜索关键词' width='100'>
          <template slot-scope='scope'>
            <el-button type='text' @click='showKeywordConfig(scope)'>点击查看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop='id' label='状态' width='100'>
          <template slot-scope='scope'>
            {{scope.row.public == 0?"私密":scope.row.public == 1?"审核中":"上架"}}
          </template>
        </el-table-column>
        <el-table-column label='审核记录'>
          <template slot-scope='scope'>
            <el-button type='text' @click='handleShowRecord(scope)'>点击查看</el-button>
          </template>
        </el-table-column>
        <el-table-column label='订阅人数' width='100'>
          <template slot-scope='scope'>
            <el-button type='text' @click='handleShowFlwList(scope)'>{{scope.row.follow_users_count}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop='cards_count' label='动态总数' width='100'></el-table-column>
        <el-table-column label='标签管理' width='100'>
          <template slot-scope="scope">
            <el-button type="text" @click="handleShowLabelList(scope)">点击查看</el-button>
          </template>
        </el-table-column>
        <el-table-column label='操作' width='100'>
          <template slot-scope='scope'>
            <el-button type='text' v-if='scope.row.public == 1||scope.row.public == 0' @click='handleOnPut(scope)'>上架</el-button>
            <el-button type='text' @click='handleDelete(scope)'>删除</el-button>
            <el-button type='text' v-if='scope.row.public == 2||scope.row.public == 1' @click='handleRefuse(scope)'>{{scope.row.public == 1?"拒绝":"下架"}}</el-button>
            <el-button type='text' @click='showEdit(scope)'>修改</el-button>
            <!-- <el-button type='text' @click='handleRefuse(scope)'>拒绝</el-button> -->
          </template>
        </el-table-column>
        <el-table-column label='推荐权重'>
          <template slot-scope='scope'>
            <el-button type='text' @click='handleEditPoint(scope)' style="width: 100%">{{scope.row.score}}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class='pagination'>
      <el-pagination v-if="dataList.length!=0"  :total='paginate.total' :page-size=20 layout='total,prev,pager,next,jumper' @current-change='bindPageChange'></el-pagination>
    </div>
    <!-- <el-dialog title='修改头像' :visible.sync='showEditDialog' class='edit-dialog' width='300'>
      <div class='inp-block'>
        
      </div>
      <div class='btn-block'>
        <el-button type='primary' @click='handleEdit()'>确定</el-button>
        <el-button @click='handleCloseEdit()'>取消</el-button>
      </div>
    </el-dialog> -->
    <!-- <el-dialog title='审核记录' :visible.sync="showRecordPop" class='edit-dialog' width='400'>

    </el-dialog> -->
    <el-dialog title='主题配置' :visible.sync="showConfigDialog" class='edit-dialog' width='400'>
      <div class='item' v-for='(item,index) in configList' :key='index'>
        <div class='info-block'>
          <img :src='item.icon' class='icon'/>
          <span class='name'>{{item.name}}</span>
        </div>
        <div style="text-align:center">
          <p>最后拉取时间:{{item.job.last_pull_time}}</p>
          <p>最后推送时间:{{item.job.last_push_time}}</p>
          <p>创建时间:{{item.job.created_at}}</p>
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
          <!-- <tr>
            <td class='td-label'>是否去重</td>
            <td>
              <el-switch
                v-model="isDistinct"
                active-color="#13ce66"
                inactive-color="#ff4949">
              </el-switch>
            </td>
          </tr> -->
        </table>
      </div>
      <div class='btn-block'>
        <el-button type='primary' @click='handleConfigSave()'>确定</el-button>
        <el-button @click='handleConfigClose()'>取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title='搜索关键词' :visible.sync='showKeywordDialog' class='edit-dialog' width='500'>
      <el-input type='textarea' v-model='searchKeywordInp'/>
      <div class='btn-block' style='margin-top:10px'>
        <el-button type='primary' @click='handleKeywordSave()'>确定</el-button>
        <el-button @click='handleKeywordClose()'>取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title='审核记录' :visible.sync='showRecordPop' class='edit-dialog' width='300'>
      <div class='content-block' v-for='(item,index) in recordList' :key='index'>
        <div class='time'>{{item.created_at}}</div>
        <div>{{"　"+item.reason}}</div>
      </div>
      <div v-if='recordList.length==0'>无记录</div>
    </el-dialog>
    <el-dialog title='订阅用户' :visible.sync='showFlwPop' class='edit-dialog' width= '1000px'>
      <el-table :data='flwList'>
        <el-table-column prop='id' label='用户ID'></el-table-column>
        <el-table-column prop='name' label='用户昵称'></el-table-column>
        <el-table-column label='用户头像'>
          <template slot-scope='scope'>
            <img :src='scope.row.avatar' class='table-img'/>
          </template>
        </el-table-column>
        <el-table-column prop='created_at' label='注册时间'></el-table-column>
        <el-table-column prop='phone' label='手机号'></el-table-column>
        <el-table-column prop='category_name' label='是否开发者'>
          <template slot-scope='scope'>
            {{scope.row.developer?"是":"否"}}
          </template>
        </el-table-column>
        <el-table-column prop='topic_follow_count' label='订阅主题'></el-table-column>
        <el-table-column prop='create_topic_count' label='创建主题'></el-table-column>
        <el-table-column prop='create_bot_count' label='创建机器人'></el-table-column>
        <el-table-column prop='create_comment_count' label='发表评论'></el-table-column>
      </el-table>
      <div class='pagination'>
        <el-pagination v-if="flwList.length!=0"  :total='paginate2.total' :page-size=20 layout='total,prev,pager,next,jumper' @current-change='bindPageChange2'></el-pagination>
      </div>
    </el-dialog>
    <el-dialog title='修改主题' :visible.sync='showEditDialog2' class='edit-dialog' width='300'>
      <div class='inp-block'>
        <div class='content-block'>
          <el-upload v-loading='upLoading' :show-file-list="false" class='uploader' :action='$global.hostUrl+"/upload"' :on-success='handleUploadSuccess'>
            <img v-if='uploadCover.length>0' :src='uploadCover' class='img-cover'>
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </div>
        <table border='0'>
          <tr>
            <td>主题名称</td>
            <td><el-input v-model='nameInp' class='inp' placeholder="请输入主题名称"/></td>
          </tr>
          <tr>
            <td>主题介绍</td>
            <td><el-input v-model='descInp' class='inp' type="textarea" :rows="3" placeholder="请输入主题介绍"/></td>
          </tr>
          <tr>
            <td>主题分类</td>
            <td>
              <el-select class='selector inp' v-model='categoryInp' placeholder='类别'>
                <el-option v-for='(item,index) in statusList' :key='index' :label='item.label' :value='item.value'></el-option>
              </el-select>
            </td>
          </tr>
        </table>
      </div>
      <div class='btn-block'>
        <el-button type='primary' @click='handleSave()'>确定</el-button>
        <el-button @click='handleClose()'>取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title='标签管理' :visible.sync='showLabelPop' class='label-dialog' width='300'>
      <div v-for="(item,index) in labelList" :key="index">
        <p class='cateTitle'>{{item.category_name}}
          <el-button size='mini' type="primary" @click="handleAddLabel(item.category_id)">添加</el-button>
        </p>
        <p>
          <el-checkbox v-for="(it,idx) in item.labels" @change="handleCheckBoxChange(index,idx)" :label="it.name" :value="it.checked === 0?false:true" :key="idx"></el-checkbox>
        </p>
      </div>
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
      statusList: [{
        label: '请选择',
        value: ''
      }],
      statusList2: [{
        label: '请选择',
        value: ''
      },{
        label: '私密',
        value: 0
      },{
        label: '审核',
        value: 1
      },{
        label: '上架',
        value: 2
      }],
      dataList: [],
      flwList: [],
      configList: [],
      filterList: [],
      keywordList1: [],
      keywordList2: [],
      recordList: [],
      labelList: [],
      patternInp1: '',
      patternInp2: '',
      keywordInp1: '',
      keywordInp2: '',
      isDistinct: false,
      inputVisible1: false,
      inputVisible2: false,
      showFlwPop: false,
      urlInp: '',
      tableLoading: false,
      maxHeight: 0,
      upLoading: false,
      uploadCover: '',
      currentScope: '',
      showEditDialog: false,
      showEditDialog2: false,
      showConfigDialog: false,
      showRecordPop: false,
      showLabelPop: false,
      currentPage: 1,
      paginate: '',
      paginate2: '',
      nameInp: '',
      descInp: '',
      categoryInp: '',
      searchKeywordInp: '',
      showKeywordDialog: false
    }
  },
  computed:{

  },
  created(){
    this.maxHeight = window.innerHeight - 210
    this.handleGetCateGoryList()
    this.handleGetList()
  },
  methods:{
    handleAddLabel: function(id){
      this.$prompt('请输入标签名', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        let data = {
          category_id: id,
          name: value
        }
        this.$utils.axiosRequest('POST', `/label/store`, "",data, res=>{
          this.handleShowLabelList(this.currentScope)
      },res=>{
        
      })
      }).catch()
    },
    handleCheckBoxChange: function(index,idx){
      let data = {
        topic_id: this.currentScope.row.id,
        label_id: this.labelList[index].labels[idx].id,
        checked: this.labelList[index].labels[idx].checked === 0?1:0
      }
      this.labelList[index].labels[idx].checked = (this.labelList[index].labels[idx].checked === 0?1:0)
      this.$utils.axiosRequest('POST', `/topic/set-label`, "",data, res=>{
      },res=>{

      })
      console.log("data",data)
    },
    handleShowLabelList: function(scope){
      this.showLabelPop = true
      this.currentScope = scope
      let data = {
        id: scope.row.id
      }
      this.$utils.axiosRequest('GET', `/topic/labels`, data,'', res=>{
        this.labelList = res.data.list
      },res=>{

      })
    },
    handleOpenWeb: function(scope){
      window.open("https://kzfeed.com/home/themeDetail?id="+scope.row.hash_id)
    },
    handleGetRecordList: function(){
      let data = {
        page: this.currentPage2,
        topic_id: this.currentScope.row.id
      }
      this.$utils.axiosRequest('GET', `/topic/review/list`, data, '', res=>{
        this.recordList = res.data.list
        this.$nextTick(()=>{
          this.showRecordPop = true
        })
      },res=>{

      })
    },
    handleShowFlwList: function(scope){
      this.currentScope = scope
      this.currentPage2 = 1
      this.showFlwPop = true
      this.handleGetFlwList()
    },
    bindPageChange2: function(val){
      this.currentPage2 = val
      this.handleGetFlwList()
    },
    handleGetFlwList: function(){
      let data = {
        page: this.currentPage2,
        topic_id: this.currentScope.row.id
      }
      this.$utils.axiosRequest('GET', `/topic/follow-users`, data,'', res=>{
        this.flwList = res.data.list
        this.paginate2 = res.data.paginate
      },res=>{

      })
    },
    handleShowRecord: function(scope){
      this.showRecordPop = true
      this.currentScope= scope
      this.handleGetRecordList()
    },
    handleRefuse: function(scope){
      this.currentScope = scope
      this.$prompt('请输入拒绝原因', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        let data = {
          id: scope.row.id,
          public: 0,
          reason: value?value: ''
        }
        this.$utils.axiosRequest('POST', `/topic/toggle-public`, '', data, res=>{
          this.bindPageChange(this.currentPage)
        },res=>{

        })
      }).catch(() => {
  
      })
    },
    handleKeywordClose: function(){
      this.currentScope =''
      this.searchKeywordInp = ''
      this.showKeywordDialog = false
    },
    handleKeywordSave: function(){
      let data = {
        id: this.currentScope.row.id,
        extend_search_keywords: this.searchKeywordInp
      }
      this.$utils.axiosRequest('POST', `/topic/extend-search-keywords`, '', data, res=>{
        this.bindPageChange(this.currentPage)
        this.currentScope = ''
        this.searchKeywordInp= ''
        this.showKeywordDialog = false
      },res=>{

      })
    },
    showKeywordConfig: function(scope){
      this.currentScope = scope
      this.searchKeywordInp = scope.row.extend_search_keywords
      this.showKeywordDialog = true
    },
    handleEditPoint: function(scope){
      this.$prompt('请输入推荐权重', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: scope.row.score
        }).then(({ value }) => {
          let data = {
            id: scope.row.id,
            score: value
          }
          this.$utils.axiosRequest('POST', `/topic/update`, '', data, res=>{
            this.bindPageChange(this.currentPage)
          },res=>{})
        }).catch()
    },
    handleShowInp: function(index){
      // console.log(key)
      this.filterList[index].visible = true

      this.$nextTick(()=>{
        console.log(this.$refs)
        console.log(this.$refs.saveTagInput)
        this.$refs.saveTagInput[0].$refs.input.focus()
        // this.$refs[0].focus()
      })
    },
    handleConfigSave: function(){
      let bots = []
      for(let i of this.configList){
        let item = {
          id: i.id,
          params: {}
        }
        for(let j of i.params){
          // if(j.values){
          //   j.values = j.values.split(',')
          // }
          item.params[j.key] = j.jobValue
          if(j.type == 'webhook'){
            item.webhooks = {
              [j.key]:j.jobValue
            }
          }
          // item.params.push(j)
        }
        bots.push(item)
      }
      let filters = this.filterList
      for(let i of filters){
        if(typeof i.visible != 'undefined'){
          delete i.visible
        }
      }
      // }
      let data = {
        id: this.currentScope.row.id,
        bots: JSON.stringify(bots),
        filters: JSON.stringify(filters)
      }
      // console.log(filters)
      this.$utils.axiosRequest('POST', `/topic/robots-and-filters/update`, '', data, res=>{
        this.showConfigDialog = false
      },res=>{
        this.showConfigDialog = false
      })
    },
    handleClose1: function(arrayIndex,paramIndex){
      // console.log(arrayIndex,'arrayIndex')
      // console.log('test',this[`filterList[1]`])
      // console.log('filterList',this[`filterList[${arrayIndex}]`])
      this[`filterList`][arrayIndex].params.keywords.splice(paramIndex,1)
      // this.keywordList1.splice(index,1)
    },
    handleClose2: function(arrayIndex,paramIndex){
      //  this[`filterList[${arrayIndex}].params.keywords`].splice(paramIndex,1)
      this[`filterList`][arrayIndex].params.keywords.splice(paramIndex,1)
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
      this.currentScope = scope
      let data = {
        id: scope.row.id
      }
      this.$utils.axiosRequest('GET', `/topic/robots-and-filters`, data, '', res=>{
        // for(let i of res.data.robots){
        //   for(let j of i.params){
        //     if(j.values){
        //       j.values = j.values.join(',')
        //     }
        //   }
        // }
        // for(let i of res.data.filters){
        //   if(i.name == 'keywords'){
        //     if(i.params.type == 1){
        //       this.keywordList1 = i.params.keywords
        //     }else{
        //       this.keywordList2 = i.params.keywords
        //     }
        //   }else if(i.name == 'preg'){
        //     if(i.params.type == 1){
        //       this.patternInp1 = i.params.pattern
        //     }else{
        //       this.patternInp2 = i.params.pattern
        //     }
        //   }else if(i.name == 'forward'){
        //     this.urlInp = i.params.url
        //   }else if(i.name == 'distinct'){
        //     this.isDistinct = true
        //   }
        // }
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
    handleSave: function(){
      let data = {
        icon: this.uploadCover,
        category_id: this.categoryInp,
        description: this.descInp,
        name: this.nameInp,
        id: this.currentScope.row.id
      }
      this.$utils.axiosRequest('POST', `/topic/update`, '', data, res=>{
        this.showEditDialog2 = false
        this.bindPageChange(this.currentPage)
      },res=>{

      })
    },
    handleClose: function(){
      this.currentScope = ''
      this.nameInp = ''
      this.descInp = ''
      this.categoryInp = ''
      this.showEditDialog2 = false
    },
    showEdit: function(scope){
      this.currentScope = scope
      this.uploadCover = scope.row.icon
      this.nameInp = scope.row.name
      this.descInp = scope.row.description
      for(let i = 0;i<this.statusList.length;i++){
        console.log(this.statusList[i].label)
        if(this.statusList[i].label == scope.row.category_name){
          this.categoryInp = this.statusList[i].value
        }
      }
      this.showEditDialog2 = true
    },
    handleEdit: function(){
      let data = {
        id: this.currentScope.row.id,
        icon: this.uploadCover
      }
      this.$utils.axiosRequest('POST', `/topic/update`, '', data, res=>{
        this.handleSearch()
        this.showEditDialog = false
      },res=>{

      })
    },
    handleCloseEdit: function(){
      this.currentScope = ''
      this.uploadCover = ''
      this.showEditDialog = false
    },
    handleUploadSuccess: function(res,file){
      this.uploadCover = file.response.url
    },  
    bindPageChange: function(val){
      this.currentPage = val
      let data= {
        keyword: this.keyword,
        page: this.currentPage,
        start_time: this.dataRange != null ? this.dataRange[0] : '',
        end_time: this.dataRange != null ? this.dataRange[1] : '',
        category: this.typeInp,
        public: this.statusInp,
      }
      this.handleGetList(data)
    },
    handleOnPut: function(scope){
      this.$confirm('是否上架该主题', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          id: scope.row.id,
          public: 2
        }
        this.$utils.axiosRequest('POST', `/topic/toggle-public`, '', data, res=>{
          this.bindPageChange(this.currentPage)
        },res=>{

        })
      }).catch(()=>{

      })  
    },
    handleOutPut: function(scope){
      this.$confirm('是否下架该主题', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          id: scope.row.id,
          public: 0
        }
        this.$utils.axiosRequest('POST', `/topic/toggle-public`, '', data, res=>{
          this.bindPageChange(this.currentPage)
        },res=>{

        })
      }).catch(()=>{

      })  
    },
    handleDelete: function(scope){
       this.$prompt('是否删除该主题', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        let data = {
          id: scope.row.id,
          reason: value?value: ''
        }
        this.$utils.axiosRequest('POST', `/topic/delete`, '', data, res=>{
          this.bindPageChange(this.currentPage)
        },res=>{

        })
      }).catch(() => {
  
      })
    },
    handleClear: function(){
      this.keyword = ''
      this.dataRange = ''
      this.typeInp = ''
      this.statusInp = ''
      this.currentPage = 1
      this.handleGetList()
    },
    handleSearch: function(){
      let data= {
        keyword: this.keyword,
        start_time: this.dataRange != null ? this.dataRange[0] : '',
        end_time: this.dataRange != null ? this.dataRange[1] : '',
        category: this.typeInp,
        public: this.statusInp,
      }
      this.handleGetList(data)
    },
    handleGetList: function(data){
      this.tableLoading = true
      this.$utils.axiosRequest('GET', `/topic/list`, data, '', res=>{
        console.log(res)
        this.tableLoading = false
        this.dataList = res.data.list
        this.paginate = res.data.paginate
      },res=>{
        this.tableLoading = false
      })
    },
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
    }
  }
}
</script>

<style lang="stylus" scoped>
  .label-dialog{
    text-align left
    .cateTitle{
      font-size 18px
      margin-bottom 5px
      margin-top 10px
      font-weight bold
    }
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
    .info-block 
      display flex;
      flex-flow row;
      align-items center
      margin-bottom: 10px 
      .icon
        width: 30px
        border-radius: 30px
        margin-right: 10px
      .name 
        font-size: 16px
        font-weight: bold
    .config-block 
      display flex;
      flex-flow column
      align-items center
      .inp
        width 350px
      td
        padding 5px
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

  .el-tag + .el-tag {
    margin-left: 10px;
    margin-bottom: 10px
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
  .filter-block {
    td {
      padding 5px
    }
  }
  .td-label {
    width 100px
  }

</style>
