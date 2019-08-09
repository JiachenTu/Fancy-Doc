import { EditorState, RichUtils, ContentState } from "draft-js";
import "../css/App.css";
import React, { Component } from "react";
import Editor from "draft-js-plugins-editor";

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

    // Document.findById(docId, function(err, doc) {
    //   if (err) {
    //     console.log('error ', err);
    //   }
    //   else {
    //     cont = doc.content;
    //     console.log('the content is ', cont);
    //   }
    // })
  }

  handleSave() {
    console.log('inside handleSave');
    // send a req to let the server handle the saving part
    // debugger;
    fetch("http://6dd22f73.ngrok.io/document/save", {
      method: 'POST',
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
          docId:  this.props.match.params.docId, // dummy value for now -------------------
          newContent: this.state.editorState.getCurrentContent().getPlainText() // this.state.editorState.getCurrentContent().getBlockMap().get(this.state.editorState.getSelection().getAnchorKey()).getText() // dummy value for now -------------------
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
    .catch(err => console.log('error on fetch req to document/save', err));
  }

  // helper func to see how to access the text inside the box
  handleText() {
    console.log('It is ', this.state.editorState.getCurrentContent().getPlainText());
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
        <button onClick={() => this.handleText()}>Text</button>
      </div>
    );
  }
}
