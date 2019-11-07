<template>
  <div>
    <div class="tools-bar">
      <el-input
        size="mini"
        class="search-inp"
        v-model="keyword"
        placeholder="输入类别ID/类别名称"
        @change="handleSearch"
      />
      <el-select
        class="status-selector"
        v-model="accountInp"
        placeholder="设备"
        @change="handleSearch"
        size="mini"
        style="margin-right: 10px"
      >
        <el-option label="请选择" value></el-option>
        <el-option :label="item" :value="item" v-for="(item,index) in accountList" :key="index"></el-option>
      </el-select>
      <el-select
        class="status-selector"
        v-model="statusInp"
        placeholder="状态"
        @change="handleSearch"
        size="mini"
      >
        <el-option label="请选择" value></el-option>
        <el-option label="已关注" value="1"></el-option>
        <el-option label="未关注" value="0"></el-option>
        <el-option label="待清理" value="2"></el-option>
      </el-select>
    </div>
    <el-table :data="dataList" v-loading="tableLoading" :height="maxHeight">
      <el-table-column prop="id" label="id"></el-table-column>
      <el-table-column prop="gzh_name" label="公众号名称"></el-table-column>
      <el-table-column prop="gzh_account" label="公众号账号"></el-table-column>
      <el-table-column label="设备">
        <template slot-scope="scope">
          <el-radio-group
            v-model="scope.row.subscriber"
            size="small"
            @change="handleSubscriberChange(scope)"
          >
            <el-radio v-for="(item,index) in accountList" :key="index" :label="item">{{item}}</el-radio>
          </el-radio-group>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间"></el-table-column>
      <el-table-column prop="job_last_pull_time" label="最后拉取时间"></el-table-column>
      <el-table-column prop="job_last_push_time" label="最后推送时间"></el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <span>{{scope.row.status == 1?"已关注":scope.row.status == 0?"未关注":"待删除"}}</span>
        </template>
      </el-table-column>
      <el-table-column label="服务主题">
        <template slot-scope="scope">
          <el-button type="text" @click="handleShowTopicPop(scope)">{{scope.row.topics_count}}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="配置">
        <template slot-scope="scope">
          <el-button type="text" @click="handleShowEdit(scope)">修改</el-button>
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
    <el-dialog title="配置" :visible.sync="showConfig" class="edit-dialog" width="500">
      <el-form>
        <el-form-item label="公众号名称">
          <el-input v-model="nameInp" disabled="true" />
        </el-form-item>
        <el-form-item label="微信号">
          <el-input v-model="gzhInp" />
        </el-form-item>
        <el-form-item>
          <el-button @click="showConfig = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm()">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog title="所属主题列表" :visible.sync="showTopicDialog" class="edit-dialog" width="500">
      <el-table :data="topicList">
        <el-table-column prop="id">
          <template slot-scope="scope">
            <el-button type="text" @click="handleOpenWeb(scope)">{{scope.row.id}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="cards_count" label="动态数"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      keyword: "",
      dataList: [],
      topicList: [],
      accountList: [],
      statusInp: "",
      accountInp: "",
      gzhInp: "",
      nameInp: "",
      paginate: "",
      tableLoading: false,
      showConfig: false,
      currentPage: 1,
      currentScope: "",
      maxHeight: 0,
      showTopicDialog: false
    };
  },
  created() {
    this.maxHeight = window.innerHeight - 210;
    this.handleGetList();
    this.handleGetAccountList();
  },
  methods: {
    handleConfirm: function() {
      let data = {
        account: this.gzhInp,
        id: this.currentScope.row.id
      };
      this.$utils.axiosRequest(
        "POST",
        `/topic/waiting-follow-gzh/set-gzh-account`,
        "",
        data,
        res => {
          this.showConfig = false;
          this.bindPageChange(this.currentPage);
        },
        res => {}
      );
    },
    handleShowEdit: function(scope) {
      this.currentScope = scope;
      this.nameInp = scope.row.gzh_name;
      this.gzhInp = scope.row.gzh_account;
      this.showConfig = true;
    },
    handleSubscriberChange: function(scope) {
      let data = {
        id: scope.row.id,
        subscriber: scope.row.subscriber
      };
      this.$utils.axiosRequest(
        "POST",
        `/topic/waiting-follow-gzh/set-subscriber`,
        "",
        data,
        res => {},
        res => {}
      );
    },
    handleSearch: function() {
      this.currentPage = 1;
      this.handleGetList();
    },
    handleGetAccountList: function() {
      this.$utils.axiosRequest(
        "GET",
        `/topic/waiting-follow-gzh/subscribers`,
        "",
        "",
        res => {
          this.accountList = res.data.list;
        },
        res => {}
      );
    },
    handleShowTopicPop: function(scope) {
      this.showTopicDialog = true;
      this.currentScope = scope;
      this.handleGetTopicList();
    },
    handleGetTopicList: function() {
      let data = {
        job_id: this.currentScope.row.job_id
      };
      this.$utils.axiosRequest(
        "GET",
        `/topic/waiting-follow-gzh/topics`,
        data,
        "",
        res => {
          this.topicList = res.data.list;
        },
        res => {}
      );
    },
    handleOpenWeb: function(scope) {
      window.open("https://kzfeed.com/home/themeDetail?id=" + scope.row.hash_id);
    },
    handleGetList: function() {
      this.tableLoading = true;
      let data = {
        keyword: this.keyword,
        page: this.currentPage,
        subscriber: this.accountInp,
        status: this.statusInp
      };
      this.$utils.axiosRequest(
        "GET",
        `/topic/waiting-follow-gzh/list`,
        data,
        "",
        res => {
          this.tableLoading = false;
          this.dataList = res.data.list;
          this.paginate = res.data.paginate;
        },
        res => {
          this.tableLoading = false;
        }
      );
    },
    bindPageChange: function(val) {
      this.currentPage = val;
      this.handleGetList();
    }
  }
};
</script>

<style lang="stylus" scoped>
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
    flex-flow: column;
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
</style>

