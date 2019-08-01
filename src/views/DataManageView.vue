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
      <el-select
        class="status-selector"
        v-model="statusInp"
        placeholder="状态"
        @change="handleSearch"
        size="mini"
      >
        <el-option label="审核中" value="0"></el-option>
        <el-option label="已删除" value="3"></el-option>
        <el-option label="已发布" value="1"></el-option>
        <el-option label="已隐藏" value="2"></el-option>
      </el-select>
    </div>
    <div class="table-block">
      <el-table :data="dataList" v-loading="tableLoading" :height="maxHeight">
        <el-table-column prop="id" label="信息ID" width="100"></el-table-column>
        <el-table-column prop="created_at" label="发布时间" width="100"></el-table-column>
        <el-table-column prop="title" label="信息标题"></el-table-column>
        <el-table-column prop="text" label="信息简介"></el-table-column>
        <el-table-column prop="url" label="原文链接"></el-table-column>
        <el-table-column prop="topic_id" label="主题ID" width="100"></el-table-column>
        <el-table-column prop="name" label="主题名称" width="100"></el-table-column>
        <el-table-column prop="follow_users_count" label="订阅人数" width="100"></el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <!-- <el-button type="text" v-if="scope.row.status == 0" @click="handlePass(scope)">审核通过</el-button> -->
            <el-button type="text" @click="handleDelete(scope)" v-if="scope.row.status != 3">删除</el-button>
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      dataRange: "",
      keyword: "",
      currentPage: 1,
      statusInp: "",
      paginate: "",
      dataList: [],
      tableLoading: false,
      maxHeight: 0
    };
  },
  created() {
    this.maxHeight = window.innerHeight - 210;
    this.handleGetList();
  },
  methods: {
    handleSearch: function() {
      let data = {
        status: this.statusInp,
        keyword: this.keyword,
        start_time: this.dataRange != null ? this.dataRange[0] : "",
        end_time: this.dataRange != null ? this.dataRange[1] : ""
      };
      this.handleGetList(data);
    },
    handleClear: function() {
      this.keyword = "";
      this.statusInp = "";
      this.dataRange = "";
      this.currentPage = 1;
      this.handleGetList();
    },
    bindPageChange: function(val) {
      this.currentPage = val;
      let data = {
        keyword: this.keyword,
        status: this.statusInp,
        page: this.currentPage,
        start_time: this.dataRange != null ? this.dataRange[0] : "",
        end_time: this.dataRange != null ? this.dataRange[1] : ""
      };
      this.handleGetList(data);
    },
    handlePass: function(scope) {
      this.$confirm("是否执行该操作", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let data = {
            id: scope.row.id,
            status: 1
          };
          this.$utils.axiosRequest(
            "POST",
            `/card/review`,
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
    handleDelete: function(scope) {
      this.$confirm("是否删除该信息", "提示", {
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
            `/card/delete`,
            "",
            data,
            res => {
              for(let i in this.dataList){
                if(scope.row.id == this.dataList[i].id){
                  this.dataList.splice(i,1)
                }
              }
              // this.bindPageChange(this.currentPage);
            },
            res => {}
          );
        })
        .catch(() => {});
    },
    handleGetList: function(data) {
      this.tableLoading = true;
      this.$utils.axiosRequest(
        "GET",
        `/card/list`,
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

