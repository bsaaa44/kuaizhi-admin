<template>
  <div>
    <div class="tools-bar">
      <el-input
        size="mini"
        class="search-inp"
        v-model="keyword"
        placeholder="输入机器人ID/机器人名称/开发者昵称/开发者ID/功能关键词"
        @change="handleSearch"
      />
      <el-button type="primary" size="mini" @click="handleSearch">搜索</el-button>
      <el-button type="primary" class="btn" size="mini" @click="handleClear">重置</el-button>
      <el-date-picker
        class="date-picker"
        value-format="yyyy-MM-dd"
        v-model="dataRange"
        type="daterange"
        @change="handleSearch"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        size="mini"
      ></el-date-picker>
    </div>
    <div class="tools-bar">
      <el-select
        class="status-selector"
        v-model="typeInp"
        placeholder="类别"
        @change="handleSearch"
        size="mini"
      >
        <el-option
          v-for="(item,index) in statusList"
          :key="index"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-select
        class="status-selector"
        v-model="statusInp"
        placeholder="运行状态"
        @change="handleSearch"
        size="mini"
      >
        <el-option
          v-for="(item,index) in statusList2"
          :key="index"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-select
        class="status-selector"
        v-model="checkStatusInp"
        placeholder="审核状态"
        @change="handleSearch"
        size="mini"
      >
        <el-option
          v-for="(item,index) in statusList3"
          :key="index"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </div>
    <div class="table-block">
      <el-table :data="dataList" v-loading="tableLoading" :height="maxHeight">
        <el-table-column prop="id" label="机器人ID" width="100"></el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="100"></el-table-column>
        <el-table-column prop="user_id" label="头像" width="100">
          <template slot-scope="scope">
            <img :src="scope.row.icon" class="table-img" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" width="100"></el-table-column>
        <el-table-column prop="user_id" label="开发者ID" width="100"></el-table-column>
        <el-table-column prop="money" label="开发者头像" width="100">
          <template slot-scope="scope">
            <img :src="scope.row.avatar" class="table-img" />
          </template>
        </el-table-column>
        <el-table-column prop="username" label="开发者昵称" width="100"></el-table-column>
        <el-table-column prop="description" label="功能介绍">
          <template slot-scope="scope">
            <el-popover
              placement="top-start"
              width="200"
              trigger="hover"
              :content="scope.row.description"
            >
              <div slot="reference" class="omit-3">{{scope.row.description}}</div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="类别" width="100"></el-table-column>
        <el-table-column label="机器人配置" width="100">
          <template slot-scope="scope">
            <el-button type="text" @click="handleShowConfig(scope)">查看配置</el-button>
          </template>
        </el-table-column>
        <el-table-column label="搜索关键词" width="100">
          <template slot-scope="scope">
            <el-button type="text" @click="handleShowKeyword(scope)">查看配置</el-button>
          </template>
        </el-table-column>
        <el-table-column label="评论列表" width="100">
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="currentScope =scope;currentPage2 = 1;showCommentPop = true;handleGetCommentList(scope)"
            >{{scope.row.comments_count}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="serve_topics_count" label="服务主题" width="100">
          <template slot-scope="scope">
            <el-button
              type="text"
              style="width: 100%"
              @click="currentPage2 = 1;currentScope=scope;handleSearchTopic()"
            >{{scope.row.serve_topics_count}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="serve_users_count" label="使用人数" width="100"></el-table-column>
        <el-table-column prop="is_hot" label="热门" width="100">
          <template slot-scope="scope">{{scope.row.is_hot == 1?"热门":"非热门"}}</template>
        </el-table-column>
        <el-table-column prop="is_hot" label="Pro" width="100">
          <template slot-scope="scope">{{scope.row.is_hot == 1?"Pro":"非Pro"}}</template>
        </el-table-column>
        <el-table-column prop="status" label="运行状态" width="100">
          <template
            slot-scope="scope"
          >{{scope.row.type == 4?"已删除":scope.row.status == 1?"活跃":scope.row.status == 2?"离线":scope.row.status == 4?"暂停":"繁忙"}}</template>
        </el-table-column>
        <el-table-column label="审核状态" prop="type" width="100">
          <template slot-scope="scope">
            <el-button v-if="scope.row.type==3" type="text" @click="showEditPop(scope)">已上架</el-button>
            <div v-if="scope.row.type==1">已下架</div>
            <div v-if="scope.row.type==2">审核中</div>
          </template>
        </el-table-column>
        <el-table-column label="更新记录" width="100">
          <template slot-scope="scope">
            <el-button type="text" @click="showUpdateDialig(scope)">点击查看</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" @click="showEditPop(scope)">修改</el-button>
            <el-button v-if="scope.row.type!=1" type="text" @click="editGoods(scope,1)">下架</el-button>
            <el-button v-if="scope.row.type!=3" type="text" @click="editGoods(scope,3)">上架</el-button>
            <el-button v-if="scope.row.status!=4" type="text" @click="handlePause(scope)">暂停</el-button>
            <el-button v-if="scope.row.status==4" type="text" @click="handleStart(scope)">启动</el-button>
            <el-button type="text" v-if="scope.row.type!=4" @click="handleDelete(scope)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination">
      <el-pagination
        v-if="dataList.length!=0"
        :total="paginate.total"
        :page-size="20"
        layout="total,prev,pager,next,jumper"
        @current-change="bindPageChange"
      ></el-pagination>
    </div>
    <el-dialog title="修改" :visible.sync="showEditDialog" class="edit-dialog" width="500">
      <div class="inp-block">
        <!-- <label for='nameInp'>机器人名称</label>
        <el-input id='nameInp' placeholder="请输入机器人名称" v-model='nameInp' class='inp'/><br/>
        <label for='userInp'>开发者昵称</label>
        <el-input id='userInp' placeholder="请输入开发者名称" v-model='userInp' class='inp'/><br/>
        <label for='descInp'>介绍</label>
        <el-input id='descInp' placeholder="请输入介绍文字" v-model='descInp' class='inp'/><br/>
        <label for='categoryInp'>选择类别</label>
        <el-select class='selector' v-model='categoryInp' placeholder='类别'>
          <el-option v-for='(item,index) in statusList' :key='index' :label='item.label' :value='item.value'></el-option>
        </el-select>-->
        <div class="content-block">
          <el-upload
            v-loading="upLoading"
            :show-file-list="false"
            class="uploader"
            :action="$global.hostUrl+'/upload'"
            :on-success="handleUploadSuccess"
          >
            <img v-if="uploadCover.length>0" :src="uploadCover" class="img-cover" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </div>
        <table border="0">
          <tr>
            <td>
              <label for="nameInp">机器人名称</label>
            </td>
            <td>
              <el-input id="nameInp" placeholder="请输入机器人名称" v-model="nameInp" class="inp" />
            </td>
          </tr>
          <tr>
            <td>
              <label for="userInp">开发者ID</label>
            </td>
            <td>
              <el-input id="userInp" placeholder="请输入开发者名称" v-model="userInp" class="inp" />
            </td>
          </tr>
          <!-- <tr>
            <td><label for='descInp'>介绍</label></td>
            <td>
              <vue-editor v-model='descInp' id='editor' useCustomImageHandler @imageAdded="handleImageAdded"></vue-editor>
            </td>
          </tr>-->
          <tr>
            <td>
              <label for="summaryInp">推荐语</label>
            </td>
            <td>
              <el-input
                id="summaryInp"
                placeholder="请输入推荐文字"
                type="textarea"
                :rows="4"
                v-model="summaryInp"
                class="inp"
              />
            </td>
          </tr>
          <tr>
            <td>
              <label for="categoryInp">选择类别</label>
            </td>
            <td>
              <el-select class="selector inp" v-model="categoryInp" placeholder="类别">
                <el-option
                  v-for="(item,index) in statusList"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </td>
          </tr>
          <tr>
            <td>
              <label for="roleInp">生成规则</label>
            </td>
            <td>
              <el-input v-model="roleInp" class="inp" placeholder="请输入生成规则" />
            </td>
          </tr>
          <tr>
            <td>
              <label for="roleInp">是否热门</label>
            </td>
            <td>
              <el-switch v-model="hotInp" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
            </td>
          </tr>
        </table>
      </div>
      <p style="font-weight: bold;margin-bottom:10px;font-size:16px">介绍</p>
      <div class="flex-row-center" style="margin-bottom:100px">
        <vue-editor
          v-model="descInp"
          id="editor"
          useCustomImageHandler
          @imageAdded="handleImageAdded"
          v-loading="loading3"
          style="width:700px"
        ></vue-editor>
      </div>
      <div class="btn-block">
        <el-button type="primary" @click="handleEdit()">确定</el-button>
        <el-button @click="handleCloseEdit()">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="服务主题" :visible.sync="showTopicDialog" class="topic-dialog" width="500">
      <el-table :data="topicList" v-loading="tableLoading2">
        <el-table-column label="主题ID">
          <template slot-scope="scope">
            <el-button type="text" @click="handleOpenWeb(scope)">{{scope.row.id}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="主题名称"></el-table-column>
        <el-table-column prop="follow_users_count" label="使用人数"></el-table-column>
        <el-table-column prop="cards_count" label="动态总数"></el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-if="topicList.length!=0"
          :total="paginate2.total"
          :page-size="20"
          layout="total,prev,pager,next,jumper"
          @current-change="bindPageChange2"
        ></el-pagination>
      </div>
    </el-dialog>
    <el-dialog title="更新记录" :visible.sync="showUpdate" class="topic-dialog" width="500">
      <div class="btn-block">
        <el-button size="mini" @click="handleShowAdd()">新增</el-button>
        <!-- <el-button size='mini' @click='handleShowEdit()'>修改</el-button> -->
      </div>
      <div v-for="(item,index) in updateList" :key="index">
        <div class="time" style="margin-top:20px">{{item.created_at}}</div>
        <div class="update" style="margin-top:10px">{{item.version}}</div>
        <div class="text" style="margin-top:10px">{{item.change_log}}</div>
        <el-button
          @click="handleShowEdit(item.id,item.change_log,item.version)"
          size="mini"
          type="primary"
          style="margin-top:10px"
        >修改</el-button>
      </div>
    </el-dialog>
    <el-dialog class="topic-dialog" title="新增/修改记录" width="500" :visible.sync="showUpdateEdit">
      <div
        class="inp-block"
        style="display:flex;flex-flow:row;justify-content: center;margin-bottom:20px"
      >
        <table border="0">
          <tr>
            <td>版本号</td>
            <td>
              <el-input v-model="versionInp" class="inp" />
            </td>
          </tr>
          <tr>
            <td>内容</td>
            <td>
              <el-input v-model="updateTextInp" type="textarea" class="inp" :row="3" />
            </td>
          </tr>
        </table>
      </div>
      <div class="btn-block">
        <el-button size="mini" @click="updateSave()" type="primary">确定</el-button>
        <el-button size="mini" @click="updateCancel()">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="搜索关键词配置"
      :visible.sync="showKeywordPop"
      v-if="currentScope != ''"
      class="config-dialog"
      width="500"
    >
      <el-input type="textarea" v-model="searchKeywordInp" />
      <div class="btn-block" style="margin-top: 20px">
        <el-button size="mini" @click="handleKeywordSave()" type="primary">确定</el-button>
        <el-button size="mini" @click="handleKeywordCancel()">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="查看配置"
      :visible.sync="showCommentPop"
      v-if="currentScope != ''"
      class="config-dialog comment-dialog"
      width="500"
    >
      <div class="commentBlock" v-for="(item,index) in commentList" :key="index">
        <div>
          <span>id:{{item.user.id}}</span>
          <img class="avatar" :src="item.user.avatar" />
          <span class="name">{{item.user.name}}</span>
          <template v-if="item.replyer">
            <span>回复</span>
            <span>id:{{item.replyer.id}}</span>
            <img class="avatar" :src="item.replyer.avatar" />
            <span class="name">{{item.replyer.name}}</span>
          </template>
          <span class="content">:{{item.content}}</span>
          <img v-if="item.image!=''" :src="item.image" style="width:100%" />
        </div>
        <el-button size="mini" style="margin-left:20px" @click="showReplyBlock(item.id)">回复</el-button>
      </div>
      <div class="pagination">
        <el-pagination
          v-if="commentList.length!=0"
          :total="paginate2.total"
          :page-size="20"
          layout="total,prev,pager,next,jumper"
          @current-change="bindPageChange3"
        ></el-pagination>
      </div>
    </el-dialog>
    <el-dialog
      title="查看配置"
      :visible.sync="showConfigDialog"
      v-if="currentScope != ''"
      class="config-dialog"
      width="500"
    >
      <!-- <el-button type='primary' size='mini'>新增</el-button> -->
      <p v-if="currentScope.row.params.length==0">无参数</p>
      <template v-if="currentScope.row.params.length>0">
        <div class="config-block" v-for="(item,index) in currentScope.row.params" :key="index">
          <h2 class="title">参数{{index+1}}--{{item.type}}</h2>
          <table>
            <tr>
              <td>键名</td>
              <td>
                <el-input class="inp" v-model="item.name" />
              </td>
            </tr>
            <tr v-if="item.placeholder">
              <td>提示</td>
              <td>
                <el-input class="inp" v-model="item.placeholder" />
              </td>
            </tr>
            <tr v-if="item.type=='list'||item.type=='checkbox'">
              <td>选项</td>
              <td>
                <el-input type="textarea" class="inp" :rows="5" v-model="item.values" />
              </td>
            </tr>
          </table>
        </div>
      </template>
      <div class="btn-block" v-if="currentScope.row.params.length>0">
        <el-button size="mini" @click="handleConfigSave()" type="primary">确定</el-button>
        <el-button size="mini" @click="handleConfigCancel()">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="回复" :visible.sync="showReplyPop" class="config-dialog" width="500">
      <div style="text-align:left;margin-bottom:10px">
        <span>使用id</span>
        <el-input v-model="idInp" size="mini" style="width:50px;margin:0 10px;" />
        <span>回复</span>
      </div>
      <el-input type="textarea" v-model="replyInp" style="margin-bottom:10px" />
      <el-button size="mini" type="primary" @click="handleFakeReply()">确认</el-button>
    </el-dialog>
  </div>
</template>

<script>
import { VueEditor } from "vue2-editor";
import { constants } from "crypto";

export default {
  data() {
    return {
      keyword: "",
      dataRange: "",
      statusList: [
        {
          label: "请选择",
          value: ""
        }
      ],
      statusList2: [
        {
          label: "请选择",
          value: ""
        },
        {
          label: "活跃",
          value: 1
        },
        {
          label: "离线",
          value: 2
        },
        {
          label: "繁忙",
          value: 3
        }
      ],
      statusList3: [
        {
          label: "请选择",
          value: ""
        },
        {
          label: "已上架",
          value: 3
        },
        {
          label: "已下架",
          value: 1
        },
        {
          label: "审核中",
          value: 2
        }
      ],
      typeInp: "",
      idInp: "",
      replyInp: "",
      statusInp: "",
      hotInp: false,
      checkStatusInp: "",
      tableLoading: false,
      tableLoading2: false,
      dataList: [],
      topicList: [],
      updateList: [],
      paginate: "",
      paginate2: "",
      maxHeight: 0,
      currentPage: 1,
      currentPage2: 1,
      currentScope: "",
      commentList: [],
      showEditDialog: false,
      showTopicDialog: false,
      showConfigDialog: false,
      showCommentPop: false,
      showUpdateEdit: false,
      currentScope2: "",
      showUpdate: false,
      roleInp: "",
      nameInp: "",
      userInp: "",
      descInp: "",
      summaryInp: "",
      categoryInp: "",
      versionInp: "",
      searchKeywordInp: "",
      updateTextInp: "",
      upLoading: false,
      loading3: false,
      uploadCover: "",
      paramsList: [],
      showKeywordPop: false,
      currentReplyId: 0,
      showReplyPop: false
      // tagInputValue: '',
      // inputVisible: false
    };
  },
  components: {
    VueEditor
  },
  created() {
    this.maxHeight = window.innerHeight - 210;
    console.log(this.maxHeight);
    this.handleGetCateGoryList();
    this.handleGetList();
  },
  methods: {
    handleDelete: function(scope) {
      this.$confirm("是否执行该操作", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let data = {
            id: scope.row.id,
            owner_id: scope.row.user_id
          };
          this.$utils.axiosRequest(
            "POST",
            `/robot/delete`,
            "",
            data,
            res => {
              this.bindPageChange(this.currentPage);
            },
            res => {}
          );
        })
        .catch();
    },
    handleStart: function(scope) {
      this.$confirm("是否执行该操作", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let data = {
            bot_id: scope.row.id,
            status: 1
          };
          this.$utils.axiosRequest(
            "POST",
            `/be-monitored-bots/suspend`,
            "",
            data,
            res => {
              this.bindPageChange(this.currentPage);
            },
            res => {}
          );
        })
        .catch(() => {});
    },
    handlePause: function(scope) {
      this.$confirm("是否执行该操作", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let data = {
            bot_id: scope.row.id,
            status: 0
          };
          this.$utils.axiosRequest(
            "POST",
            `/be-monitored-bots/suspend`,
            "",
            data,
            res => {
              this.bindPageChange(this.currentPage);
            },
            res => {}
          );
        })
        .catch(() => {});
    },
    handleOpenWeb: function(scope) {
      window.open(
        "https://kzfeed.com/home/themeDetail?id=" + scope.row.hash_id
      );
    },
    handleFakeReply: function() {
      let data = {
        comment_id: this.currentReplyId,
        content: this.replyInp,
        userid: this.idInp,
        image: ""
      };
      this.$utils.axiosRequest(
        "POST",
        `/robot/comment/reply`,
        "",
        data,
        res => {
          this.showReplyPop = false;
          this.handleGetCommentList(this.currentScope);
        },
        res => {}
      );
    },
    showReplyBlock: function(id) {
      this.currentReplyId = id;
      this.showReplyPop = true;
    },
    handleGetCommentList: function(scope) {
      let data = {
        id: scope.row.id,
        page: this.currentPage2
      };
      this.$utils.axiosRequest(
        "GET",
        `/robot/comment-list`,
        data,
        "",
        res => {
          this.commentList = res.data.list;
          this.paginate2 = res.data.paginate;
        },
        res => {}
      );
    },
    handleKeywordCancel: function() {
      this.currentScope = "";
      this.showKeywordPop = false;
    },
    handleKeywordSave: function() {
      let data = {
        id: this.currentScope.row.id,
        extend_search_keywords: this.searchKeywordInp
      };
      this.$utils.axiosRequest(
        "POST",
        `/robot/extend-search-keywords`,
        "",
        data,
        res => {
          this.showKeywordPop = false;
          this.bindPageChange(this.currentPage);
          this.currentScope = "";
        },
        res => {}
      );
    },
    handleShowKeyword: function(scope) {
      this.currentScope = scope;
      this.searchKeywordInp = scope.row.extend_search_keywords;
      this.showKeywordPop = true;
    },
    handleImageAdded: function(file, Editor, cursorLocation, resetUploader) {
      this.loading3 = true;
      var formData = new FormData();
      formData.append("file", file);
      formData.append("path", "gift/image");
      console.log("文件详情", file);
      console.log("选择了图片类型，开始执行上传");
      this.getImageUrl(formData, Editor, cursorLocation, resetUploader);
    },
    getImageUrl(data, Editor, cursorLocation, resetUploader) {
      let self = this;
      this.$utils.axiosRequest(
        "POST",
        `/upload`,
        "",
        data,
        res => {
          console.log("图片上传成功", res);
          let url = res.data.url;
          Editor.insertEmbed(cursorLocation, "image", url);
          resetUploader();
          self.loading3 = false;
        },
        function(err) {
          console.log("图片上传失败", err);
          self.$message.error("图片上传失败");
          self.loading3 = false;
        }
      );
    },
    handleConfigSave: function() {
      let value = this.currentScope.row.params;
      for (let i of value) {
        if (i.values && typeof value == "string") {
          i.values = i.values.split(",");
        }
      }
      console.log(value);
      let data = {
        id: this.currentScope.row.id,
        params: JSON.stringify(value)
      };
      this.$utils.axiosRequest(
        "POST",
        `/robot/params/update`,
        "",
        data,
        res => {
          this.showConfigDialog = false;
          this.currentScope = "";
        },
        res => {}
      );
    },
    handleConfigCancel: function() {
      this.currentScope = "";
      this.showConfigDialog = false;
    },
    handleShowConfig: function(scope) {
      for (let i of scope.row.params) {
        if (i.values && Array.isArray(i.values)) {
          i.values = i.values.join(",");
        }
      }
      this.currentScope = scope;
      this.showConfigDialog = true;
    },
    handleShowAdd: function() {
      this.currentScope2 = "";
      this.updateTextInp = "";
      this.versionInp = "";
      this.showUpdateEdit = true;
    },
    handleShowEdit: function(id, text, version) {
      this.currentScope2 = id;
      this.updateTextInp = text;
      this.versionInp = version;
      this.showUpdateEdit = true;
    },
    updateSave: function() {
      let data = {
        bot_id: this.currentScope.row.id,
        change_log: this.updateTextInp,
        id: this.currentScope2 == "" ? undefined : this.currentScope2,
        version: this.versionInp
      };
      this.$utils.axiosRequest(
        "POST",
        `/robot/update/store`,
        "",
        data,
        res => {
          this.showUpdateEdit = false;
          this.showUpdateDialig(this.currentScope);
        },
        res => {}
      );
    },
    updateCancel: function() {
      this.showUpdateEdit = false;
    },
    handleGetList: function(data) {
      this.tableLoading = true;
      this.$utils.axiosRequest(
        "GET",
        `/robot/list`,
        data,
        "",
        res => {
          console.log(res);
          this.tableLoading = false;
          this.dataList = res.data.list;
          this.paginate = res.data.paginate;
        },
        res => {
          this.tableLoading = false;
        }
      );
    },
    showUpdateDialig: function(scope) {
      this.currentScope = scope;
      let data = {
        id: scope.row.id
      };
      this.$utils.axiosRequest(
        "GET",
        `/robot/update/list`,
        data,
        "",
        res => {
          this.showUpdate = true;
          this.updateList = res.data.list;
        },
        res => {}
      );
    },
    editGoods: function(scope, type) {
      this.$prompt("是否执行此操作", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        beforeClose(action, instance, done) {
          if (action == "confirm") {
            instance.$refs["confirm"].$el.onclick = function(e) {
              e = e || window.event;
              if (e.detail != 0) {
                done();
              }
            };
          } else {
            done();
          }
        }
      })
        .then(({ value }) => {
          let data = {
            id: scope.row.id,
            type,
            reason: value ? value : ""
          };
          this.$utils.axiosRequest(
            "POST",
            `/robot/toggle-public`,
            "",
            data,
            res => {
              this.bindPageChange(this.currentPage);
            },
            res => {}
          );
        })
        .catch();
    },
    handleSearchTopic: function() {
      let data = {
        id: this.currentScope.row.id,
        page: this.currentPage2
      };
      this.$utils.axiosRequest(
        "GET",
        `/robot/serve-topics-list`,
        data,
        "",
        res => {
          this.topicList = res.data.list;
          this.paginate2 = res.data.paginate;
          this.showTopicDialog = true;
        },
        res => {}
      );
    },
    handleUploadSuccess: function(res, file) {
      this.uploadCover = file.response.url;
    },
    showEditPop: function(scope) {
      this.currentScope = scope;
      this.showEditDialog = true;
      this.nameInp = scope.row.name;
      this.roleInp = scope.row.suggest;
      this.userInp = scope.row.user_id;
      this.descInp = scope.row.description;
      this.uploadCover = scope.row.icon;
      for (let i = 0; i < this.statusList.length; i++) {
        if (scope.row.category == this.statusList[i].label) {
          this.categoryInp = this.statusList[i].value;
          break;
        }
      }
      this.summaryInp = scope.row.summary;
      this.hotInp = scope.row.is_hot == 0 ? false : true;
      for (let i = 0; i < this.statusList; i++) {
        if (this.statusList[i].label == scope.row.category) {
          this.categoryInp = this.statusList[i].value;
        }
      }
    },
    handleGetCateGoryList: function() {
      this.$utils.axiosRequest(
        "GET",
        `/robot/all-category`,
        "",
        "",
        res => {
          console.log(res);
          for (let item of res.data.list) {
            this.statusList.push({
              label: item.name,
              value: item.id
            });
          }
        },
        res => {}
      );
    },
    handleCloseEdit: function() {
      this.nameInp = "";
      this.userInp = "";
      this.descInp = "";
      this.categoryInp = "";
      this.uploadCover = "";
      this.summaryInp = "";
      this.showEditDialog = false;
    },
    handleEdit: function() {
      let rxp = /<p>(.*?[\n]*.*?)<\/p>/gi;
      let imgRxp = /<img src="(.+?)">/;
      let textArr = [];
      console.log(this.descInp);
      if (rxp.test(this.descInp)) {
        console.log("进来了");
        textArr = this.descInp.match(rxp);
      }
      let result = [];
      console.log("textArr", textArr);
      for (let i of textArr) {
        let type = "";
        let text = "";
        console.log("i", i);
        rxp.lastIndex = 0;
        imgRxp.lastIndex = 0;
        if (imgRxp.test(i)) {
          type = "image";
          text = imgRxp.exec(i)[1];
        } else {
          type = "text";
          text = rxp.exec(i)[1];
          if (text == "<br>") {
            text = "\n";
          } else {
            text = text + "\n";
          }
        }
        result.push({
          type,
          text
        });
      }
      let data = {
        category: this.categoryInp,
        description: this.descInp,
        id: this.currentScope.row.id,
        is_hot: this.hotInp ? 1 : 0,
        owner_id: this.userInp,
        suggest: this.roleInp,
        name: this.nameInp,
        summary: this.summaryInp,
        icon: this.uploadCover,
        description_formatted: JSON.stringify(result)
      };
      this.$utils.axiosRequest(
        "POST",
        `/robot/store`,
        "",
        data,
        res => {
          this.showEditDialog = false;
          this.bindPageChange(this.currentPage);
        },
        res => {}
      );
    },
    handleSearch: function() {
      let data = {
        keyword: this.keyword,
        start_time: this.dataRange != null ? this.dataRange[0] : "",
        end_time: this.dataRange != null ? this.dataRange[1] : "",
        category: this.typeInp,
        status: this.statusInp,
        type: this.checkStatusInp
      };
      this.handleGetList(data);
    },
    bindPageChange: function(val) {
      this.currentPage = val;
      let data = {
        keyword: this.keyword,
        start_time: this.dataRange != null ? this.dataRange[0] : "",
        end_time: this.dataRange != null ? this.dataRange[1] : "",
        category: this.typeInp,
        status: this.statusInp,
        type: this.checkStatusInp,
        page: val
      };
      this.handleGetList(data);
    },
    bindPageChange3: function(val) {
      this.currentPage2 = val;
      this.handleGetCommentList(this.currentScope);
    },
    bindPageChange2: function(val) {
      this.currentPage2 = val;
      this.handleSearchTopic();
    },
    handleClear: function() {
      this.keyword = "";
      this.dataRange = "";
      this.typeInp = "";
      this.statusInp = "";
      this.checkStatusInp = "";
      this.handleGetList();
    }
  }
};
</script>

