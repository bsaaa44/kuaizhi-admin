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
        v-model="visableInp"
        placeholder="状态"
        @change="handleSearch"
        size="mini"
      >
        <el-option label="上架" value="1"></el-option>
        <el-option label="下架" value="0"></el-option>
      </el-select>
      <el-button type="primary" size="mini" @click="handleSearch">搜索</el-button>
      <el-button type="primary" class="btn" size="mini" @click="handleClear">重置</el-button>
      <el-button @click="handleAdd()">新增分类</el-button>
    </div>
    <div class="table-block">
      <el-table :data="dataList" v-loading="tableLoading" :height="maxHeight">
        <el-table-column prop="id" label="类别ID"></el-table-column>
        <el-table-column prop="name" label="类别名称"></el-table-column>
        <el-table-column prop="id" label="类别logo">
          <template slot-scope="scope">
            <img :src="scope.row.icon" class="table-img" />
          </template>
        </el-table-column>
        <el-table-column prop="id" label="类别封面">
          <template slot-scope="scope">
            <img :src="scope.row.cover" class="table-img" />
          </template>
        </el-table-column>
        <el-table-column prop="robotsCount" label="包含机器人（个）"></el-table-column>
        <el-table-column prop="sort" label="排序"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" @click="handleShowEdit(scope)">修改</el-button>
            <el-button type="text" @click="handleDelete(scope)">删除</el-button>
            <el-button type="text" v-if="scope.row.visible==0" @click="handlePut(scope,1)">上架</el-button>
            <el-button type="text" v-if="scope.row.visible==1" @click="handlePut(scope,0)">下架</el-button>
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
    <el-dialog
      title="新增/修改分类"
      :visible.sync="showCategoryDialog"
      class="category-dialog"
      width="500"
    >
      <div class="inp-block">
        <table border="0">
          <tr>
            <td>
              <label for="nameInp">类别icon</label>
            </td>
            <td>
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
            </td>
          </tr>
          <tr>
            <td>
              <label for="nameInp">类别封面</label>
            </td>
            <td>
              <el-upload
                v-loading="upLoading2"
                :show-file-list="false"
                class="uploader"
                :action="$global.hostUrl+'/upload'"
                :on-success="handleUploadSuccess2"
              >
                <img v-if="uploadCover2.length>0" :src="uploadCover2" class="img-cover" />
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </td>
          </tr>
          <tr>
            <td>
              <label for="nameInp">分类名称</label>
            </td>
            <td>
              <el-input id="nameInp" placeholder="请输入分类名称" v-model="nameInp" class="inp" />
            </td>
          </tr>
          <tr>
            <td>
              <label for="nameInp">排序</label>
            </td>
            <td>
              <el-input id="nameInp" placeholder="请输入排序大小（越小越靠前）" v-model="sortInp" class="inp" />
            </td>
          </tr>
        </table>
      </div>
      <div class="btn-block">
        <el-button type="primary" @click="handleEdit()">确定</el-button>
        <el-button @click="handleCloseEdit()">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visableInp: "",
      keyword: "",
      dataList: [],
      pageinate: "",
      tableLoading: false,
      upLoading: false,
      showCategoryDialog: false,
      maxHeight: 0,
      nameInp: "",
      sortInp: "",
      paginate: "",
      uploadCover: "",
      uploadCover2: "",
      currentScope: ""
    };
  },
  created() {
    this.maxHeight = window.innerHeight - 210;
    this.handleGetList();
  },
  methods: {
    handlePut: function(scope, status) {
      this.$confirm("是否执行该操作", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let data = {
            id: scope.row.id,
            visible: status
          };
          this.$utils.axiosRequest(
            "POST",
            `/robot/category/visible`,
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
    handleSearch: function() {
      let data = {
        visible: this.visableInp == "" ? undefined : this.visableInp,
        keyword: this.keyword
      };
      this.handleGetList(data);
    },
    bindPageChange: function(val) {
      this.currentPage = val;
      let data = {
        visible: this.visableInp == "" ? undefined : this.visableInp,
        keyword: this.keyword,
        page: this.currentPage
      };
      this.handleGetList(data);
    },
    handleAdd: function() {
      this.nameInp = "";
      this.currentScope = "";
      this.uploadCover = "";
      this.uploadCover2 = "";
      this.showCategoryDialog = true;
    },
    handleShowEdit: function(scope) {
      this.currentScope = scope;
      this.sortInp = scope.row.sort;
      this.nameInp = scope.row.name;
      this.uploadCover2 = scope.row.cover;
      this.uploadCover = scope.row.icon;
      this.showCategoryDialog = true;
    },
    handleEdit: function() {
      let data = {
        id: this.currentScope == "" ? undefined : this.currentScope.row.id,
        icon: this.uploadCover,
        sort: this.sortInp,
        name: this.nameInp,
        cover: this.uploadCover2
      };
      this.$utils.axiosRequest(
        "POST",
        `/robot/category/store`,
        "",
        data,
        res => {
          this.bindPageChange(this.currentPage);
          this.showCategoryDialog = false;
        },
        res => {}
      );
    },
    handleCloseEdit: function() {
      this.nameInp = "";
      this.uploadCover = "";
      this.showCategoryDialog = false;
    },
    handleUploadSuccess: function(res, file) {
      this.uploadCover = file.response.url;
    },
    handleUploadSuccess2: function(res, file) {
      this.uploadCover2 = file.response.url;
    },
    handleDelete: function(scope) {
      this.$confirm("是否删除该分类", "提示", {
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
            `/robot/category/delete`,
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
    handleGetList: function(data) {
      this.tableLoading = true;
      this.$utils.axiosRequest(
        "GET",
        `/robot/category/list`,
        data,
        "",
        res => {
          this.tableLoading = false;
          this.dataList = res.data.list;
          this.pageinate = res.data.pageinate;
        },
        res => {
          this.tableLoading = false;
        }
      );
    },
    handleClear: function() {
      this.keyword = "";
      this.visableInp = "";
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

.category-dialog {
  .inp-block {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    // text-align center
  }

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
</style>

