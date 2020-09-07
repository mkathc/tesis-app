<template>
 
  <div> 
      <div>
        <loading :active="loading" :message='loading_message' />
      </div>
      <section v-if="!quiz && !results" class="section" id="section1">
          <h2>No se encontraron preguntas</h2>
      </section>

      <!-- QUIZ -->
      <div v-if="quiz" class="quiz">
        <section class="question m-card">
          <p class="question__statement">{{question.description}}</p>
          <div class="alternatives">
            <div
              v-for="(alternative, a_idx) in question.alternatives"
              :key="a_idx"
              class="alternative"
              :class="{
                'alternative--correct': question.show_correct && a_idx === question.answerCorrect,
                'alternative--incorrect': question.show_correct && a_idx !== question.answerCorrect && a_idx === question.selected
              }"
              @click="selectAlternative(question, a_idx)"
            >{{alternative}}</div>
          </div>
        </section>
        <!-- QUIZ ACTIONS -->
        <div class="quiz__actions">
          <v-btn v-if="question_idx !== 0" @click="go(-1)" color="success" small rounded>Anterior</v-btn>
          <div></div>
          <v-btn
            v-if="question_idx !== quiz.length - 1"
            @click="go(+1)"
            color="success"
            small
            rounded
          >Siguiente</v-btn>
          <v-btn
            v-if="question_idx === quiz.length - 1"
            @click="unselectQuiz()"
            color="primary"
            small
            rounded
          >Finalizar</v-btn>
        </div>
      
      </div> 

      <section v-if="results" class="section" id="section1">
        <h2>RESULTADOS</h2>
        <Results :evaluation="results"/>
      </section> 
      
  </div>
</template>

<script>
import loading from "@/components/loading";
import Results from "@/components/Session/Results";

import { getParam } from "@/services/router.js";
import { getMaterials } from "@/services/materialService";
import { createEvaluation } from "@/services/preEvaluationService";
import { sendEvaluation } from "@/services/preEvaluationService";

export default {
  data: () => ({
    loading: true,
    loading_message: '',
    quiz: [],
    question_idx: 0,
    results:null
  }),
  computed: {
    question() {
      return this.quiz[this.question_idx];
    }
  },
  async mounted() {
    this.loading = true
    this.loading_message = 'Cargando preguntas'
    let ids = await this.getMaterialList()
    let evaluation = await createEvaluation(ids);
    this.question_idx = 0;
    let new_quiz = evaluation['evaluation']
    if (new_quiz.length>0){
      this.quiz = new_quiz
    }else{
      this.quiz = null
    }
    this.loading = false;
  },
  methods: {
     async getMaterialList(){
      let chatbot_id = getParam("chatbot_id");
      let materials = await getMaterials(chatbot_id);
      let materials_id = []
      materials.forEach(element => {
        materials_id.push(element._id.$oid)
      });
      return materials_id
    },
    selectQuiz(type) {
      this.question_idx = 0;
      this.quiz = JSON.parse(JSON.stringify(this.quizzes[type]));
    },
    async unselectQuiz() {
      this.results = await sendEvaluation(this.quiz)
      this.quiz = null
    },
    selectAlternative(question, a_idx) {
      if (!question.show_correct) {
        question.show_correct = true;
        question.selected = a_idx;
        this.quiz.splice();
      }
    },
    go(dir) {
      this.question_idx = Math.max(
        0,
        Math.min(this.quiz.length - 1, this.question_idx + dir)
      );
    }
  },
  components: {
    loading,
    Results
  }
};
</script>

<style lang='scss' scoped>
.quizzes {
  max-width: 200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;

  &__type {
    margin: 8px 4px;
  }
}

.quiz {
  max-width: 560px;
  margin: 0 auto;

  &__actions {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
  }
}

.question {
  padding: 20px;
  text-align: center;

  &__statement {
    margin-bottom: 20px;
    font-size: 1rem;
    font-weight: bold;
  }
}

.alternatives {
}

$color-correct: #41c541;
$color-incorrect: #ff7c77;

.alternative {
  margin-top: 10px;
  padding: 6px 12px;
  font-size: 0.9rem;
  font-weight: initial;
  border-radius: 15px;
  border: 1px solid #ccc;
  transition: 0.2s;
  cursor: pointer;

  &:hover {
    background: #f3f3f3;
  }

  &--correct {
    background: $color-correct !important;
    color: #fff;
    font-weight: bold;
    border: none;
    &:hover {
      background: $color-correct !important;
    }
  }

  &--incorrect {
    background: $color-incorrect;
    color: #fff;
    font-weight: bold;
    border: none;
    &:hover {
      background: $color-incorrect;
    }
  }

  #section1 {
  min-height: 20%; 
  text-align:center
  }
}
</style>