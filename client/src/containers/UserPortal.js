import React, {useState, useEffect} from 'react';
import {Redirect} from 'react-router-dom';
import Box from '../components/Box';

function UserPortal(props) {

    const [docs, setDocs] = useState([]);
    let userId = props.location.state.userId;

    console.log('props here is ', props);
    function handleSubmit(e) {
        e.preventDefault();

        // make sure to specify the id of the specific user
        fetch("http://26ff7f99.ngrok.io/userportal", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                userId: userId // need to send in the userId coz the server is looking for it
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
        <Box userId=''></Box> {/* Box contains the documents user owns and is collaborating on */}
    </div>

    )
}

export default UserPortal;
