import { EditorState, RichUtils, ContentState, convertFromRaw, convertToRaw } from "draft-js";
import "../css/App.css";
import React, { Component } from "react";
import Editor from "draft-js-plugins-editor";
// client side socket io is imported
import io from "socket.io-client";
import { is } from "immutable";
import { debounce } from "lodash";
const serverURL = "http://localhost:8080";
// link the socket to the server
const socket = io(serverURL);
// const docId = req.params.id;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    console.log('props are ', props);
    this.state = { editorState: EditorState.createEmpty() };
    this.onChange = editorState => this.setState({ editorState });
  }

  _onBoldClick() {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, "BOLD"));
  }

  _onItalicizeClick() {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, "ITALIC")
    );
  }

  _onUnderlineClick() {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, "UNDERLINE")
    );
  }

  // whenever this component mounts, need to bring the saved
  // content in the text editor
  componentDidMount() {
    console.log('mounted');
    let docId = this.props.match.params.docId;
    let cont = '';
    let content;
    fetch( `http://6dd22f73.ngrok.io/document/${docId}/get`, {
      method: 'GET',
      headers: {
          "Content-Type": "application/json"
      },
      credentials: 'include',
      redirect: 'follow',
    })
    .then(resp => resp.json())
    .then(respJson => {
        if (respJson.success) {
            cont = respJson.data;
            console.log(respJson)
            content = ContentState.createFromText(cont);
            this.state.editorState = EditorState.createWithContent(content);
        }
    })
    .catch(err => console.log('error on fetch req to document/get', err));
  }

  handleSave() {
    //   console.log("inside handleSave");
    // console.log(req.params.id);
    // send a req to let the server handle the saving part
    fetch(`http://localhost:8080/document/${this.docId}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: this.state.editorState.getCurrentContent().getPlainText()
      }),
      credentials: "include",
      redirect: "follow"
    })
      .then(resp => resp.json())
      .then(respJson => {
        if (respJson.success) {
          console.log(respJson.data);
          console.log("document saved");
        }
      })
      .catch(err => console.log("error while saving document", err));
  }

  // this function adds collaborator of document using entered email
  addCollab() {
    fetch(`http://localhost:8080/document/${this.docId}/addCollab`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: this.state.collab
      }),
      credentials: "include",
      redirect: "follow"
    })
      .then(resp => resp.json())
      .then(respJson => {
        if (respJson.success) {
          console.log("add collab success");
          this.setState({ collab: "" });
        }
      })
      .catch(err => console.log("error while saving document", err));
  }

  render() {
    return (
      <div id="content">
        <h1>My Editor</h1>
        <button onClick={this._onBoldClick.bind(this)}>Bold</button>
        <button onClick={this._onItalicizeClick.bind(this)}>Italicize</button>
        <button onClick={this._onUnderlineClick.bind(this)}>Underline</button>

        <div className="editor">
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
          />
        </div>
        <button onClick={() => this.handleSave()}>Save</button>
        <input
          type="text"
          name="addCollaborators"
          className="form-control"
          placeHolder="enter email of collaborators"
          onChange={e => this.setState({ collab: e.target.value })}
          value={this.state.collab}
        />
        <button onClick={() => this.addCollab()}>Add Collaborators</button>
      </div>
    );
  }
}
