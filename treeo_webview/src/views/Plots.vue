<template>
  <div class="of-has-footer">
    <div class="headline mx-3 mt-3">
      {{$t('page.plotSelect.title')}}
    </div>
    <List db="plots" :showAction="true"/>
  </div>
</template>

<script>
import List from '../components/List'

export default {
  components: {
    List
  }
}
</script>
