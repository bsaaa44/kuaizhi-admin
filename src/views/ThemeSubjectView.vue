<template>
  <div>
    <div class="tools-bar">
      <el-select
        class="status-selector"
        v-model="visableInp"
        placeholder="状态"
        @change="handleSearch"
        size="mini"
      >
        <el-option label="请选择" value></el-option>
        <el-option label="上架" value="1"></el-option>
        <el-option label="下架" value="0"></el-option>
      </el-select>
      <el-button size="mini" @click="handleAdd()">新增专题</el-button>
    </div>
    <div class="table-block">
      <el-table :data="dataList" v-loading="tableLoading" :height="maxHeight">
        <el-table-column prop="id" label="专题ID"></el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column label="包含主题">
          <template slot-scope="scope">
            <el-button
              type="text"
              style="width:100%"
              @click="handleGetRobotList(scope)"
            >{{scope.row.items_count}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="状态">
          <template slot-scope="scope">{{scope.row.visible == 1?"上架":"下架"}}</template>
        </el-table-column>
        <el-table-column prop="sort" label="顺序"></el-table-column>
       
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" v-if="scope.row.visible == 1" @click="handlePutGoods(scope,0)">下架</el-button>
            <el-button type="text" v-else @click="handlePutGoods(scope,1)">上架</el-button>
            <el-button type="text" @click="handleDelete(scope)">删除</el-button>
            <el-button type="text" @click="handleShowEdit(scope)">修改</el-button>
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
    <el-dialog title="修改banner" :visible.sync="showEditDialog" class="edit-dialog" width="500">
      <div class="config-block">
        <table>
          <tr>
            <td>专题名称</td>
            <td>
              <el-input v-model="nameInp" />
            </td>
          </tr>
          <tr>
            <td>排序</td>
            <td>
              <el-input v-model="sortInp" />
            </td>
          </tr>
        </table>
      </div>
      <div class="btn-block">
        <el-button type="primary" @click="handleEdit()">确定</el-button>
        <el-button @click="handleCloseEdit()">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="专题" :visible.sync="showRobotDialog" class="edit-dialog" width="500">
      <el-button size="mini" @click="handleAddBot()">新增主题</el-button>
      <el-table :data="dataList2" v-loading="tableLoading2">
        <el-table-column prop="target_id" label="主题ID"></el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="follow_users_count" label="订阅人数"></el-table-column>
        <el-table-column prop="sort" label="顺序"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" @click="handleBotEdit(scope)">修改</el-button>
            <el-button type="text" @click="handleBotDelete(scope)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- <div class="pagination">
        <el-pagination
          v-if="dataList2.length!=0"
          :total="paginate2.total"
          :page-size="20"
          layout="total,prev,pager,next,jumper"
          @current-change="bindPageChange2"
        ></el-pagination>
      </div>-->
    </el-dialog>
    <el-dialog title="新增/修改主题" :visible.sync="showBotEditDialog" class="edit-dialog" width="500">
      <div class="config-block">
        <table>
          <tr>
            <td>主题ID</td>
            <td>
              <el-input v-model="idInp" @input="handleGetBotDetail(idInp)" />
            </td>
          </tr>
          <tr>
            <td>主题名称</td>
            <td>{{nameTips}}</td>
          </tr>
          <tr>
            <td>排序</td>
            <td>
              <el-input v-model="sortInp" />
            </td>
          </tr>
        </table>
      </div>
      <div class="btn-block">
        <el-button type="primary" @click="handleThemeConfirm()">确定</el-button>
        <el-button @click="handleThemeCancel()">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      tableLoading: false,
      tableLoading2: false,
      upLoading: false,
      visableInp: "",
      dataList: [],
      dataList2: [],
      maxHeight: 0,
      showEditDialog: false,
      showRobotDialog: false,
      showBotEditDialog: false,
      nameInp: "",
      sortInp: "",
      nameTips: "",
      idInp: "",
      sortInp: "",
      uploadCover: "",
      paginate: "",
      paginate2: "",
      currentPage: 1,
      currentPage2: 1,
      currentScope: "",
      currentScope2: ""
    };
  },
  created() {
    this.maxHeight = window.innerHeight - 210;
    let data = {
      target: "topic",
      type: "special"
    };
    this.handleGetList(data);
  },
  methods: {
    handleDelete: function(scope) {
      this.$confirm("是否执行此操作", "提示", {
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
            `/classification/delete`,
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
    handleSearch: function() {
      let data = {
        target: "topic",
        type: "special",
        visible: this.visableInp
      };
      this.handleGetList(data);
    },
    handleAdd: function() {
      this.nameInp = "";
      this.sortInp = "";
      this.currentScope = "";
      this.uploadCover = "";
      this.showEditDialog = true;
    },
    handleAddBot: function() {
      this.currentScope2 = "";
      this.idInp = "";
      this.nameTips = "";
      this.sortInp = "";
      this.showBotEditDialog = true;
    },
    handleBotDelete: function(scope) {
      this.$confirm("是否执行此操作", "提示", {
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
            `/classification/item/delete`,
            "",
            data,
            res => {
              this.handleGetRobotList(this.currentScope, this.currentPage2);
            },
            res => {}
          );
        })
        .catch();
    },
    handleBotEdit: function(scope) {
      this.currentScope2 = scope;
      this.idInp = scope.row.target_id;
      this.sortInp = scope.row.sort;
      this.handleGetBotDetail(scope.row.target_id);
      this.showBotEditDialog = true;
    },
    handleGetRobotList: function(scope, page) {
      this.currentScope = scope;
      let data = {
        id: scope.row.id
      };
      this.$utils.axiosRequest(
        "GET",
        `/classification/item/list`,
        data,
        "",
        res => {
          this.dataList2 = res.data.list;
          // this.paginate2 = res.data.paginate;
          this.showRobotDialog = true;
        },
        res => {}
      );
    },
    handleShowEdit: function(scope) {
      this.currentScope = scope;
      this.uploadCover = scope.row.banner;
      this.nameInp = scope.row.name;
      this.sortInp = scope.row.sort;
      this.showEditDialog = true;
    },
    bindPageChange: function(val) {
      this.currentPage = val;
      let data = {
        page: val,
        target: "topic",
        type: "special",
        visible: this.visableInp
      };
      this.handleGetList(data);
    },
    bindPageChange2: function(val) {
      this.currentPage2 = val;
      this.handleGetRobotList(this.currentScope, val);
    },
    handlePutGoods: function(scope, type) {
      this.$confirm("是否执行此操作", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let data = {
            visible: type,
            id: scope.row.id,
            image: scope.row.image,
            sort: scope.row.sort,
            name: scope.row.name,
            target: "topic",
            type: "special"
          };
          this.$utils.axiosRequest(
            "POST",
            `/classification/store`,
            "",
            data,
            res => {
              this.handleGetList({
                page: this.currentPage,
                target: "topic",
                type: "special"
              });
            },
            res => {}
          );
        })
        .catch(() => {});
    },
    handleUploadSuccess: function(res, file) {
      this.uploadCover = file.response.url;
    },
    handleGetList: function(data) {
      this.$utils.axiosRequest(
        "GET",
        `/classification/list`,
        data,
        "",
        res => {
          this.dataList = res.data.list;
          this.paginate = res.data.paginate;
        },
        res => {}
      );
    },
    handleThemeConfirm: function() {
      let data = {
        classification_id: this.currentScope.row.id,
        target_id: this.idInp,
        id: this.currentScope2 == "" ? undefined : this.currentScope2.row.id,
        sort: this.sortInp
      };
      this.$utils.axiosRequest(
        "POST",
        `/classification/item/store`,
        "",
        data,
        res => {
          this.handleGetRobotList(this.currentScope, this.currentPage2);
          this.showBotEditDialog = false;
        },
        res => {}
      );
    },
    handleThemeCancel: function() {
      this.showBotEditDialog = false;
    },
    handleCloseEdit: function() {
      this.showEditDialog = false;
    },
    handleGetBotDetail: function(id) {
      if (id == "") {
        this.nameTips = "";
        return;
      }
      let data = {
        id
      };
      this.$utils.axiosRequest(
        "GET",
        `/topic/info`,
        data,
        "",
        res => {
          this.nameTips = res.data.info.name;
        },
        res => {}
      );
    },
    handleEdit: function() {
      let data = {
        image: this.uploadCover,
        id: this.currentScope == "" ? undefined : this.currentScope.row.id,
        name: this.nameInp,
        sort: this.sortInp,
        target: "topic",
        type: "special"
      };
      this.$utils.axiosRequest(
        "POST",
        `/classification/store`,
        "",
        data,
        res => {
          this.handleGetList({
            page: this.currentPage,
            target: "topic",
            type: "special"
          });
          this.showEditDialog = false;
        },
        res => {}
      );
    }
  }
};
</script>
<style lang="stylus" scoped>
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
</style>
