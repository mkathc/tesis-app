const service = 'https://chatbot-api-tesis.herokuapp.com/'
const seconde_service = 'https://tesisapi.herokuapp.com'

//const service = 'https://braintutor-service-v2.herokuapp.com'

function getHeaders() {
  let token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

async function fetch_get(name) {
  let res = await fetch(`${service}/${name}`, { headers: getHeaders() })
  if (res.status >= 400 && res.status < 600)
    throw await res.json();

  return res.json()
}

async function fetch_post(name, data) {
  let res = await fetch(`${service}/${name}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: getHeaders()
  })
  if (res.status >= 400 && res.status < 600)
    throw await res.json();

  return res.json()
}


async function fetch_second_get(name) {
  let res = await fetch(`${seconde_service}/${name}`, { headers: getHeaders() })
  if (res.status >= 400 && res.status < 600)
    throw await res.json();

  return res.json()
}


async function fetch_second_post(name, data) {
  let res = await fetch(`${seconde_service}/${name}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: getHeaders()
  })
  if (res.status >= 400 && res.status < 600)
    throw await res.json();

  return res.json()
}

export { service, fetch_get, fetch_post, fetch_second_get, fetch_second_post }