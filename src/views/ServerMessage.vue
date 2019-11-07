<template>
  <div class="table-block">
    <el-table :data="dataList" v-loading="tableLoading" :height="maxHeight">
      <el-table-column prop="id" label="消息ID"></el-table-column>
      <el-table-column prop="created_at" label="创建时间"></el-table-column>

      <el-table-column label="最新消息">
        <template slot-scope="scope">
          <el-button type="text" @click="handleShowPop(scope)">{{scope.row.latestMessage}}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="latestMessageTime" label="更新时间"></el-table-column>
      <el-table-column label="是否已读">
        <template slot-scope="scope">{{scope.row.readed == 0?"未读":"已读"}}</template>
      </el-table-column>
      <el-table-column prop="sender.id" label="发送人ID"></el-table-column>
      <el-table-column prop="sender.name" label="发送人名称"></el-table-column>
      <el-table-column label="发送人头像">
        <template slot-scope="scope">
          <img :src="scope.row.sender.avatar" class="table-img" />
        </template>
      </el-table-column>
      <el-table-column label="用户信息">
        <template slot-scope="scope">
          <el-button type="text" @click="showUserInfo(scope)">查看</el-button>
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
      title="用户信息"
      :visible.sync="showInfoDialog"
      class="edit-dialog"
      width="500"
      style="text-align:left;"
    >
      <template v-if="currentScope!=''">
        <p v-for="(item,index) in currentScope.row.ext" :key="index" style="font-size:20px">{{item}}</p>
      </template>
    </el-dialog>
    <el-dialog
      title="聊天窗"
      :visible.sync="showDialog"
      class="edit-dialog"
      width="500"
      @close="stopChat()"
    >
      <div class="chat-content" ref="chatContent">
        <template v-for="(item,index) in messageList">
          <div class="chat-item" :key="index" v-if="item.is_sys==0">
            <span class="name">{{item.sender_id==sender.id?sender.name:receiver.name}}：</span>
            <span v-if="item.content_type == 1">{{item.content}}</span>
            <div v-if="item.content_type==2">
              <img
                :src="item.content"
                class="chat-img"
                @click="showPreview = true;previewImage=item.content"
              />
            </div>
          </div>
        </template>
      </div>
      <div class="chat-input">
        <el-input v-model="chatInp" @keyup.enter.native="send(1)" />
        <el-upload
          :show-file-list="false"
          :action="$global.hostUrl+'/upload'"
          :on-success="handleUploadSuccess"
        >
          <i class="el-icon-picture-outline icon"></i>
        </el-upload>
      </div>
    </el-dialog>
    <el-dialog title="聊天窗" :visible.sync="showPreview" width="300">
      <img :src="previewImage" class="preview-img" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      int: "",
      currentPage: 1,
      currentScope: "",
      showDialog: false,
      showPreview: false,
      tableLoading: false,
      showUserInfoDialog: false,
      maxHeight: 0,
      paginate: "",
      dataList: [],
      messageList: [],
      receiver: {},
      sender: {},
      chatInp: "",
      token: "",
      source: "",
      uploadImg: "",
      previewImage: "",
      showInfoDialog: false
    };
  },
  created() {
    this.handleGetList();
    this.maxHeight = window.innerHeight - 210;
  },
  methods: {
    showUserInfo: function(scope) {
      this.currentScope = scope;
      this.showInfoDialog = true;
    },
    handleUploadSuccess: function(res, file) {
      this.uploadImg = file.response.url;
      this.$confirm("是否发送此图片", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.send(2);
        })
        .catch();
    },
    handleSendImage: function() {},
    setRead: function(id) {
      return new Promise((resolve, reject) => {
        let data = {
          chat_id: id
        };
        this.$utils.axiosRequest(
          "POST",
          `/chat/readed`,
          "",
          data,
          res => {
            resolve();
          },
          res => {}
        );
      });
    },
    stopChat: function() {
      if (this.source) {
        this.source.cancel();
      }
    },
    send: function(type) {
      let data = {
        chat_id: this.currentScope.row.id,
        message: type == 1 ? this.chatInp : this.uploadImg,
        message_type: type
      };
      this.$utils.axiosRequest(
        "POST",
        `/chat/message`,
        "",
        data,
        res => {
          this.messageList.push({
            chat_id: this.currentScope.row.id,
            content: type == 1 ? this.chatInp : this.uploadImg,
            content_type: type,
            sender_id: this.receiver.id,
            receiver_id: this.sender.id,
            is_sys: 0
          });
          this.chatInp = "";
          this.uploadImg = "";
          this.$nextTick(() => {
            this.$refs.chatContent.scrollTop = this.$refs.chatContent.scrollHeight;
          });
        },
        res => {}
      );
    },
    handleShowPop: function(scope) {
      this.currentScope = scope;
      this.$nextTick(() => {
        this.handleGetChat();
      });
      this.showDialog = true;
    },
    handleGetChat: function() {
      let data = {
        chat_id: this.currentScope.row.id
      };
      this.$utils.axiosRequest(
        "GET",
        `/chat/all-messages`,
        data,
        "",
        res => {
          this.checkNewMessage();
          this.messageList = res.data.list;
          this.token = res.data.message_token;
          this.receiver = res.data.receiver;
          this.sender = res.data.sender;
          this.$nextTick(() => {
            this.$refs.chatContent.scrollTop = this.$refs.chatContent.scrollHeight;
          });
        },
        res => {}
      );
    },
    checkNewMessage: function() {
      let CancelToken = this.$ajax.CancelToken;
      this.source = CancelToken.source();
      this.$nextTick(() => {
        let data = {
          chat_session_id: this.currentScope.row.id,
          product: "feedBot",
          token: this.token
        };
        this.$ajax({
          method: "get",
          url: `https://message.sync163.com/check`,
          params: data,
          cancelToken: this.source.token
        })
          .then(res => {
            if (res.data && res.data != "") {
              this.setRead(this.currentScope.row.id).then(() => {
                this.checkNewMessage();
              });
              for (let i in res.data) {
                res.data[i] = JSON.parse(res.data[i]);
                // console.log(res.data[i])
                this.messageList.push(res.data[i]);
                this.$nextTick(() => {
                  this.$refs.chatContent.scrollTop = this.$refs.chatContent.scrollHeight;
                });
              }
            } else {
              this.checkNewMessage();
            }
          })
          .catch(() => {});
      });
    },
    bindPageChange: function(val) {
      this.currentPage = val;
      this.handleGetList();
    },
    handleGetList: function() {
      let data = {
        page: this.currentPage
      };
      this.tableLoading = true;
      this.$utils.axiosRequest(
        "GET",
        `/chat/list`,
        data,
        "",
        res => {
          for (let i of res.data.list) {
            i.ext = JSON.parse(i.ext);
            let array = [];
            for (let j in i.ext) {
              let obj = {};
              obj[j] = i.ext[j];
              array.push(obj);
            }
            i.ext = array;
          }
          this.dataList = res.data.list;
          this.paginate = res.data.paginate;
          this.$nextTick(() => {
            this.tableLoading = false;
          });
        },
        res => {}
      );
    }
  }
};
</script>

<style lang="stylus" scoped>
.preview-img {
  width: 100%;
}

.chat-input {
  margin-top: 20px;
  display: flex;
  flex-flow: row;
  align-items: center;

  el-input {
    flex-grow: 1;
  }

  .icon {
    font-size: 24px !important;
    margin-left: 10px;
  }
}

.chat-img {
  width: 100px;
}

.chat-content {
  height: 500px;
  overflow-y: scroll;
}

.chat-item {
  .name {
    color: #0074FF;
  }

  margin-top: 10px;
}

.chat-content {
  text-align: left;
}

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