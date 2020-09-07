<template>
  <div class="chatbot-container">
    <loading :active="loading" :message="loading_msg" />
    <v-row id="chatbot-scroll" class="chatbot-scroll fill-height" no-gutters>
      <div class="chatbot-content col-12 col-md-8 m-fullscreen">
        <Materials class="m-fullscreen-content" ref="component_materials" :chatbot="chatbot" />
        
      </div>
      <Chat class="chat-container col-12 col-md-4" :bot="bot" :knowledge="knowledge" />
    </v-row>
  </div>
</template>

<script>
import Chat from "@/components/Chatbot/Chat/index";
import Materials from "@/components/Chatbot/Materials/index";
import loading from "@/components/loading";

import { getParam } from "@/services/router.js";
import Chatbot from "@/services/chatbot";

// TODO getCourseIdByChatbot + getChatbotNameOrder = getChatbotByStudent | getChatbotByTeacher
import {
  getCourseIdByChatbot,
  getCourseByTeacher,
  getCourseByStudent
} from "@/services/courseService";
import { getMaterials } from "@/services/materialService";
import { getQuestionTemplate } from "@/services/chatService";
import { getChatbotNameOrder } from "@/services/chatbotService";

import { mapState } from "vuex";

export default {
  data: () => ({
    chatbot: {},
    // CHAT
    bot: null,
    knowledge: [],
    //
    loading: true,
    loading_msg: ""
  }),
  computed: {
    ...mapState(["user"])
  },
  async created() {
    let chatbot_id = getParam("chatbot_id");
    let material_id = getParam("review_id");
    // Materials
    this.loading_msg = "Cargando Material";
  
    this.chatbot = await getChatbotNameOrder(chatbot_id);
    let order = (this.chatbot.order || []).reverse();
    
    let all_materials = await this.getMaterialsAsync(chatbot_id)

    let individual_material = []
    let lastId = ""
    material_id.forEach(element => {
      for (var mat in all_materials){
          let id = all_materials[mat]._id.$oid
          if (id != lastId){
            if(id == element){
            individual_material.push(all_materials[mat])
            lastId = id
            }
          }
      }
    })
    
    individual_material.sort(
      (a, b) => order.indexOf(b._id.$oid) - order.indexOf(a._id.$oid)
    );
    this.$store.commit("setMaterials", individual_material);

    // Knowledge
    this.loading_msg = "Cargando Conocimiento";

    let course_id = await getCourseIdByChatbot(chatbot_id);
    let course = await (this.$store.state.user.role === "TEA"
      ? getCourseByTeacher(course_id)
      : getCourseByStudent(course_id));
    let knowledge = course.knowledge || [];

    // Knowledge Material
    let question_template = await getQuestionTemplate();
    individual_material.forEach(material => {
      Object.entries(question_template).forEach(([category, questions]) => {
        if (questions[0]) {
          questions = questions.map(question =>
            question.replace(/@/, material.name)
          );
          knowledge.push({
            questions,
            answers: [
              "Esto te puede servir.",
              "He encontrado esta información."
            ],
            material_id: material._id.$oid,
            category
          });
        }
      });
      material.faq.forEach(({ question, answer }) => {
        knowledge.push({
          questions: [question],
          answers: [answer],
          material_id: material._id.$oid
        });
      });
    });
    this.knowledge = knowledge;

    // Chatbot
    let bot = new Chatbot();
    let entities = {
      usuario: {
        nombre: this.user.first_name.split(/\s+/g)[0]
      }
    };

    bot.train(knowledge, entities);
    this.bot = bot;

    this.loading = false;
  },
  mounted() {
    this.$store.commit("setComponentMaterials", this.$refs.component_materials);
  },
  components: {
    Chat,
    Materials,
    loading
  },
  methods:{
    async getMaterialsAsync(chatbot_id){
      return await getMaterials(chatbot_id);
    }
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
</style>
