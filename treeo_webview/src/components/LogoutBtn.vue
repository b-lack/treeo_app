<template>
  <v-layout row justify-center>
    <v-btn outline color="error" @click="dialog = true">{{ $t("authentication.button.logout") }}</v-btn>
    <v-dialog
        v-model="dialog"
        max-width="290"
      >
        <v-card>
          <v-card-title class="headline primary white--text" primary-title>{{ $t("dialog.logout.title") }}</v-card-title>
          <v-card-text>
            {{ $t("dialog.logout.text") }}
          </v-card-text>
          <v-card-actions>
            <v-btn
              flat
              @click="dialog = false"

            >
              {{ $t("dialog.logout.disagree") }}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              @click="logout"
            >
              {{ $t("dialog.logout.agree") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  </v-layout>
</template>

<script>

import AuthService from '../service/authService'
import router from '../router'

export default {
  data () {
    return {
      dialog: false
    }
  },
  methods: {

    logout () {
      AuthService.logout('authenticated')
      this.dialog = false
      router.push({ path: 'login' })
    }
  }
}
</script>
