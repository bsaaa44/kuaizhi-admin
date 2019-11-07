import Vue from 'vue'
import Router from 'vue-router'
import LoginView from './views/LoginView.vue'
import HomeView from './views/HomeView.vue'
import RobotsManageView from './views/RobotsManageView.vue'
import CategoryManageView from './views/CategoryManageView.vue'
import RobotsCheckView from './views/RobotsCheckView.vue'
import TopicManageView from './views/TopicManageView.vue'
import TopicCategoryManageView from './views/TopicCategoryManageView.vue'
import DataManageView from './views/DataManageView.vue'
import TabManageView from './views/TabManageView.vue'
import BannerManageView from './views/BannerManageView.vue'
import HotManageView from './views/HotManageView.vue'
import GuidCategoryManageView from './views/GuidCategoryManageView.vue'
import IndexThemeManageView from './views/IndexThemeManageView.vue'
import UserManageView from './views/UserManageView.vue'
import KeywordManageView from './views/KeywordManageView.vue'
import GzhManageView from './views/GzhManageView.vue'
import QrcodeManageView from './views/QrcodeManageView.vue'
import OriginalCardManage from './views/OriginalCardManage.vue'
import OriginalRobotManage from './views/OriginalRobotManage.vue'
import BotsMonitor from './views/BotsMonitor.vue'
import TopicsMonitor from './views/TopicsMonitor.vue'
import MediaMonitor from './views/MediaMonitor.vue'
import CardMonitorView from './views/CardMonitorView.vue'
import PictureMonitor from './views/PictureMonitor.vue'
import LabelManageView from './views/LabelManageView.vue'
import WaitDeleteView from './views/WaitDeleteView.vue'
import ThemeBannerManageView from './views/ThemeBannerMangeView.vue'
import BotSubjectView from './views/BotSubjectView.vue'
import ThemeSubjectView from './views/ThemeSubjectView.vue'
import CommentManageView from './views/CommentManageView.vue'
import ServerMessage from './views/ServerMessage.vue'
import SensitiveManage from './views/SensitiveManage.vue'
import SensitiveCheckManage from './views/SensitiveCheckManage.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  // base: process.env.BASE_URL,
  // base: '/admin-web',
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      children: [
        {
          name: 'robotsManageView',
          path: 'robotsManageView',
          component: RobotsManageView
        },
        {
          name: 'categoryManageView',
          path: 'categoryManageView',
          component: CategoryManageView
        },
        {
          name: 'robotsCheckView',
          path: 'robotsCheckView',
          component: RobotsCheckView
        },
        {
          name: 'topicManageView',
          path: 'topicManageView',
          component: TopicManageView
        },
        {
          name: 'topicCategoryManageView',
          path: 'topicCategoryManageView',
          component: TopicCategoryManageView
        },
        {
          name: 'dataManageView',
          path: 'dataManageView',
          component: DataManageView
        },
        {
          name: 'tabManageView',
          path: 'tabManageView',
          component: TabManageView
        },
        {
          name: 'bannerManageView',
          path: 'bannerManageView',
          component: BannerManageView
        },
        {
          name: 'hotManageView',
          path: 'hotManageView',
          component: HotManageView
        },
        {
          name: 'guidCategoryManageView',
          path: 'guidCategoryManageView',
          component: GuidCategoryManageView
        },
        {
          name: 'indexThemeManageView',
          path: 'indexThemeManageView',
          component: IndexThemeManageView
        },
        {
          name: 'userManageView',
          path: 'userManageView',
          component: UserManageView
        },
        {
          name: 'keywordManageView',
          path: 'keywordManageView',
          component: KeywordManageView
        },
        {
          name: 'gzhManageView',
          path: 'gzhManageView',
          component: GzhManageView
        },
        {
          name: 'qrcodeManageView',
          path: 'qrcodeManageView',
          component: QrcodeManageView
        },
        {
          name: 'originalCardManage',
          path: 'originalCardManage',
          component: OriginalCardManage
        },
        {
          name: 'originalRobotManage',
          path: 'originalRobotManage',
          component: OriginalRobotManage
        },
        {
          name: 'botsMonitor',
          path: 'botsMonitor',
          component: BotsMonitor
        },
        {
          name: 'topicsMonitor',
          path: 'topicsMonitor',
          component: TopicsMonitor
        },
        {
          name: 'mediaMonitor',
          path: 'mediaMonitor',
          component: MediaMonitor
        },
        {
          name: 'cardMonitorView',
          path: 'cardMonitorView',
          component: CardMonitorView
        },
        {
          name: 'pictureMonitor',
          path: 'pictureMonitor',
          component: PictureMonitor
        },
        {
          name: 'labelManageView',
          path: 'labelManageView',
          component: LabelManageView
        },
        {
          name: 'waitDeleteView',
          path: 'waitDeleteView',
          component: WaitDeleteView
        },
        {
          name: 'themeBannerManageView',
          path: 'themeBannerManageView',
          component: ThemeBannerManageView
        },
        {
          name: 'botSubjectView',
          path: 'botSubjectView',
          component: BotSubjectView
        },
        {
          name: 'themeSubjectView',
          path: 'themeSubjectView',
          component: ThemeSubjectView
        },
        {
          name: 'commentManageView',
          path: 'commentManageView',
          component: CommentManageView
        },
        {
          name: 'serverMessage',
          path: 'serverMessage',
          component: ServerMessage
        },
        {
          name: 'sensitiveManage',
          path: 'sensitiveManage',
          component: SensitiveManage
        },
        {
          name: 'sensitiveCheckManage',
          path: 'sensitiveCheckManage',
          component: SensitiveCheckManage
        }
      ]
    }
  ]
})
