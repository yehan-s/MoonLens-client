<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>个人中心</h1>
      <p class="page-description">管理您的个人信息和账户设置</p>
    </div>
    
    <UserProfile />
  </div>
</template>

<script setup lang="ts">
import UserProfile from '../components/user/UserProfile.vue'
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
  
  .page-header {
    background: white;
    padding: 20px 30px;
    border-bottom: 1px solid #e4e7ed;
    margin-bottom: 20px;
    
    h1 {
      margin: 0 0 5px 0;
      font-size: 24px;
      color: #303133;
    }
    
    .page-description {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }
  }
}
</style>