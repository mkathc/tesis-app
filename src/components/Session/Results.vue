<template>
  <div>
  <!--   <v-btn
          v-for="(action, a_idx) in actions"
          :key="a_idx"
          class="cartel__action"
          fab
          small
          @click="action.callback"
        >
        </v-btn>-->
    <section class="quizzes mb-4"> 
      <h1 v-if="title">{{title}}</h1>
      <h2 v-if="show_button_next">{{sub_title}}</h2>
      <h1>  </h1>
        <div >
        <v-btn v-if="show_button_adaptative"
            color="success"
            large
            rounded
            @click="adaptativeContent()"
          >Ver contenido recomendado</v-btn>
        </div>
        <div >
        <v-btn v-if="show_button_complete"
            color="success"
            large
            rounded
            @click="completeContent()"
          >Ver contenido completo</v-btn>
        </div>
        <div >
        <v-btn v-if="show_button_next"
            color="success"
            large
            rounded
            @click="nextUnit()"
          >Siguiente Unidad</v-btn>
        </div>
    </section>

    <div >
      <!-- Avatar -->
      <Avatar ref="component_avatar" />
    </div>
     
  </div>
</template>

<script>
import { getParam, redirect } from "@/services/router.js";
import Avatar from "@/components/Chatbot/Chat/Avatar"
import { SpeechToText } from "@/services/speech";

export default {
  props: ["evaluation"],
  data: () => ({
    title: "false",
    sub_title: "false",
    show_button_adaptative: false,
    show_button_complete: false,
    show_button_next: false,
    puntaje: 0,
    message_text: ""
  }),
  mounted(){
    this.$store.commit("setComponentAvatar", this.$refs.component_avatar);
    this.puntaje = Math.round(this.evaluation['puntaje'])
    this.title = this.puntaje + " puntos"
    if (this.puntaje < 20 ){
      this.show_button_complete = true
      this.show_button_adaptative = false
      this.show_button_next = false
      this.message_text = "Tu puntaje es" + this.puntaje + "Vamos a mejorar revisando toda la unidad"
      this.addMessage(this.message_text)
    }else{
      if (this.puntaje > 80){
        this.sub_title = "Felicitaciones, puedes avanzar a la siguiente unidad"
        this.show_button_next = true
        this.message_text = "Feilicitaciones, tu puntaje es" + this.puntaje + "Vamos a seguir aprendiendo en la siguiente unidad"
        this.addMessage(this.message_text)
      }else{
        this.show_button_adaptative = true
        this.show_button_complete = false
        this.show_button_next = false
        this.message_text = "Tu puntaje es" + this.puntaje + "Vamos a seguir revisando la unidad"
        this.addMessage(this.message_text)
      }
    }
  },
  methods:{
    adaptativeContent(){
      let incorrects = this.evaluation['incorrects']
      let list_incorrects = incorrects['lista_incorrects']
      let material_list_incorrects = []
      list_incorrects.forEach(element => {
        material_list_incorrects.push(element['materialId'])
      });

      let chatbot_id = getParam('chatbot_id')

      let corrects = this.evaluation['corrects']
      let list_corrects = corrects['lista_corrects']
      let material_list_corrects = []
      list_corrects.forEach(element => {
        material_list_corrects.push(element['materialId'])
      });

      redirect("adaptative-content", { material_id: material_list_incorrects, chatbot_id: chatbot_id, review_id:material_list_corrects });
    },
    completeContent(){
      let chatbot_id = getParam('chatbot_id')
      redirect("adaptative-content", { material_id: [], chatbot_id: chatbot_id, review_id:[] });
    },
    nextUnit(){
      redirect("sessions-student");
    },
    addMessage(text) {
      this.component_avatar.startTalk(text);
    },
     talkMessage() {
      this.component_avatar.stopTalk();
      SpeechToText(text => {
        this.message_text = text;
        this.sendMessage();
      });
    },
  },
  computed:{
    component_avatar() {
      return this.$store.state.component_avatar;
    }
  },
  components:{
    Avatar
  }
};
</script>

<style lang='scss' scoped>
.cartel__container {
  // height: 100%;
  border-radius: 10px;
  background: #fff;
  //
  display: flex;
  flex-direction: column;
  cursor: pointer;
  .cartel__menu {
    position: relative;
    height: 100px;
    .cartel__image {
      overflow: hidden;
      height: 100%;
      padding: 10px;
      border-radius: 10px 10px 0 0;
      //
      display: flex;
      justify-content: center;
      img {
        height: 100%;
      }
    }
    .cartel__background {
      width: 100%;
      height: 100%;
      border-radius: 10px 10px 0 0;
      background: rgb(18, 20, 139);
      background: linear-gradient(
        90deg,
        rgba(18, 20, 139, 1) 0%,
        rgba(83, 85, 182, 1) 100%
      );
    }
    .cartel__actions {
      display: none;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      //
      display: flex;
      justify-content: center;
      align-items: center;
      .cartel__action {
        margin: 0 6px;
      }
    }
  }
  .cartel__content {
    padding: 6px 8px;
    text-align: center;
    .cartel__title {
      padding: 3px 0;
      font-size: 1rem;
      font-weight: bold;
    }
    .cartel__description {
      padding: 1px 0;
      font-size: 0.9rem;
      font-weight: normal;
    }
  }
}
</style>