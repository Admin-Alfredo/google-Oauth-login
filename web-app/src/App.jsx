import { useEffect, useState } from 'react'
import axios from 'axios'
function App() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    if (user == null) Fetch();

    async function Fetch() {
      await axios.get("http://localhost:4000/auth/me",
        {
          withCredentials: true
        }).then(data => {
          if (data.data !== '') {
            setUser(data.data)
          } else {
            setUser(null)
          }
          console.log(data.data)
        }).catch(err => console.error(err.message))

    }

  }, [user])
  const handlerGetLinkGoogle = () => {
    axios.get("http://localhost:4000/auth/google/url").then(response => {
      const link = document.createElement("a")
      link.href = response.data

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    }).catch(err => {

    })
  }
  return (
    <div style={{
      padding: 12,
      boxShadow: '1px 0.23rem 15px #ccc',
      borderRadius: 5,
      width: 400,
      margin: '100px auto',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {user == null &&
        <div style={{
          display: 'flex',
          flexDirection:'column',
          alignItems: 'center'
        }}>
          <img src='/src/pngwing.com.png' width={200}/>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor:'#3f7ee8',
              color: '#FFF',
              fontSize: 20,
              border: 'none',
              cursor: 'pointer',
            }}  
          onClick={handlerGetLinkGoogle}>Fazer login com google</button>
        </div>
      }

      {user &&
        <div style={{
          textAlign: 'center'
        }}>
          <img src={user?.picture} width="200" style={{ borderRadius: '50%' }} />
          <h1 style={{
            color: "#3c4043",
            fontSize: '1.8rem'
          }}>{user?.name}</h1>
          <h3 style={{
            color: '#5f6368'
          }}>{user?.email}</h3>
        </div>
      }

    </div>
  )
}

export default App
