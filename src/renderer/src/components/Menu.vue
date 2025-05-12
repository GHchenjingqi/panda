<template>
    <div class="menus">
        <ul class="tu">
            <template v-for="(item,index) in menus" :key="index">
                <li v-if="item.isMenu" :class="{ active: isActive(item.path) }">
                    <router-link :to="item.path">
                        <img :src="getImageUrl(item.icon,item.path)" alt="">
                        <p>{{item.name}}</p>
                    </router-link>
                </li>
            </template>
        </ul>
        <div class="set">
            <router-link to="/set">
                <img  src="@/assets/images/set.png" alt="">
            </router-link>
        </div>
    </div>
  </template>
  <script setup>
    import { reactive ,ref} from 'vue'
    import { useRoute } from 'vue-router';
    import { routes } from '@/router'

    import homeIcon from '@/assets/images/home.png';
    import bizhiIcon from '@/assets/images/bizhi.png';
    import homeIconAct from '@/assets/images/home_s.png';
    import bizhiIconAct from '@/assets/images/bizhi_s.png';
    import zhishiIcon from '@/assets/images/zhishi.png';
    import zhishiIconAct from '@/assets/images/zhishi_s.png';

    const route = useRoute();
    const isActive = (path) => {
        return route.path === path;
    }
    const menus = reactive(routes)
    const imageMap = {
        home: homeIcon,
        homes: homeIconAct,
        bizhi: bizhiIcon,
        bizhis: bizhiIconAct,
        zhishi:zhishiIcon,
        zhishis:zhishiIconAct
    };
    const getImageUrl = (icon,path) => {
        if(route.path === path){
            let res = icon + 's';
            return imageMap[res] || '';
        }
        return imageMap[icon] || '';
    };
  </script>
  <style scoped>
      .menus{
        width: 120px;
        height: calc(100vh - 80px);
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .menus ul{
        width: 80px;
        padding: 1rem 0;
        box-sizing: border-box;
        border-radius: var(--radius);
        text-align: center;
        height: auto;
      }
      .set{
        margin-top: 2rem;
      }
      .menus ul li{
        padding: 1.5rem 0;
      }
      .menus ul li a img{
        width: 32px;
      }
      .menus a p{
        margin: 0;
        padding: 0;
      }
      .menus a {
        color: var(--textColor);
        text-decoration: none;
        font-size: 12px;
      }
      .menus ul li.active a p{
        color: var(--mc);
      }
  </style>