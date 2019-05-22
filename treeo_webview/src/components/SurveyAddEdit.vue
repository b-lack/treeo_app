<template>
  <v-container class="of-has-bottom-nav">
    <v-form ref="form" v-model="valid" lazy-validation>
      <!--<v-text-field
        v-model.trim="$v.formContent.name.$model"
        label="Plot Name"
        :error-messages="nameErrors"
        required
      ></v-text-field>-->
      <!--<GeoPoint v-model="$v.formContent.feature.$model" v-bind:entryId="id" type="Polygon" />-->
      <v-textarea
        name="note"
        label="Note"
        v-model.trim="$v.formContent.note.$model"
      ></v-textarea>

    </v-form>
    <BottomNav v-bind:form="$v" v-bind:loading="loading" @send="submit" @clear="clear"/>

  </v-container>
</template>

<script>
import BottomNav from '../components/BottomNav'

import router from '../router'
import PouchDbService from '../service/pouchDbService'
import AuthService from '../service/authService'

import { validationMixin } from 'vuelidate'
import { required, minLength } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],
  components: {
    BottomNav
  },
  validations: {
    formContent: {
      note: {
        required
      }
    }
  },
  props: [
    'db',
    'parentId',
    'id'
  ],
  data: () => ({
    database: null,
    valid: false,
    loading: false,
    formContent: {
      note: ''
    }
  }),
  activated: function () {
    this.database = new PouchDbService(this.db)

    if (this.id) {
      this.clear()

      this.autofill(this.id)
    }
    if (this.parentId) {
      this.formContent.parentId = this.parentId
    }
  },
  deactivated: function () {
    this.clear()
  },
  methods: {
    autofill (id) {
      const that = this
      this.database.get(id).then(function (response) {
        that.formContent = response
      })
    },
    startAndSubmit () {
      this.formContent.start = Date.now()
      this.submit()
    },
    submit () {
      const that = this
      let response

      this.$v.$touch()
      if (!this.$v.$invalid) {
        that.loading = true

        if (!this.formContent._id) {
          this.formContent.created_at = Date.now()
        } else {
          this.formContent.updated_at = Date.now()
        }
        this.formContent.userId = AuthService.getUserId()

        response = this.database.post(this.formContent)
        response.then(function (response) {
          let isId = that.id ? null : response.id
          that.clear()
          router.push({ path: that.$Helper.routeChild(that.$route, response.id) })
        }).then(function () {
          that.loading = false
        })
      }
    },
    clear () {
      this.$refs.form.reset()
      this.formContent.feature = {}
    }
  }
}

</script>

<style>
  .of-has-bottom-nav{
    margin-bottom: 48px;
  }
</style>
