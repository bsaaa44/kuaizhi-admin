<template>
  <div>
    <div class="tools-bar">
      <el-input
        size="mini"
        class="search-inp"
        v-model="keyword"
        placeholder="输入机器人ID/机器人名称"
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
      <el-button type="primary" size="mini" @click="showAdd()">添加</el-button>
    </div>
    <el-table :data="list" v-loading="tableLoading" :height="maxHeight">
      <el-table-column prop="bot_id" label="机器人ID"></el-table-column>
      <el-table-column prop="bot_name" label="机器人名称"></el-table-column>
      <el-table-column prop="created_at" label="开始监控时间"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="handleDelete(scope)">删除</el-button>
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
    <el-dialog title="添加到监控名单" :visible.sync="showConfigPop" class="edit-dialog" width="500">
      <el-form>
        <el-form-item>
          <el-input v-model="idInp" placeholder="请输入机器人ID" />
        </el-form-item>
        <el-form-item>
          <el-button @click="showConfigPop = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm()">确定</el-button>
        </el-form-item>
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
      paginate: "",
      idInp: "",
      list: [],
      tableLoading: false,
      maxHeight: 0,
      showConfigPop: false
    };
  },
  created() {
    this.maxHeight = window.innerHeight - 210;
    this.handleGetList();
  },
  methods: {
    handleConfirm: function() {
      let data = {
        bot_id: this.idInp
      };
      this.$utils.axiosRequest(
        "POST",
        `/be-monitored-image-bots/store`,
        "",
        data,
        res => {
          this.showConfigPop = false;
          this.handleSearch();
        },
        res => {}
      );
    },
    showAdd: function() {
      this.idInp = "";
      this.showConfigPop = true;
    },
    handleDelete: function(scope) {
      this.$confirm("是否执行该操作", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let data = {
            bot_id: scope.row.bot_id
          };
          this.$utils.axiosRequest(
            "POST",
            `/be-monitored-image-bots/delete`,
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
    bindPageChange: function(val) {
      this.currentPage = val;
      this.handleGetList();
    },
    handleGetList: function() {
      let data = {
        keyword: this.keyword,
        page: this.currentPage,
        start_time: this.dataRange != null ? this.dataRange[0] : "",
        end_time: this.dataRange != null ? this.dataRange[1] : ""
      };
      this.$utils.axiosRequest(
        "GET",
        `/be-monitored-image-bots/list`,
        data,
        "",
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
      this.keyword = "";
      this.dataRange = "";
      this.currentPage = 1;
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

