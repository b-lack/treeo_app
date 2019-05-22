<template>
  <v-container class="of-has-bottom-nav of-form-wrapper">
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-dialog
        ref="dialog"
        :return-value.sync="formContent.planting_date"
        lazy
        full-width
        width="290px"
      >
        <v-text-field
          slot="activator"
          v-model="formContent.planting_date"
          :label="$t('page.plot.labels.plantingDate')"
          prepend-icon="event"
          readonly
        ></v-text-field>
        <v-date-picker v-model="formContent.planting_date"  type="month" scrollable>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="$refs.dialog.save(formContent.planting_date)">{{$t('dialog.datePicker.agree')}}</v-btn>
        </v-date-picker>
      </v-dialog>

      <LookUp v-model="$v.formContent.species_id.$model" endpoint="species/all" :label="$t('page.plot.labels.species')"/>
    </v-form>
    <BottomNav v-bind:form="$v" :invalid="$v.$invalid" v-bind:loading="loading" @send="submit" @clear="clear"/>
  </v-container>
</template>

<script>
import BottomNav from '../components/BottomNav'
import LookUp from '../components/LookUp'

import router from '../router'
import PouchDbService from '../service/pouchDbService'
import AuthService from '../service/authService'
import HelperService from '../service/helperService'

import { validationMixin } from 'vuelidate'
import { required, minLength } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],
  components: {
    BottomNav,
    LookUp
  },
  validations: {
    formContent: {
      farmer_id: {
        required
      },
      species_id: {
        required
      }
    }
  },
  computed: {
    nameErrors () {
      const errors = []
      if (!this.$v.formContent.name.$dirty) return errors
      !this.$v.formContent.name.required && errors.push(this.$t('form.error-msg.required'))
      !this.$v.formContent.name.minLength && errors.push(this.$t('form.error-msg.minLength'))
      return errors
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
    profile: {},
    dateModal: false,
    maxDate: null,
    formContent: {
      feature: {},
      farmer_id: '',
      project_id: '',
      species_id: '',
      name: '',
      planting_date: ''
    },
    nameRules: [
      v => !!v || 'Name is required'
    ]
  }),
  activated: function () {
    this.clear()
    this.maxDate = new Date().toISOString()
    this.database = new PouchDbService(this.db)

    this.profile = AuthService.getProfile()

    if (this.id) {
      this.clear()
      this.autofill(this.id)
    } else {
      this.formContent.farmer_id = this.profile.id
      this.formContent.project_id = this.profile.project_id
    }
    if (this.parentId) {
      this.formContent.parentId = this.parentId
    }
    // this.$ol.showMap(250);
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
    submitForm (formData) {
      const that = this
      let isId

      this.database.post(formData).then(function (response) {
        isId = that.id ? null : response.id
        that.clear()
        return HelperService.createSurveyStart(isId)
      }).then((result) => {
        router.push({ path: '/plot/' + isId + '/survey/' + result.id + '/tree/add' })
      }).then(function () {
        that.loading = false
      })
    },
    submit () {
      const that = this
      let response

      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.loading = true

        let sendData = {
          created_at: new Date().toISOString(),
          species_id: this.formContent.species_id,
          farmer_id: this.formContent.farmer_id
        }
        if (this.formContent.planting_date) {
          sendData.planting_date = HelperService.dateToMonth(new Date(this.formContent.planting_date))
        }

        that.submitForm(sendData)
      }
    },
    clear () {
      this.formContent.planting_date = ''
      this.formContent.species_id = ''
      this.$refs.form.reset()
    }
  }
}
</script>

<style>
  .of-has-bottom-nav{
    margin-bottom: 48px;
  }
</style>
