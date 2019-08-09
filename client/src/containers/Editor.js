import { EditorState, RichUtils } from "draft-js";
import "../css/App.css";
import React, { Component } from "react";
import Editor from "draft-js-plugins-editor";

export default class App extends React.Component {
  constructor(props) {
    super(props);
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

  handleSave() {
    console.log('inside handleSave');
    // send a req to let the server handle the saving part
    fetch("http://6dd22f73.ngrok.io/document/save", {
      method: 'POST',
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
          docId:  '1', // dummy value for now -------------------
          title: 'ola' // dummy title for now -------------------
      }),
      credentials: 'include',
      redirect: 'follow',
  })
  .then(resp => resp.json())
  .then(respJson => {
      if (respJson.success) {
          console.log("document saved");
      }
  })
  .catch(err => console.log('error while saving document', err));
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
      </div>
    );
  }
}
