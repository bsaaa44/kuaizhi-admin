<template>
  <div>
    <div class="tools-bar">
      <!-- <el-input
        size="mini"
        class="search-inp"
        v-model="keyword"
        placeholder="输入主题ID/主题名称/机器人ID/机器人名称"
        @change="handleSearch"
      />-->
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
        v-model="typeInp"
        placeholder="类型"
        @change="handleSearch"
        size="mini"
      >
        <el-option label="请选择" value></el-option>
        <el-option label="图片" value="1"></el-option>
        <el-option label="视频" value="2"></el-option>
      </el-select>
      <el-select
        class="status-selector"
        v-model="statusInp"
        placeholder="状态"
        @change="handleSearch"
        size="mini"
      >
        <el-option label="请选择" value></el-option>
        <el-option label="待审核" value="0"></el-option>
        <el-option label="已审核" value="1"></el-option>
        <el-option label="已删除" value="2"></el-option>
      </el-select>
      <el-select
        class="status-selector"
        v-model="botInp"
        placeholder="机器人"
        @change="handleSearch"
        size="mini"
      >
        <el-option label="请选择" value></el-option>
        <el-option
          :label="item.name"
          v-for="(item,index) in botsList"
          :key="index"
          :value="item.id"
        >{{item.name}}</el-option>
      </el-select>
      <!-- <el-button type="primary" size="mini" v-if="!showMultiMode" @click="showMultiMode = true">批量删除</el-button>
      <el-button type="danger" size="mini" v-if="showMultiMode" @click="handleMultiDelete">删除</el-button> -->
      <el-button
        type="success"
        size="mini"
        @click="handleMultiPass"
      >批量通过</el-button>
      <!-- <el-button type="success" size="mini" v-if="showMultiPassMode" @click="handleMultiPass">通过</el-button> -->
      <!-- <el-button
        type="primary"
        size="mini"
        v-if="showMultiPassMode"
        @click="showMultiPassMode = false"
      >取消</el-button> -->
    </div>
    <div>
      <div class="media-block">
      <!-- <el-checkbox-group class="media-block" v-model="checkBoxList" @change="test()"> -->
        <div class="items" v-for="(item,index) in list" :key="index">
          <div class="media-container" @click="handleShowPop(item)">
            <template v-if="item.media.type == 'image'">
              <img :src="item.media.url" />
            </template>
            <template v-else>
              <img class="img-play" src="../assets/img/play.png" />
              <img :src="item.media.cover" />
            </template>
          </div>
          <div class="info">
            <p>{{item.created_at}}</p>
            <p>机器人ID:{{item.bot.id}}</p>
            <p>机器人名:{{item.bot.name}}</p>
            <p>涉及主题：</p>
            <p v-for="(it,idx) in item.topics" :key="idx">{{it.id+"-"+it.name}}</p>
          </div>
          <el-button
            class="del-btn"
            type="danger"
            size="mini"
            @click="handleDelete(item)"
            v-if="!showMultiMode"
          >删除</el-button>
          <!-- <el-checkbox
            :checked="checked"
            :label="item.media|jsonMedia"
            v-if="showMultiMode||showMultiPassMode"
            style="margin-top:10px"
          >选中</el-checkbox> -->
        </div>
      </div>
      <!-- </el-checkbox-group> -->
    </div>
    <div class="pagination">
      <el-pagination
        v-if="paginate!=''"
        :total="paginate.total"
        :page-size="50"
        layout="total,prev,pager,next,jumper"
        @current-change="bindPageChange"
      ></el-pagination>
    </div>
    <el-dialog :visible.sync="showImagePop" class="media-dialog" width="700px">
      <div v-if="currentItem!=''">
        <img :src="currentItem.media.url" />
      </div>
    </el-dialog>
    <el-dialog :visible.sync="showVideoPop" class="media-dialog" width="700px">
      <div v-if="currentItem!=''">
        <video
          id="myPlayer"
          class="video-js vjs-default-skin vjs-big-play-centered"
          :poster="currentItem.media.cover"
          preload="auto"
          ref="myVideo"
        >
          <source :src="currentItem.media.url" type="application/x-mpegURL" />
        </video>
      </div>
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
      statusInp: "",
      typeInp: "",
      paginate: "",
      botInp: "",
      list: [],
      botsList: [],
      checked: false,
      checkBoxList: [],
      tableLoading: false,
      showMediaPop: false,
      showImagePop: false,
      showVideoPop: false,
      currentItem: "",
      player: "",
      showMultiMode: false,
      showMultiPassMode: false
    };
  },
  filters: {
    jsonMedia: function(media) {
      return JSON.stringify(media);
    }
  },
  created() {
    this.handleGetList();
    this.handleGetBotsList();
  },
  methods: {
    test: function(){
      console.log(this.checkBoxList)
    },
    handleGetBotsList: function() {
      this.$utils.axiosRequest(
        "GET",
        `/be-monitored-image-bots/all`,
        "",
        "",
        res => {
          this.botsList = res.data.list;
        },
        res => {}
      );
    },
    bindPageChange: function(val) {
      this.currentPage = val;
      this.handleGetList();
    },
    handleMultiPass: function() {
      let arr = [];
      for (let i of this.list) {
        arr.push(i.media);
      }
      let data = {
        images: JSON.stringify(arr)
      };
      this.$utils.axiosRequest(
        "POST",
        `/image/accept`,
        "",
        data,
        res => {
          this.handleGetList();
          // this.list = [];
          this.checkBoxList = [];
          this.showMultiPassMode = false;
        },
        res => {}
      );
     
    },
    handleMultiDelete: function() {
      if (this.checkBoxList.length == 0) {
        this.checkBoxList = [];
        this.showMultiMode = false;
      } else {
        this.$confirm("是否执行该操作", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            let arr = [];
            for (let i of this.checkBoxList) {
              i = JSON.parse(i);
              arr.push(i);
            }
            let data = {
              images: JSON.stringify(arr)
            };
            this.$utils.axiosRequest(
              "POST",
              `/image/delete`,
              "",
              data,
              res => {
                this.handleGetList();
                this.checkBoxList = [];
                this.showMultiMode = false;
              },
              res => {}
            );
          })
          .catch(() => {});
      }
    },
    handleDelete: function(item) {
      this.$confirm("是否执行该操作", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let data = {
            images: JSON.stringify([item.media])
          };
          this.$utils.axiosRequest(
            "POST",
            `/image/delete`,
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
    handleShowPop: function(item) {
      this.currentItem = item;
      if (item.media.type == "video") {
        this.showVideoPop = true;
        this.$nextTick(() => {
          if (this.player == "") {
            this.initPlayer();
          } else {
            this.player.poster(item.media.cover);
            this.player.src(item.media.url);
          }
        });
      } else {
        this.showImagePop = true;
      }
    },
    initPlayer: function() {
      let self = this;
      // console.log('test',this.$refs.videoBlock)
      let id = `myPlayer`;
      let player = this.$video(
        id,
        {
          width: 600,
          height: 337,
          controls: true
        },
        function() {
          this.on("play", function() {
            // self.$emit("onVideoPlay",{index: self.index})
          });
        }
      );
      this.player = player;
    },
    handleGetList: function() {
      let data = {
        type: this.typeInp,
        page: this.currentPage,
        review: this.statusInp,
        bot_id: this.botInp,
        start_time: this.dataRange != null ? this.dataRange[0] : "",
        end_time: this.dataRange != null ? this.dataRange[1] : ""
      };
      this.$utils.axiosRequest(
        "GET",
        `/image/list`,
        data,
        "",
        res => {
          this.list = res.data.list;
          this.paginate = res.data.paginate;
          this.$nextTick(() => {
            this.checked = true
            // this.initPlayer();
          });
        },
        res => {}
      );
    },
    handleSearch: function() {
      this.currentPage = 1;
      this.checkBoxList = [];
      this.$nextTick(()=>{
        this.handleGetList();
      })
    },
    handleClear: function() {
      this.keyword = "";
      this.checkBoxList = []
      this.currentPage = 1;
      this.dataRange = "";
      this.handleGetList();
    }
  }
};
</script>
<style lang="stylus" scoped>
.media-dialog {
  img {
    width: 100%;
  }
}

.media-block {
  width: 100%;
  display: flex;
  flex-flow: row wrap;

  .items {
    margin: 10px;

    .del-btn {
      width: 100%;
      margin-top: 5px;
    }

    .media-container {
      width: 200px;
      height: 200px;
      overflow: hidden;
      position: relative;

      .img-play {
        width: 50px !important;
        height: 50px !important;
        z-index: 1000;
        position: absolute;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .info {
      text-align: left;
      font-size: 14px;
      margin-top: 10px;
      width: 100%;
      min-height: 90px;

      p {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
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
