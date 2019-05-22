<template>
    <v-card>

       <v-card-title primary-title>

       </v-card-title>
       <v-card-actions>
         <v-spacer></v-spacer>
         <v-btn color="primary" :to="{path: '/plot/' + $route.params.id + '/survey/' + $route.params.surveyId + '/tree'}">Trees</v-btn>
         <v-spacer></v-spacer>
        </v-card-actions>
     </v-card>
</template>

<script>
import router from '../router'

export default {
  data () {
    return {

    }
  },
  created: function () {
  },
  methods: {
  }
}
</script>
