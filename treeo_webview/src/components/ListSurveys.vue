<template>
  <div>
    <div>
      <v-card
      v-for="row in rowsData"
      :key="row._id"
      @click="$router.push({ path: '/plot/' + row.parentId + '/survey/' + row._id + '/tree' });"
      :dark="$store.state.ongoingSurveys.indexOf(row._id) !== -1"
      class="mx-3 my-1"
      :class="{'white--text': $store.state.ongoingSurveys.indexOf(row._id) !== -1}"
      >
        <v-card-title primary-title>
          <div>
            <v-flex>
                <div class="headline">Survey {{ row.id || 'new'}}</div>
            </v-flex>
            <div class="mb-2">
              <span class="grey--text">{{$t('page.survey.labels.startDate')}}</span><br>
              <span>{{ row.date_start | moment("YYYY-MM-DD") }}</span>
            </div>
            <div>
              <span class="grey--text">{{$t('page.survey.labels.endDate')}}</span><br>
              <span v-if="row.date_end">{{ row.date_end | moment("YYYY-MM-DD") }}</span>
              <span v-if="$store.state.ongoingSurveys.indexOf(row._id) !== -1">
                <v-progress-circular
                  indeterminate
                  color="white"
                  :size="16"
                  :width="1"
                  left
                  class="mr-3"
                ></v-progress-circular>
                {{$t('label.ongoing')}}
              </span>
            </div>
          </div>
        </v-card-title>
        <v-divider></v-divider>
        <div class="pl-2 ma-1 grey--text">
          {{$t('label.created')}}: {{ row.created_at | moment("YYYY-MM-DD, h:mm:ss a") }}
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'rowsData'
  ]
}
</script>
