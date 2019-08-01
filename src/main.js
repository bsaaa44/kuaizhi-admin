import Vue from "vue";
import App from "./App.vue";
import ElementUI from 'element-ui';
import axios from 'axios'
import 'element-ui/lib/theme-chalk/index.css';
import router from "./router";
import utils from './assets/js/utils.js'
import global from './components/Global.vue'
import echarts from 'echarts'
import Video from 'video.js'
import 'videojs-contrib-hls'
import 'video.js/dist/video-js.css'
import './assets/css/reset.css'
import './assets/css/global.css'

Vue.use(ElementUI)
Vue.config.productionTip = false;
axios.defaults.baseURL = global.hostUrl

Vue.prototype.$utils = utils
Vue.prototype.$ajax = axios
Vue.prototype.$global = global
Vue.prototype.$echarts = echarts
Vue.prototype.$video = Video
new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
