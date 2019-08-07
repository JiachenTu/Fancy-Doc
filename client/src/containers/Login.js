import React, {useState} from 'react';
import {Redirect} from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
        <form onSubmit = {handleSubmit}>
            <input name="username" type='text' placeholder='Your username' onChange={(e) =>
                setUsername(e.target.value)} />
            <input name='password' type='password' placeholder='Your password' onChange={(e) => setPassword(e.target.value)}/>
            <button type='submit'>Login</button>
        </form>
        <button><a href='/register'> Register </a></button>
        <button><a href='/editor'> Editor </a></button>
        <button><a href='/userportal'> UserPortal </a></button>
    </div>

    )
}

export default Login;