import React from "react";
import TodoList from "./components/TodoList";
import Navbar from "./components/Navbar";
import { useAuth } from './auth/AuthProvider';

function App() {
  const { user, userLoading } = useAuth();

  return (
    <React.Fragment>
      <Navbar />
      {
        userLoading ? (<h1>Trying to Log in</h1>) :
          (user ? <TodoList /> : <h1>Please Login</h1>)
      }
    </React.Fragment>
  )
}

export default App;
