<template>
  <div>
    <div class="tools-bar">
      <el-input
        size="mini"
        class="search-inp"
        v-model="keyword"
        placeholder="输入原创机器人ID/名称关键词搜索"
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
      <el-button type="primary" size="mini" @click="handleSearch">搜索</el-button>
      <el-button type="primary" class="btn" size="mini" @click="handleClear">重置</el-button>
      <el-button type="primary" size="mini" @click="handleCreate">新增机器人</el-button>
    </div>
    <el-table :data="dataList" v-loading="tableLoading" :height="maxHeight">
      <el-table-column prop="id" label="原创机器人ID"></el-table-column>
      <el-table-column prop="name" label="机器人名称"></el-table-column>
      <el-table-column prop="created_at" label="创建时间"></el-table-column>
      <el-table-column prop="cards_count" label="包含内容（条）"></el-table-column>
      <el-table-column prop="id" label="操作">
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
    <el-dialog title="创建/修改机器人" :visible.sync="showConfigDialog" class="edit-dialog" width="300px">
      <div style="margin-bottom:20px">
        <el-input v-model="titleInp" placeholder="请输入机器人ID" />
      </div>
      <div class="btn-block">
        <el-button size="mini" @click="handleConfigSave()" type="primary">确定</el-button>
        <el-button size="mini" @click="handleConfigCancel()">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      keyword: "",
      dataRange: "",
      currentPage: 1,
      currrentScope: "",
      tableLoading: false,
      showConfigDialog: false,
      dataList: [],
      titleInp: ""
    };
  },
  created() {
    this.maxHeight = window.innerHeight - 210;
    this.handleGetList();
  },
  methods: {
    handleConfigSave: function() {
      let data = {
        new_bot_id: this.titleInp,
        old_bot_id:
          this.currrentScope == "" ? this.titleInp : this.currrentScope.row.id
      };
      this.$utils.axiosRequest(
        "POST",
        `/robot/self-create/store`,
        "",
        data,
        res => {
          this.showConfigDialog = false;
          this.handleSearch();
        },
        res => {}
      );
    },
    handleEdit: function(scope) {
      this.currrentScope = scope;
      this.titleInp = scope.row.id;
      this.showConfigDialog = true;
    },
    handleCreate: function() {
      this.titleInp = "";
      this.currrentScope = "";
      this.showConfigDialog = true;
    },
    handleSearch: function() {
      this.currentPage = 1;
      this.handleGetList();
    },
    handleClear: function() {
      this.keyword = "";
      this.dataRange = "";
      this.handleGetList();
    },
    bindPageChange: function(val) {
      this.currentPage = val;
      this.handleGetList();
    },
    handleDelete: function(scope) {
      this.$confirm("是否执行该操作", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let data = {
            bot_id: scope.row.id
          };
          this.$utils.axiosRequest(
            "POST",
            `/robot/self-create/delete`,
            "",
            data,
            res => {
              this.handleSearch()
            },
            res => {}
          );
        })
        .catch();
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
        `/robot/self-create/list`,
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

