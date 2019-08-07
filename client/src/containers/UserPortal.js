import React, {useState, useEffect} from 'react';
import {Redirect} from 'react-router-dom';
import Box from '../components/Box';

function UserPortal() {
    function handleSubmit(e) {
        e.preventDefault();

        fetch("http://localhost:3001/register", {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            redirect: 'follow',
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
        <h1>Documents Portal </h1>
        <input type='text' name='newDocTitle' placeholder='new document title' />
        <button>Create new document</button>
    <Box></Box> {/* Box contains the documents user owns and is collaborating on */}
    </div>

    )
}

export default UserPortal;
