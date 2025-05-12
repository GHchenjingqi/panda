import { createWebHashHistory, createRouter } from 'vue-router'

import HomeView from '../views/Home.vue'
import WrapperView from '../views/Wrapper.vue'
import SetView from '../views/Set.vue'
import KnowView from '../views/Know.vue'
import MdView from '../views/Md.vue'
import NewMd from '../views/NewMd.vue'
export const routes = [
  { path: '/', component: HomeView ,icon: 'home' ,name:'首页',isMenu:true},
  { path: '/wrapper', component: WrapperView ,icon: 'bizhi',name:'壁纸',isMenu:true},
  { path: '/zhishi', component: KnowView ,icon: 'zhishi',name:'知识库',isMenu:true},
  { path: '/set', component: SetView ,isMenu:false},
  { path: '/md', component: MdView ,isMenu:false},
  { path: '/nmd', component: NewMd ,isMenu:false},
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router