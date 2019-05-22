<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center fill-height>
      <div>
        <UserProfile />
        <LogoutBtn class="mt-5"/>
      </div>
    </v-layout>
  </v-container>
</template>

<script>
import UserProfile from '../components/UserProfile'
import LogoutBtn from '../components/LogoutBtn'

export default {
  components: {
    LogoutBtn,
    UserProfile
  }
}
</script>
