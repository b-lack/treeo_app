<template>
  <div>
    <a @click="selectLang('en')">{{$t('languageSelection.english')}}</a> / <a @click="selectLang('ms')">{{$t('languageSelection.bahasa')}}</a>
  </div>
</template>

<script>
import LocalstorageService from '../service/localstorageService'

export default {
  methods: {
    saveLanguage (value) {
      LocalstorageService.set('defaultLanguage', value)
    },
    selectLang (lang) {
      this.saveLanguage(lang)
      this.$i18n.locale = lang
    }
  }
}
</script>

<style>

</style>
