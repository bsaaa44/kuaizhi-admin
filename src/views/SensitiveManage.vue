<template>
  <div>
    <div>
      <el-button type="primary" @click="handleAdd()">新增敏感词</el-button>
    </div>
    <el-table :data="dataList" v-loading="tableLoading" :height="maxHeight">
      <el-table-column prop="id" label="ID"></el-table-column>
      <el-table-column prop="created_at" label="创建时间"></el-table-column>
      <el-table-column prop="word" label="敏感词"></el-table-column>
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      maxHeight: 0,
      currentScope: null,
      currentPage: 1,
      dataList: [],
      paginate: {},
      tableLoading: false
    };
  },
  created() {
    this.maxHeight = window.innerHeight - 210;
    this.handleGetList();
  },
  mounted() {},
  methods: {
    handleAdd: function() {
      this.currentScope = null;
      this.$nextTick(() => {
        this.editData()
      });
    },
    editData: function() {
      this.$prompt("请输入敏感词", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValue: this.currentScope ? this.currentScope.row.word : ""
      })
        .then(({ value }) => {
          let data = {
            id: this.currentScope ? this.currentScope.row.id : undefined,
            word: value
          };
          this.$utils.axiosRequest(
            "POST",
            `/sensitive-words/store`,
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
    handleEdit: function(scope) {
      this.currentScope = scope;
      this.$nextTick(() => {
        this.editData()
      });
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
            `/sensitive-words/destroy`,
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
    handleGetList: function() {
      let data = {
        page: this.currentPage
      };
      this.$utils.axiosRequest(
        "GET",
        `/sensitive-words/list`,
        data,
        "",
        res => {
          this.dataList = res.data.list;
          this.paginate = res.data.paginate;
        },
        res => {}
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