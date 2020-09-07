<template>
  <div class="chatbot-container">
    <loading :active="loading" :message="loading_msg" />
      <div>
        <div class="section" id="section1">
          <h1>Evaluación de entrada</h1>
        </div>
          <Question/>
      </div>
  </div>
</template>

<script>
import Question from "@/components/Questions/Question";
import loading from "@/components/loading";
//import { getParam } from "@/services/router.js";

// TODO getCourseIdByChatbot + getChatbotNameOrder = getChatbotByStudent | getChatbotByTeacher
//import { getMaterials } from "@/services/materialService";
//import { createEvaluation } from "@/services/preEvaluationService";
import { mapState } from "vuex";

export default {
  data: () => ({
    loading: false,
    loading_msg: "",
  }),
  computed: {
    ...mapState(["user"])
  },
  async mounted() {
    this.$store.commit("setComponentMaterials", this.$refs.component_materials);
  },
  components: {
    Question,
    loading
  }
};
</script>

<style lang='scss'>
@import "@/styles/box-shadow.scss";

.chatbot-container {
  height: calc(100vh - 65px);
  .chatbot-content {
    position: relative;
    border-right: 1px solid #eee;
  }
}

@media only screen and (max-width: 955px) {
  .chatbot-container {
    height: calc(100vh - 57px);
    margin: 0;
    .chatbot-scroll {
      flex-wrap: nowrap;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      &::-webkit-scrollbar {
        display: none;
      }
      .chat-container {
        scroll-snap-align: start;
      }
      .chatbot-content {
        scroll-snap-align: start;
      }
    }
  }
}

#section1 {
min-height: 20%; 
text-align:center
}
</style>
