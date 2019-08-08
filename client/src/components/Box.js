import React, {useState, useEffect} from 'react';
import {Redirect} from 'react-router-dom';

function Box() {
    return (
        <div>
            <div style={StyleSheet.box}>
                <span>{'Hello'}</span>
                <span>{'ola'}</span>
                <div>olaola</div>
                <div>olaola</div>
                <div>olaola</div>
            </div>

        </div>
        )
}

let StyleSheet = {
    box: {height:'10%', width:'%', border:'2px solid black',
            margin:'2%', padding:'1%'}
}
export default Box;
