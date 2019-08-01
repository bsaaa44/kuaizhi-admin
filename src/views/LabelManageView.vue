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
      <!-- <el-date-picker
        class="date-picker"
        value-format="yyyy-MM-dd"
        v-model="dataRange"
        type="daterange"
        @change="handleSearch"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        size="mini"
      ></el-date-picker>-->
      <el-select
        class="status-selector"
        v-model="categoryInp"
        placeholder="状态"
        @change="handleSearch"
        size="mini"
      >
        <el-option label="请选择维度" value></el-option>
        <el-option
          v-for="(item,index) in categoryList"
          :key="index"
          :label="item.name"
          :value="item.id"
        ></el-option>
      </el-select>
      <el-button type="primary" size="mini" @click="showManage()">管理维度</el-button>
      <el-button type="primary" size="mini" @click="showAddLabel()">添加标签</el-button>
    </div>
    <el-table :data="list" v-loading="tableLoading" :height="maxHeight">
      <el-table-column prop="id" label="标签ID"></el-table-column>
      <el-table-column prop="label_name" label="标签名称"></el-table-column>
      <el-table-column prop="category_id" label="所属维度ID"></el-table-column>
      <el-table-column prop="category_name" label="所属维度名称"></el-table-column>
      <el-table-column label="关联主题数">
        <template slot-scope="scope">
          <el-button type="text" @click="handleShowTopic(scope)">{{scope.row.relation_topics_count}}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope)">修改</el-button>
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
    <el-dialog title="关联主题列表" :visible.sync="showTopicPop" class="edit-dialog" width="500">
      <el-table :data="topicList" v-loading="loading2">
        <el-table-column prop="id" label="主题ID"></el-table-column>
        <el-table-column prop="name" label="主题名称"></el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-if="topicList.length!=0"
          :total="paginate2.total"
          :page-size="20"
          layout="total,prev,pager,next,jumper"
          @current-change="bindPageChange2"
        ></el-pagination>
      </div>
    </el-dialog>
    <el-dialog title="管理标签维度" :visible.sync="showManageCategory" class="edit-dialog" width="500">
      <el-button type="primary" @click="handleAddCategory()" size="mini">新增维度</el-button>
      <el-table :data="categoryList" v-loading="loading2">
        <el-table-column prop="id" label="ID"></el-table-column>
        <el-table-column prop="name" label="维度名"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" @click="handleEditCategory(scope)">修改</el-button>
            <el-button type="text" @click="handleDeleteCategory(scope)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog title="新增/修改标签" :visible.sync="showAddLabelPop" class="edit-dialog" width="300px">
      <el-form>
        <el-form-item label="名称">
          <el-input v-model="nameInp" />
        </el-form-item>
        <el-form-item label="维度">
          <el-select v-model="cateInp" placeholder="选择维度">
            <el-option
              v-for="(item,index) in categoryList"
              :key="index"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="showAddLabelPop = false">取消</el-button>
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
      // dataRange: "",
      keyword: "",
      categoryInp: "",
      cateInp: "",
      nameInp: "",
      currentPage: 1,
      currentPage2: 1,
      paginate: "",
      paginate2: "",
      loading2: false,
      list: [],
      topicList: [],
      categoryList: [],
      currentScope: "",
      showTopicPop: false,
      tableLoading: false,
      maxHeight: 0,
      showManageCategory: false,
      showAddLabelPop: false
    };
  },
  created() {
    this.maxHeight = window.innerHeight - 210;
    this.handleGetList();
    this.handleGetCategoryList();
  },
  methods: {
    handleConfirm: function() {
      let data = {
        id: this.currentScope != "" ? this.currentScope.row.id : undefined,
        name: this.nameInp,
        category_id: this.cateInp
      };
      this.$utils.axiosRequest(
        "POST",
        `/label/store`,
        "",
        data,
        res => {
          this.showAddLabelPop = false;
          this.bindPageChange(this.currentPage);
        },
        res => {}
      );
    },
    showAddLabel: function() {
      this.nameInp = "";
      this.cateInp = "";
      this.currentScope = "";
      this.showAddLabelPop = true;
    },
    handleDelete: function(scope) {
      this.$confirm("确定执行此操作？", "提示", {
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
            `/label/delete`,
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
      this.nameInp = scope.row.label_name;
      this.cateInp = scope.row.category_id;
      this.showAddLabelPop = true;
    },
    handleAddCategory: function(scope) {
      this.$prompt("请输入名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          let data = {
            name: value
          };
          this.$utils.axiosRequest(
            "POST",
            `/label/category/store`,
            "",
            data,
            res => {
              this.handleGetCategoryList();
            },
            res => {}
          );
        })
        .catch();
    },
    handleDeleteCategory: function(scope) {
      this.$confirm("确定执行此操作？", "提示", {
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
            `/label/category/delete`,
            "",
            data,
            res => {
              this.handleGetCategoryList();
            },
            res => {}
          );
        })
        .catch();
    },
    handleEditCategory: function(scope) {
      this.$prompt("请输入名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValue: scope.row.name
      })
        .then(({ value }) => {
          let data = {
            id: scope.row.id,
            name: value
          };
          this.$utils.axiosRequest(
            "POST",
            `/label/category/store`,
            "",
            data,
            res => {
              this.handleGetCategoryList();
            },
            res => {}
          );
        })
        .catch();
    },
    showManage: function() {
      this.showManageCategory = true;
    },
    handleShowTopic: function(scope) {
      this.currentScope = scope;
      this.$nextTick(() => {
        this.handleGetTopicList();
        this.showTopicPop = true;
      });
    },
    handleGetTopicList: function() {
      this.loading2 = true;
      let data = {
        id: this.currentScope.row.id,
        page: this.currentPage2
      };
      this.$utils.axiosRequest(
        "GET",
        `/label/relation-topics-list`,
        data,
        "",
        res => {
          this.loading2 = false;
          this.topicList = res.data.list;
          this.paginate2 = res.data.paginate;
        },
        res => {}
      );
    },
    bindPageChange2: function(val) {
      this.currentPage2 = val;
      this.handleGetTopicList();
    },
    bindPageChange: function(val) {
      this.currentPage = val;
      this.handleGetList();
    },
    handleGetCategoryList: function() {
      this.loading2 = true;
      this.$utils.axiosRequest(
        "GET",
        `/label/category/list`,
        "",
        "",
        res => {
          this.loading2 = false;
          this.categoryList = res.data.list;
        },
        res => {}
      );
    },
    handleGetList: function() {
      this.tableLoading = true
      let data = {
        keyword: this.keyword,
        page: this.currentPage,
        category_id: this.categoryInp
        // start_time: this.dataRange != null ? this.dataRange[0] : "",
        // end_time: this.dataRange != null ? this.dataRange[1] : ""
      };
      this.$utils.axiosRequest(
        "GET",
        `/label/list`,
        data,
        "",
        res => {
          this.tableLoading = false
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

