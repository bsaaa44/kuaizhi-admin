<template>
  <div>
    <el-table
      :data="dataList"
      v-loading="tableLoading"
      v-if="dataList.length>0"
      :height="maxHeight"
    >
      <el-table-column label="ID">
        <template slot-scope="scope">
          <el-button type="text" @click="navToDetail(scope)">{{scope.row.id}}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间"></el-table-column>
      <el-table-column label="卡片id" prop="card.id"></el-table-column>
      <el-table-column label="卡片创建时间" prop="card.created_at"></el-table-column>
      <el-table-column label="卡片标题" prop="card.title"></el-table-column>
      <el-table-column label="卡片信息" prop="card.text">
        <template slot-scope="scope">
          <el-button type="text" @click="showDetail(scope)">查看详情</el-button>
        </template>
      </el-table-column>
      <el-table-column label="卡片地址" prop>
        <template slot-scope="scope">
          <el-button type="text" @click="navToOrigin(scope.row.card.url)">{{scope.row.card.url}}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="words" label="敏感词"></el-table-column>
      <el-table-column>
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.status == 0" @click="handleReview(scope,1)">无异常</el-button>
          <el-button type="text" v-if="scope.row.status == 0" @click="handleReview(scope,2)">删除该信息</el-button>
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
    <el-dialog
      title="详情"
      :visible.sync="showDialog"
      class="edit-dialog"
      width="500"
      style="text-align:left;"
    >
      <div v-if="currentScope.row">{{currentScope.row.card.text}}</div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showDialog: false,
      maxHeight: 0,
      currentPage: 1,
      currentScope: {},
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
    navToOrigin: function(url) {
      window.open(url);
    },
    navToDetail: function(scope) {
      window.open(`https://kz.sync163.com/web/card/${scope.row.card.hash_id}`);
    },
    showDetail: function(scope) {
      this.currentScope = scope;
      this.showDialog = true;
    },
    handleGetList: function() {
      let data = {
        page: this.currentPage
      };
      this.$utils.axiosRequest(
        "GET",
        `/sensitive-cards/list`,
        data,
        "",
        res => {
          this.dataList = res.data.list;
          this.paginate = res.data.paginate;
        },
        res => {}
      );
    },
    handleReview: function(scope, status) {
      this.$confirm("是否执行该操作", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let data = {
            id: scope.row.id,
            status: status
          };
          this.$utils.axiosRequest(
            "POST",
            `/sensitive-cards/review`,
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