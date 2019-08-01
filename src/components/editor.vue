<template>
  <div>
    <div ref='editor' style="text-align: left" v-loading='loading'></div>
  </div>
</template>

<script>
import E from 'wangeditor'
import { constants } from 'crypto';

export default {
  name: 'editor',
  data(){
    return{
      // editorContent: '',
      loading: false
    }
  },
  props: ["editorContent"],
  mounted(){
    var editor = new E(this.$refs.editor)
    editor.customConfig.onchange = (html) => {
      this.editorContent = html
    }
    editor.customConfig.uploadImgServer = this.$global.hostUrl + '/upload'
    editor.customConfig.customUploadImg = (files, insert)=> {
      this.loading = true
      for(let i of files){
        let formData = new FormData();
        formData.append('file',i)
        formData.append('path','gift/image')
        this.$utils.axiosRequest('POST', `/upload`, '', formData, res=>{
          insert(res.data.url)
        },err=>{})
      }
      this.loading = false
      //   // 上传代码返回结果之后，将图片插入到编辑器中
      //   insert(imgUrl)
    }
    // editor.customConfig.uploadImgHooks = {
    //   before: function (xhr, editor, files) {
        
    //    },
    //   customInsert: function (insertImg, result, editor) {
    //     console.log(result)
    //   }
    // }
    editor.create()
    if(editorContent){
      editor.text.html(editorContent)
    }
  }
}
</script>
