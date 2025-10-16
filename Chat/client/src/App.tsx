import { useState } from 'react'
import Login from './components/Login.tsx'
import Chat from './components/Chat.tsx'
import './styles/App.css'

function App() {
  const [username, setUsername] = useState<string | null>(null)

  const handleLogin = (name: string): void => {
    setUsername(name)
  }

  const handleLogout = (): void => {
    setUsername(null)
  }

  return (
    <>
      {!username ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Chat username={username} onLogout={handleLogout} />
      )}
    </>
  )
}

export default App