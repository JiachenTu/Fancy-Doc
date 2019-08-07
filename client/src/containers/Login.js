import React, { useState } from "react";
import { Redirect } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  function handleSubmit(e) {
    e.preventDefault();

        console.log('start login', username, password);
        fetch("http://98bfee00.ngrok.io/login", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            redirect: 'follow',
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(resp => resp.json())
        .then(respJson => {
            if (respJson.success) {
                alert('successfully logged in!');
                return (<Redirect to={{pathname: '/userportal', state:{userId: respJson.user._id}}}/>)
                // we can then access it from this.props.location.state.userId
            }
        })
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
