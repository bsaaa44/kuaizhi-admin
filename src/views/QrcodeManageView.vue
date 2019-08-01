<template>
  <div>
    <div class="tools-bar">
      <el-button type="primary" size="mini" @click="handleAdd()">新增</el-button>
    </div>
    <el-table :data="dataList" v-loading="tableLoading" :height="maxHeight">
      <el-table-column prop="id" label="二维码ID"></el-table-column>
      <el-table-column prop="group_name" label="二维码名称"></el-table-column>
      <el-table-column prop="media_id" label="素材ID"></el-table-column>
      <el-table-column prop="created_at" label="二维码">
        <template slot-scope="scope">
          <div>{{scope.row.url}}</div>
          <!-- <a :href="scope.row.url" target="_blank">查看图片</a> -->
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间"></el-table-column>
      <el-table-column prop="remain" label="剩余次数"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button @click="handleEdit(scope)" type="text">修改</el-button>
          <el-button @click="handleDelete(scope)" type="text">删除</el-button>
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
    <el-dialog title="新增/修改" :visible.sync="showConfigDialog" class="edit-dialog" width="300px">
      <el-form style="text-align:left" label-width="80px" label-position="left">
        <el-form-item label="群名称">
          <el-input size="mini" placeholder="请输入群名称" v-model="groupNameInp" style="width: 150px" />
        </el-form-item>
        <el-form-item label="二维码">
          <el-upload
            ref="upload"
            :on-success="handleSuccess"
            name="qrcode"
            :data="uploadData"
            :limit="1"
            :on-change="handleChange"
            :on-exceed="handleExceed"
            :action="$global.hostUrl+'/group/qrcode/store'"
            :file-list="fileList"
            :auto-upload="false"
          >
            <el-button size="mini" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="剩余次数">
          <el-input size="mini" placeholder="大于0小于等于100" v-model="remainInp" style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit()" size="mini">提交</el-button>
          <el-button @click="showConfigDialog = false" size="mini">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentPage: 1,
      currentScope: "",
      dataList: [],
      fileList: [],
      uploadData: {},
      paginate: "",
      remainInp: "",
      groupNameInp: "",
      tableLoading: false,
      hasFile: false,
      maxHeight: 0,
      showConfigDialog: false
    };
  },
  created() {
    this.maxHeight = window.innerHeight - 210;
    this.getList();
  },
  methods: {
    bindPageChange: function(val) {
      this.currentPage = val;
      this.getList();
    },
    handleAdd: function() {
      this.currentScope = "";
      this.remainInp = "";
      this.groupNameInp = "";
      this.uploadData = {};
      this.fileList = [];
      this.hasFile = false;
      this.showConfigDialog = true;
    },
    handleEdit: function(scope) {
      this.currentScope = scope;
      this.groupNameInp = scope.row.group_name;
      this.remainInp = scope.row.remain;
      this.showConfigDialog = true;
    },
    handleChange: function(file) {
      this.hasFile = true;
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
            `/group/qrcode/delete`,
            "",
            data,
            res => {
              this.getList();
            },
            res => {}
          );
        })
        .catch();
    },
    handleExceed: function() {
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
    },
    handleSuccess: function() {
      this.fileList = [];
      this.remainInp = "";
      this.groupNameInp = "";
      this.hasFile = false;
      this.showConfigDialog = false;
      this.getList();
    },
    handleSubmit: function() {
      if (this.hasFile === true) {
        if (this.currentScope == "") {
          this.uploadData = {
            remain: this.remainInp,
            group_name: this.groupNameInp
          };
        } else {
          this.uploadData = {
            remain: this.remainInp,
            group_name: this.groupNameInp,
            id: this.currentScope.row.id
          };
        }
        this.$nextTick(() => {
          this.$refs.upload.submit();
        });
      } else {
        if (this.currentScope != "") {
          let data = {
            group_name: this.groupNameInp,
            remain: this.remainInp,
            id: this.currentScope.row.id
          };
          this.$utils.axiosRequest(
            "POST",
            `/group/qrcode/store`,
            "",
            data,
            res => {
              this.showConfigDialog = false;
              this.getList();
            },
            res => {}
          );
        }
      }
      // console.log(this.fileList);
    },
    getList: function() {
      let data = {
        page: this.currentPage
      };
      this.$utils.axiosRequest(
        "GET",
        `/group/qrcode/list`,
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

<style lang="stylus" scoped></style>


