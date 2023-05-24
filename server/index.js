import express from 'express'
import queryString from 'querystring'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import {
  SERVER_ROOT_URI,
  REDIRECT_URI,
  GOOGLE_CLIENT_ID,
  UI_ROOT_URI,
  GOOGLE_CLIENT_SECRET,
  JWT_SECRET,
  COOKIE_NAME
} from './config.js'
import cookieParser from 'cookie-parser'
const app = express()

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}))
app.use(cookieParser())
function getGoogleAuthURL() {
  const rootURL = "https://accounts.google.com/o/oauth2/v2/auth"
  const options = {
    redirect_uri: REDIRECT_URI,
    client_id: GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  }
  return `${rootURL}?${queryString.stringify(options)}`
}
app.get('/auth/google/url', (req, res) => {
  return res.send(getGoogleAuthURL());
})
app.get('/auth/google', async (req, res) => {
  const code = req.query.code
  console.log(` ++ code: ${code}\n `)
  getToken({
    code,
    clientId: GOOGLE_CLIENT_ID,
    clienSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: `${SERVER_ROOT_URI}/auth/google`
  }).then(async ({ access_token, id_token }) => {
    // token de accesso
    // token id
    console.log(` ++ access_token: ${access_token} \n\n\n ++ id_token: ${id_token} \n `)

    const googleUser = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      { headers: { Authorization: `Bearer ${id_token}` } }
    )
    console.log(" ++ Data User: ", googleUser.data)
    const token = jwt.sign(googleUser.data, JWT_SECRET)
    console.log(" ++ TOKEN USER: ", token)

    res.cookie(COOKIE_NAME, token, { maxAge: 900000, httpOnly: true, secure: true })
    res.redirect(UI_ROOT_URI)


  }).catch(err => { throw new Error(err.message) })
})
app.get('/auth/me', (req, res) => {
  console.log(req.cookies)

  try {
    if (req.cookies[COOKIE_NAME]) {
      const decoded = jwt.verify(req.cookies[COOKIE_NAME], JWT_SECRET)
      console.log(decoded)
      res.send(decoded)

      res.clearCookie(COOKIE_NAME);

      res.end()
    }else{
      res.send(null)
    }

  } catch (err) {
    res.send(null)
  }
''})

function getToken({ code, clientId, clienSecret, redirectUri }) {
  const values = {
    code,
    client_id: clientId,
    client_secret: clienSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  }
  return axios.post("https://oauth2.googleapis.com/token", queryString.stringify(values), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  }).then((res) => res.data)
    .catch((err) => { throw new Error(err.message) })//token api google

}

app.listen(4000, () => {
  console.log(`server running... \n + server: ${SERVER_ROOT_URI}/auth/google/url \n + client: ${UI_ROOT_URI}`)
})