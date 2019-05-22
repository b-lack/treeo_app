<template>

  <div>
    <v-card
    v-for="row in rowsData"
    :key="row._id"
    @click.native="$Helper.routeChild($route, row._id)"
    class="mb-3"
    >
      <v-img
        :src="row.local_image"
        v-if="row.local_image"
      ></v-img>
      <div class="grey--text pa-2 ml-2">{{ row.timestamp | moment("YYYY-MM-DD, h:mm:ss a") }}</div>
      <v-card-title primary-title>

          <v-flex xs6>
            <div color="secondary">
              <span class="grey--text"><v-icon>space_bar</v-icon> {{ $t('label.diameter')}}</span>
              <div class="headline">{{ row.dbh_cm }} cm</div>
            </div>
          </v-flex>
          <v-flex xs6>
            <div color="secondary">
              <span class="grey--text"><v-icon size="16">nature</v-icon> {{$t('page.plot.labels.species')}}</span>
              <div class="headline"><LookUpValue :id="row.species_id" endpoint="species/all"/></div>
            </div>
          </v-flex>
      </v-card-title>
    </v-card>
  </div>
</template>

<script>
import LookUpValue from '../components/LookUpValue'

export default {
  props: [
    'rowsData'
  ],
  components: {
    LookUpValue
  },
  data () {
    return {
      basePath: window.config.base + window.config.squareMedia
    }
  },
}

</script>
