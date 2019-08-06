import React, {useState} from 'react';
import {Redirect} from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    function handleSubmit(e) {
        e.preventDefault();
        console.log('username',username);
        fetch("http://localhost:3001/register", {
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
            console.log(respJson)
            if (respJson.success) {
                alert('successfully registered!!');
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
            <button type='submit'>Register</button>
        </form>
    </div>

    )
}

export default Register;