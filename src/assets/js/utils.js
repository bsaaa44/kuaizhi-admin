import Vue from 'vue'
import router from "../../router";
function axiosRequest(method, url, params, data, success, fail) {
  Vue.prototype
    .$ajax({
      method: method,
      url: url,
      header: { 'Access-Control-Allow-Origin': '*' },
      dataType: 'jsonp',
      data,
      params
    })
    .then(res => {
      if (res.data.errno === 0) {
        success(res)
      }else{
        Vue.prototype.$message.error(res.data.errmsg)
        fail(res)
      }
    })
    .catch(res => {
      console.log(res)
      if (res.response.status == 401) {
        Vue.prototype.$message.error(res.response.data.errmsg)
        router.push('/')
        return 
      }else{
        Vue.prototype.$message.error(res.response.data.errmsg)
      }
      if (typeof fail == 'function') {
        fail(res)
      }
    })
}

export default {
  axiosRequest
}
