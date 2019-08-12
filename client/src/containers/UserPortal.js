import React, {useState, useEffect} from 'react';
import {Redirect} from 'react-router-dom';
import Box from '../components/Box';

function UserPortal(props) {

    const [ownedDocs, setOwnedDocs] = useState([]);
    const [collabDocs, setCollabDocs] = useState([]);
    const [title, setTitle] = useState('');
    const [tracker, setTracker] = useState(false)
    const [newDocId, setNewDocId] = useState('');

    let userId;
    if (props.location.state)
        userId = props.location.state.userId;

    console.log('props here is ', props);

    useEffect(() => {
        if (!props.location.state) return;


        fetch("http://6dd22f73.ngrok.io/userportal", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({userId}),
            credentials: 'include',
            redirect: 'follow',
        })
        .then(resp => resp.json())
        .then(respJson => {
            console.log(respJson)
            if (respJson.success) {
                // do thing here
                console.log(respJson)
                setOwnedDocs(respJson.data.owned);
                setCollabDocs(respJson.data.collaborated);
            }
        })
        .catch(err => console.log('fetch document error', err));
    }, [tracker])

    function handleSubmit(e) {
        e.preventDefault();

        fetch("http://6dd22f73.ngrok.io/document/new", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                owner: userId,
                title: title
            }),
            credentials: 'include',
            redirect: 'follow',
        })
        .then(resp => resp.json())
        .then(respJson => {
            // console.log(respJson)
            if (respJson.success) {
                // do thing here
                console.log("document created");
                setTracker(!tracker)
                setTitle('')
                // console.log(respJson);
                setNewDocId(respJson._id);
                // return <Redirect to='/login' />;
                // return (<Redirect to={{pathname: "/editor/" + ownedDocs[ownedDocs.length - 1]._id}} />)
            }
        })
        .catch(err => console.log('error while creating document', err));
        // make sure to specify the id of the specific user
    }

    if (!props.location.state) {
        alert('please log in first to be able to visit userportal');
        return <Redirect to='/login' />;
    };
    if (newDocId != '') {
        return <Redirect to={'/editor/'+newDocId} />
    }

    console.log('doc is ', ownedDocs);

    return (
    <div>
        <h1>Documents Portal </h1>

        <input type='text' name='newDocTitle' placeholder='new document title' value={title} onChange = {(e)=> setTitle(e.target.value)} />
        <button onClick={(e) => handleSubmit(e)}>Create new document</button>
        <div style={StyleSheet.box}>
            <div>Owned Docs:</div>
            <div>
                <ul>{ownedDocs.map((doc) => <li key={doc._id}><a href={"/editor/" + doc._id}>{doc.title}</a></li>)}</ul>
            </div>
            <div>Collaborated Docs:</div>
            <div>
                <ul>{collabDocs.map((doc) => <li>{doc.title}</li>)}</ul>
            </div>
        </div>
    </div>

    )
}

// app.post('/editor/:id/save', function(req, res) {
//     req.params.id;
// });

let StyleSheet = {
    box: {height:'10%', width:'%', border:'2px solid black',
            margin:'2%', padding:'1%'}
}

export default UserPortal;
