<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4 >
        <p class="text-xs-center">
          Logo
        </p>
        <v-form>

          <v-text-field prepend-icon="person" name="login" v-bind:label="$t('auth.placeholder.username')" type="text"></v-text-field>

          <v-text-field prepend-icon="lock" name="password" v-bind:label="$t('auth.placeholder.password')" id="password" type="password"></v-text-field>

          <v-layout align-center justify-center>
            <v-spacer></v-spacer>
            <v-btn color="primary" right>{{ $t("auth.button.login") }}</v-btn>
          </v-layout>

        </v-form>

        <router-link to="auth/register">{{ $t("auth.link.registration") }}</router-link><br/>
        <router-link to="auth/register">{{ $t("auth.link.forgot_password") }}</router-link>

        <p class="text-xs-center">
          <LangSelection />
        </p>

      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import LangSelection from '../components/LangSelection'

export default {
  data: () => ({
  }),
  components: {
    LangSelection
  }
}
</script>

<style>

</style>
