<template>
  <div>
    <div class="tools-bar">
      <el-input
        size="mini"
        class="search-inp"
        v-model="keyword"
        placeholder="输入主题ID/主题名称/创建者昵称/创建者ID/介绍关键词"
        @change="handleSearch"
      />
      <el-button type="primary" size="mini" @click="handleSearch">搜索</el-button>
      <el-button type="primary" class="btn" size="mini" @click="handleClear">重置</el-button>
    </div>
    <el-table :data="list" v-loading="tableLoading" :height="maxHeight">
      <el-table-column prop="bot_id" width="100" label="机器人ID"></el-table-column>
      <el-table-column prop="bot_name" width="100" label="机器人名称"></el-table-column>
      <el-table-column prop="job_id" label="任务ID" width="100"></el-table-column>
      <el-table-column prop="topic_ids" label="主题ID" width="100">
        <template slot-scope="scope">
          <span v-for="(item,index) in scope.row.topic_ids" :key="index">{{item}} </span>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" width="100" label="创建时间"></el-table-column>
      <el-table-column prop="reason" label="删除原因"></el-table-column>
      <el-table-column prop="job_params" label="主题配置">
        <!-- <template slot-scope="scope"> -->
        <!-- <el-button type="text" @click="handleShowConfig(scope)">点击查看</el-button> -->
        <!-- </template> -->
      </el-table-column>
      <el-table-column label="任务处理" width="150">
        <template slot-scope="scope">
          <el-button type="text" @click="handleDelete(scope)">删除</el-button>
          <el-button type="text" @click="handlePass(scope)">继续运行</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        v-if="list.length!=0"
        :total="paginate.total"
        :page-size="20"
        layout="total,prev,pager,next,jumper"
        @current-change="bindPageChange"
      ></el-pagination>
    </div>
    <el-dialog title="查看配置" :visible.sync="showConfigPop" class="edit-dialog" width="500">
      <el-form v-if="currentParams!=''">
        <el-form-item
          v-for="(item,index) in currentParams"
          :key="index"
          :label="item.param"
        >{{item.value}}</el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      dataRange: "",
      keyword: "",
      currentPage: 1,
      currentScope: "",
      currentParams: "",
      statusInp: "",
      paginate: "",
      list: [],
      tableLoading: false,
      maxHeight: 0,
      showConfigPop: false
    };
  },
  filters: {
    showStatus: function(scope) {
      if (scope.row.job_status == 0) {
        return "已删除";
      } else if (scope.row.job_status == 1) {
        return "正常运行";
      } else if (scope.row.job_status == 2) {
        return "审核中";
      } else if (scope.row.job_status == 3) {
        return "暂停中";
      }
    }
  },
  created() {
    this.maxHeight = window.innerHeight - 210;
    this.handleGetList();
  },
  methods: {
    handlePass: function(scope){
      this.$confirm("是否执行该操作", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let data = {
            job_id: scope.row.job_id,
            status: 1
          };
          this.$utils.axiosRequest(
            "POST",
            `/job/update-status`,
            "",
            data,
            res => {
              this.handleGetList();
            },
            res => {}
          );
        })
        .catch(() => {});
    },
    handleDelete: function(scope) {
      this.$prompt("请输入删除理由", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValue: scope.row.reason
      })
        .then(val => {
          let data = {
            job_id: scope.row.job_id,
            reason: val.value
          };
          this.$utils.axiosRequest(
            "POST",
            `/job/delete`,
            "",
            data,
            res => {
              this.handleGetList();
            },
            res => {}
          );
        })
        .catch(() => {});
    },
    handleShowConfig: function(scope) {
      let arr = [];
      let params = JSON.parse(scope.row.job_params);
      for (let i in params) {
        let obj = {
          param: i,
          value: params[i]
        };
        arr.push(obj);
      }
      this.currentParams = arr;
      this.$nextTick(() => {
        this.showConfigPop = true;
      });
    },
    bindPageChange: function(val) {
      this.currentPage = val;
      this.handleGetList();
    },
    handleGetList: function() {
      let data = {
        keyword: this.keyword,
        page: this.currentPage,
      };
      this.$utils.axiosRequest(
        "POST",
        `/job/waiting-delete`,
        "",
        data,
        res => {
          this.list = res.data.list;
          this.paginate = res.data.paginate;
        },
        res => {}
      );
    },
    handleSearch: function() {
      this.currentPage = 1;
      this.handleGetList();
    },
    handleClear: function() {
      this.statusInp = "";
      this.keyword = "";
      this.dataRange = "";
      this.currentPage = 1;
      this.handleSearch();
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
