<template>
  <div>
    <loading :active="loading" :message="loading_msg" />
      <div>
        <QuestionEditor :quiz="quiz" material_id = "ma" @submit="save" />
      </div> 
  </div>
</template>

<script>
import loading from "@/components/loading";
import QuestionEditor from "@/components/Questions/QuestionEditor";

import { addQuestionByMaterial } from "@/services/preEvaluationService";
import { getQuestionsByMaterial } from "@/services/preEvaluationService";


class Pregunta {
  constructor(question, alternatives) {
    this.question = question;
    this.alternatives = alternatives;
  }
}

export default {
  props: ["material"],
  data: () => ({
    quiz: [],
    loading: false,
    loading_msg: ""
  }),  
  async created(){
     let material_id = this.material._id.$oid;
      let questions = await getQuestionsByMaterial(material_id);
      let questions_by_material = questions['questions'];
      if (questions_by_material.length > 0){
        this.quiz = questions_by_material
      }else{
        this.quiz = [
        new Pregunta("Pregunta", [
          "Alternativa 1",
          "Alternativa 2",
          "Alternativa 3",
          "Alternativa 4"
        ])
        ]
      }     
  }, 
  methods: {
    async save(data) {
      this.loading = true;
      this.loading_msg = "Guardando";
      let final_list = []
      try { 
        let question_list = data
        if (question_list.length<5){
          this.$root.$children[0].showMessage("Error", "Ingrese como mínimo 5 preguntas");
        }else{
          console.log(this.quiz)
          console.log(question_list)
          //let final_list = question_list.filter(this.comparer(this.quiz))
          question_list.forEach(element => {
            if(element._id == undefined){
              element.material_id  = this.material._id.$oid
              final_list.push(element)
            }
          });
          console.log(final_list)
          await addQuestionByMaterial(final_list)
        }
      } catch (error) {
        this.$root.$children[0].showMessage("Error", error.msg);
      }
      this.loading = false;
    }
  },
  components: {
    loading,
    QuestionEditor
      }
};
</script>

<style lang='scss' scoped>
.quizzes {
  display: flex;
  justify-content: center;

  &__type {
    margin: 0 4px;
  }
}
</style>