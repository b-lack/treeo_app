<template>
  <v-layout>
    <v-flex>
      <v-container grid-list-xs fluid>
        <v-layout row wrap>
          <v-flex
            v-for="n in fileList"
            :key="n"
            xs4
          >
            <v-card flat tile>
              <v-img
                :src="n.nativeURL"
                height="150px"
              ></v-img>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
    <div class="of-del-button">
      <v-btn fab color="primary" :disabled="fileList.length==0" @click="deleteAll">
        <v-icon >delete</v-icon>
      </v-btn>
    </div>

  </v-layout>
</template>

<script>
import FileService from '../service/fileService'

const fileService = new FileService()

export default {
  data: () => ({
    fileList: []
  }),
  activated () {
    this.readFiles()
  },
  methods: {
    readFiles () {
      let that = this
      fileService.getAllFiles().then((result) => {
        that.fileList.splice(0, that.fileList.length)
        that.fileList.push(...result)
      })
    },
    deleteFile (url) {
      let that = this
      fileService.deleteFileByUrl(url).then((result) => {
        that.readFiles()
      })
    },
    deleteAll () {
      let that = this
      fileService.deleteAllFiles().then((result) => {
        that.readFiles()
      })
    }
  }
}
</script>

<style>
.of-del-button{
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 10;
}
</style>
