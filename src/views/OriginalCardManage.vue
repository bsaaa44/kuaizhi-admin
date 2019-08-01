<template>
  <div>
    <div class="tools-bar">
      <el-input
        size="mini"
        class="search-inp"
        v-model="keyword"
        placeholder="输入内容ID/机器人ID/标题关键词/简介关键词"
        @change="handleSearch"
      />
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
      <el-select
        class="status-selector"
        v-model="statusInp"
        placeholder="状态"
        @change="handleSearch"
        size="mini"
      >
        <el-option label="已发布" value="1"></el-option>
        <el-option label="已删除" value="-1"></el-option>
      </el-select>
      <el-button type="primary" size="mini" @click="handleSearch">搜索</el-button>
      <el-button type="primary" class="btn" size="mini" @click="handleClear">重置</el-button>
      <el-button type="primary" size="mini" @click="handleCreate">新增内容</el-button>
    </div>
    <el-table :data="dataList" v-loading="tableLoading" :height="maxHeight">
      <el-table-column prop="id" label="内容ID" width="100"></el-table-column>
      <el-table-column prop="bot_id" label="所属机器人ID" width="100"></el-table-column>
      <el-table-column prop="bot_name" label="所属机器人"></el-table-column>
      <el-table-column prop="created_at" label="发布时间" width="100"></el-table-column>
      <el-table-column prop="title" label="标题"></el-table-column>
      <el-table-column prop="text" label="简介"></el-table-column>
      <el-table-column prop="url" label="网页链接"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope)">修改</el-button>
          <el-button type="text" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        v-if="dataList.length!=0"
        :total="paginate.total"
        :page-size="20"
        layout="total,prev,pager,next,jumper"
        @current-change="bindPageChange"
      ></el-pagination>
    </div>
    <el-dialog title="创建/修改内容" :visible.sync="showConfigDialog" class="edit-dialog" width="500">
      <el-form>
        <el-form-item label="选择机器人（必选）">
          <el-select v-model="robotInp" placeholder="请选择" @change="handleGetTopicList()">
            <el-option
              v-for="item in robotList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="推送时间（选填）">
          <el-date-picker
            v-model="pushTimeInp"
            type="datetime"
            placeholder="选择日期时间"
            align="right"
            value-format="yyyy-MM-dd HH:mm"
            @change="test"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="选择任务（必选）">
          <el-radio-group v-model="topicInp">
            <el-radio v-for="item in topicList" :key="item.id" :label="item.id">{{item.params}}</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- <el-form-item label="选择任务（必选）">
          <el-select v-model="topicInp" placeholder="请选择">
            <el-option
              v-for="item in topicList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>-->
        <el-form-item label="标题（选填）">
          <el-input v-model="titleInp" />
        </el-form-item>
        <el-form-item label="简介（必填）">
          <el-input v-model="descInp" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item label="推送内容（选填）">
          <el-input v-model="pushInp" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item label="上传图片（选填）">
          <el-upload
            :action="$global.hostUrl+'/upload'"
            :on-success="handleUploadSuccess"
            :on-remove="handleUploadRemove"
            :file-list="fileList"
            :limit="9"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
        <!-- <el-form-item label="上传视频（选填）">
          <el-upload
            :action="$global.hostUrl+'/upload'"
            :on-change="handleUploadSuccess2"
            :on-remove="handleUploadRemove2"
            :file-list="fileList2"
            :limit="1"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>-->
        <el-form-item label="视频链接（选填）">
          <el-input v-model="videoInp" placeholder="请输入视频链接" />
        </el-form-item>
        <el-form-item label="网页链接（选填）">
          <el-input v-model="urlInp" />
        </el-form-item>
        <el-form-item label="链接封面（选填）">
          <el-upload
            :action="$global.hostUrl+'/upload'"
            :on-success="handleUploadSuccess2"
            :on-remove="handleUploadRemove2"
            :file-list="fileList2"
            :limit="1"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="链接标题（选填）">
          <el-input v-model="urlTitleInp" />
        </el-form-item>
        <el-form-item label="链接描述（选填）">
          <el-input v-model="urlDescInp" />
        </el-form-item>
        <el-form-item label="guid（选填）">
          <el-input v-model="guidInp" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleConfigConfirm">确定</el-button>
          <el-button @click="handleConfigCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dataList: [],
      topicList: [],
      fileList: [],
      imagesInp: [],
      pushTimeInp: "",
      videoInp: "",
      pushInp: "",
      fileList2: [],
      robotList: [],
      tableLoading: false,
      showConfigDialog: false,
      robotInp: "",
      topicInp: "",
      guidInp: "",
      urlDescInp: "",
      urlTitleInp: "",
      keyword: "",
      dataRange: "",
      titleInp: "",
      statusInp: "",
      descInp: "",
      urlInp: "",
      maxHeight: 0,
      currentPage: 1,
      paginate: ""
    };
  },
  created() {
    this.maxHeight = window.innerHeight - 210;
    this.handleGetRobotList();
    this.handleGetList();
  },
  methods: {
    test: function(e){
      console.log(this.pushTimeInp)
    },
    handleGetTopicList: function() {
      return new Promise(resolve => {
        let data = {
          bot_id: this.robotInp
        };
        this.$utils.axiosRequest(
          "GET",
          `/robot/self-create/jobs`,
          data,
          "",
          res => {
            this.topicList = res.data.list;
            this.topicList.unshift({
              id: 0,
              params: "全部"
            });
            this.$nextTick(() => {
              resolve();
            });
          },
          res => {}
        );
      });
    },
    handleEdit: function(scope) {
      this.fileList = scope.row.images.map(function(item, index, self) {
        let obj = {};
        obj.name = index;
        obj.response = {};
        obj.response.url = item;
        return obj;
      });
      if (scope.row.url_info.cover) {
        this.fileList2 = [
          {
            name: 0,
            response: {
              url: scope.row.url_info.cover
            }
          }
        ];
      }
      if (scope.row.url_info.title) {
        this.urlTitleInp = scope.row.url_info.title;
      }
      if (scope.row.url_info.desc) {
        this.urlDescInp = scope.row.url_info.desc;
      }
      this.pushTimeInp = scope.row.send_time
      this.guidInp = scope.row.guid;
      this.pushInp = scope.row.push_text;
      this.robotInp = scope.row.bot_id;
      this.titleInp = scope.row.title;
      this.descInp = scope.row.text;
      this.videoInp = scope.row.video;
      this.urlInp = scope.row.url;
      this.currentScope = scope;
      this.$nextTick(() => {
        this.handleGetTopicList().then(() => {
          this.topicInp = scope.row.job_id;
        });
      });
      this.showConfigDialog = true;
    },
    handleDelete: function(scope) {
      this.$confirm("是否执行该操作", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let data = {
            id: scope.row.id
          };
          this.$utils.axiosRequest(
            "POST",
            `/card/self-create-content/delete`,
            "",
            data,
            res => {
              this.handleSearch();
            },
            res => {}
          );
        })
        .catch();
    },
    handleConfigCancel: function() {
      this.showConfigDialog = false;
    },
    handleConfigConfirm: function() {
      let images = [];
      console.log(this.fileList);
      for (let i of this.fileList) {
        images.push(i.response.url);
      }
      let url_info = {};
      if (this.fileList2[0]) {
        url_info.cover = this.fileList2[0].response.url;
      }
      if (this.urlDescInp != "") {
        url_info.desc = this.urlDescInp;
      }
      if (this.urlTitleInp != "") {
        url_info.title = this.urlTitleInp;
      }
      let data = {
        bot_id: this.robotInp,
        id: this.currentScope == "" ? undefined : this.currentScope.row.id,
        images: JSON.stringify(images),
        send_time: this.pushTimeInp,
        video: this.videoInp,
        text: this.descInp,
        push_text: this.pushInp,
        title: this.titleInp,
        url: this.urlInp,
        job_id: this.topicInp,
        url_info:
          Object.keys(url_info).length === 0
            ? undefined
            : JSON.stringify(url_info),
        guid: this.guidInp
      };
      this.$utils.axiosRequest(
        "POST",
        `/card/self-create-content/store`,
        "",
        data,
        res => {
          this.handleSearch();
          this.showConfigDialog = false;
        },
        res => {}
      );
    },
    handleUploadRemove: function(file, fileList) {
      this.fileList = fileList;
    },
    handleUploadRemove2: function(file, fileList) {
      this.fileList2 = fileList;
    },
    handleUploadSuccess: function(res, file, fileList) {
      this.fileList = fileList;
    },
    handleUploadSuccess2: function(res, file, fileList) {
      this.fileList2 = fileList;
    },
    handleGetRobotList: function() {
      this.$utils.axiosRequest(
        "GET",
        `/robot/self-create/all`,
        "",
        "",
        res => {
          this.robotList = res.data.list;
        },
        res => {}
      );
    },
    handleCreate: function() {
      this.currentScope = "";
      this.topicInp = "";
      this.fileList = [];
      this.fileList2 = [];
      this.urlDescInp = "";
      this.urlTitleInp = "";
      this.titleInp = "";
      this.pushTimeInp = ""
      this.descInp = "";
      this.pushInp = "";
      this.imagesInp = [];
      this.videoInp = "";
      this.urlInp = "";
      this.showConfigDialog = true;
    },
    handleSearch: function() {
      this.currentPage = 1;
      this.handleGetList();
    },
    handleClear: function() {
      this.keyword = "";
      this.dataRange = "";
      this.statusInp = "";
      this.handleGetList();
    },
    bindPageChange: function(val) {
      this.currentPage = val;
      this.handleGetList();
    },
    handleGetList: function() {
      let data = {
        keyword: this.keyword,
        status: this.statusInp,
        page: this.currentPage,
        start_time: this.dataRange != null ? this.dataRange[0] : "",
        end_time: this.dataRange != null ? this.dataRange[1] : ""
      };
      this.$utils.axiosRequest(
        "GET",
        `/card/self-create-content/list`,
        data,
        "",
        res => {
          this.dataList = res.data.list;
          this.paginate = res.data.paginate;
        },
        res => {}
      );
    }
  }
};
</script>

<style lang="stylus" scoped>
.edit-dialog .el-form-item {
  text-align: left;
  word-wrap: break-word;
  word-break: break-all;
}

.el-radio-group {
  width: 100%;
  overflow: scroll;
  word-wrap: break-word;
  word-break: break-all;
}

.el-radio .el-radio__label {
  width: 100%;
  word-wrap: break-word;
  word-break: break-all;
}

.el-radio-group .el-radio {
  width: 100%;
  word-wrap: break-word;
  word-break: break-all;
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
</style>


