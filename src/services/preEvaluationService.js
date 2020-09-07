import { fetch_second_post, fetch_second_get } from "./fetch";

function createEvaluation(material_list) {
  return fetch_second_post('createEvaluation', {
    material_list
  })
}

function addQuestionByMaterial(question) {
  return fetch_second_post('addQuestions', {
    question
  })
}

function getQuestionsByMaterial(material_id) {
  return fetch_second_get('getQuestionsByMaterial/'+ material_id)
}

function sendEvaluation(evaluation) {
  return fetch_second_post('sendEvaluation', {
    evaluation
  })
}

export {
  createEvaluation,
  addQuestionByMaterial,
  getQuestionsByMaterial,
  sendEvaluation
}