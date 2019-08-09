import React, { useState } from "react";
import { Redirect } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    fetch("http://6dd22f73.ngrok.io/login", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include',
        // redirect: 'follow',
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
      .then(resp => resp.json())
      .then(respJson => {
        if (respJson.success) {
          console.log("logged in");
          console.log("respJson is ", respJson);
          setUserId(respJson.user.id);
          console.log("hello");
          //alert('successfully logged in!');
          // return (<Redirect to={{pathname: '/userportal', state:{userId: respJson.user._id}}}/>)
          // return (<Redirect to='/userportal' />);
          // we can then access it from props.location.state.userId
        }
      });
  }

  if (userId !== "") {
    // same as checking is login was successful
    console.log("userId is ", userId);
    return (
      <Redirect to={{ pathname: "/userportal", state: { userId: userId } }} />
    );
  } else
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
          </div>
        </form>
      </div>
    );
}

export default Login;
