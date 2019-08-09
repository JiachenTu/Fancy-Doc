import React, { useState } from "react";
import { Redirect } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [registered, setRegistered] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        console.log('username',username);
        fetch('http://447cf3ab.ngrok.io/register', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            redirect: 'follow',
            body: JSON.stringify({
                username: username,
                password: password,
                email: email
            })
        })
        .then(resp => resp.json())
        .then(respJson => {
            console.log('respJson is ', respJson)
            if (respJson.success) {
                console.log('successfully registered!');
                setRegistered(true);
            }
        })
        .catch(err => console.log('An error occurred here', err))
    }

  if (registered) {
    alert("You are registered but you need to login pls");
    return <Redirect to="/login" />;
  } else
    return (
      <div>
        <form onSubmit={handleSubmit} className="form">
          <h3>Register</h3>
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
            <button className="btn btn-success">Register</button>
            <p />
            <button>
              <a className="btn btn-primary" href="/login">
                Login
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

export default Register;
