<template>
  <div class="chatbot-container">
    <loading :active="loading" :message="loading_msg" />
    <div class="tasks__menu">
        <span class="history__back" @click="redirect()">Cursos</span>
        <span
          class="tasks__menu-option"
          :class="{'active': show_study_content}"
          small
          rounded
          color="success"
          @click="activeStudyContent()"
        >Contenido de estudio</span>
        <span class="mx-2">|</span>
        <span
          class="tasks__menu-option"
          :class="{'active': show_review_content}"
          small
          rounded
          color="success"
          @click="activeReviewContent()"
        >Contenido de repaso</span>
        <span class="mx-2">|</span>
        <span
          class="tasks__menu-option"
          :class="{'active': show_complete_content}"
          small
          rounded
          color="success"
          @click="activeCompleteContent()"
        >Contenido completo</span>
      </div>
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
    loading_msg: "",
    show_study_content: true,
    show_review_content: false,
    show_complete_content: false,
    all_materials: [],
  }),
  computed: {
    ...mapState(["user"])
  },
  async created() {
    let study_content = getParam('material_id')
    let review_content = getParam('review_id')
    let chatbot_id = getParam("chatbot_id");
    this.all_materials = await this.getMaterialsAsync(chatbot_id)
    if(study_content.length == 0 && review_content.length == 0){
      this.activeCompleteContent()
    }else{
      if (study_content.length > 0){
          this.activeStudyContent()
      }else{
        this.activeReviewContent()
      }
    }
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
    },
    async activeStudyContent(){
      this.show_review_content = false
      this.show_study_content = true
      this.show_complete_content = false

      this.loading_msg = "Cargando Material de estudio";

      let chatbot_id = getParam("chatbot_id");
      let material_id = getParam("material_id");

      this.chatbot = await getChatbotNameOrder(chatbot_id);
      let order = (this.chatbot.order || []).reverse();
    
      let individual_material = []
      let lastId = ""
      material_id.forEach(element => {
        for (var mat in this.all_materials){
            let id = this.all_materials[mat]._id.$oid
            if (id != lastId){
              if(id == element){
              individual_material.push(this.all_materials[mat])
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
    async activeReviewContent(){
      this.show_review_content = true
      this.show_study_content = false
      this.show_complete_content = false
      this.loading = true
      this.loading_msg = "Cargando Material de resumen";

      let review_id = getParam("review_id");
      let order = (this.chatbot.order || []).reverse();

      let individual_material = []
      let lastId = ""
      review_id.forEach(element => {
        for (var mat in this.all_materials){
            let id = this.all_materials[mat]._id.$oid
            if (id != lastId){
              if(id == element){
              individual_material.push(this.all_materials[mat])
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
      let chatbot_id = getParam("chatbot_id");

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
    async activeCompleteContent(){
      this.show_review_content = false
      this.show_study_content = false
      this.show_complete_content = true
      this.loading = true
      this.loading_msg = "Cargando Material Completo";

      let chatbot_id = getParam("chatbot_id");

      let order = (this.chatbot.order || []).reverse();
      this.all_materials.sort(
        (a, b) => order.indexOf(b._id.$oid) - order.indexOf(a._id.$oid)
      );
      this.$store.commit("setMaterials", this.all_materials);

      // Knowledge
      this.loading_msg = "Cargando Conocimiento";

      let course_id = await getCourseIdByChatbot(chatbot_id);
      let course = await (this.$store.state.user.role === "TEA"
        ? getCourseByTeacher(course_id)
        : getCourseByStudent(course_id));
      let knowledge = course.knowledge || [];

      // Knowledge Material
      let question_template = await getQuestionTemplate();
      this.all_materials.forEach(material => {
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
  }
};
</script>

<style lang='scss'>
@import "@/styles/box-shadow.scss";

.tasks__menu {
  margin-bottom: 12px;
  font-size: 1.1rem;
  //
  display: flex;
  justify-content: center;
  .tasks__menu-option {
    color: #ccc;
    transition: all 0.3s;
    cursor: pointer;
    &.active {
      color: #000;
      font-weight: bold;
    }
    &:hover {
      color: #000;
    }
  }
}
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
