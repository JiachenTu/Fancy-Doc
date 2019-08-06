import React, {useState} from 'react';
import {Redirect} from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    function handleSubmit(e) {
        e.preventDefault();

        // console.log('a)');
        fetch("http://192.168.1.23:3000/login", {
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
            alert(respJson)
            if (respJson.success) {
                alert('hello');
                // return (<Redirect to="/" />)
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
    </div>

    )
}

export default Login;