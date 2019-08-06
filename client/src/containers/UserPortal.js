import React, {useState, useEffect} from 'react';
import {Redirect} from 'react-router-dom';
import Box from '../components/Box';

function UserPortal() {
    function handleSubmit(e) {
        e.preventDefault();

        // make sure to specify the id of the specific user
        fetch("http://localhost:8080/userportal", {
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
                // do thing here
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