<style lang="stylus" scoped>
.commentBlock {
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  text-align: left;

  span {
    vertical-align: middle;
  }

  .avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: inline-block;
    vertical-align: middle;
    margin: 0 5px 5px;
  }

  .name {
    font-weight: bold;
    margin: 0 5px;
  }
}

.omit-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  cursor: pointer;
  color: #409EFF;
}

.tools-bar {
  text-align: center;
  margin-bottom: 10px;
}

.tools-bar .search-inp {
  width: 20%;
  margin-right: 20px;
}

.tools-bar .btn {
  margin-right: 20px;
}

.tools-bar .date-picker {
  margin-right: 20px;
}

.tools-bar .status-selector {
  margin-right: 20px;
}

.table-img {
  width: 50px;
}

.edit-dialog {
  .inp-block {
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;

    td {
      padding: 10px;
    }

    label {
      // margin-right 20px
    }

    .inp {
      width: 300px;
    }
  }

  .btn-block {
    margin-top: 10px;
  }
}

.content-block {
  display: flex;
  flex-flow: row;
  align-items: center;
  margin-bottom: 20px;

  .label {
    flex-shrink: 0;
  }

  .inp {
    flex-grow: 1;
  }
}

.uploader {
  margin-right: 20px;
  margin-top: 10px;
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.img-cover {
  width: 100px;
  height: 100px;
  display: block;
}

.uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.upload-container {
  display: flex;
  flex-flow: row;
  align-items: center;

  .uploader {
    margin-right: 10px;
  }
}

.config-block {
  display: flex;
  flex-flow: column;
  align-items: center;
  margin-bottom: 10px;

  .inp {
    width: 300px;
  }

  h2 {
    margin-bottom: 4px;
  }

  table {
    td {
      padding: 5px;
    }
  }
}

.flex-row-center {
  display: flex;
  flex-flow: row;
  justify-content: center;
}
</style>
