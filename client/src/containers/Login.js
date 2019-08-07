import React, { useState } from "react";
import { Redirect } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  function handleSubmit(e) {
    e.preventDefault();

    // console.log('a)');
    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      redirect: "follow",
      body: JSON.stringify({
        username: username,
        password: password,
        email: email
      })
    })
      .then(resp => resp.json())
      .then(respJson => {
        alert(respJson);
        if (respJson.success) {
          alert("hello");
          // return (<Redirect to="/" />)
        }
      });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="form">
        <h3>Login</h3>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            className="form-control"
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="text"
            name="username"
            className="form-control"
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <button className="btn btn-success">Login</button>
          <button>
            <a className="btn btn-primary" href="/register">
              Register
            </a>
          </button>
          <button>
            <a className="btn btn-primary" href="/editor">
              Editor
            </a>
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
