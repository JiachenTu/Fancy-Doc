import {
  EditorState,
  RichUtils,
  convertFromRaw,
  convertToRaw,
  Modifier,
  ContentState,
  SelectionState
} from "draft-js";
import "../css/App.css";
import React, { Component } from "react";
import Editor from "draft-js-plugins-editor";
import io from "socket.io-client";
import _ from "underscore";
import { is, fromJS } from "immutable";
const serverURL = "http://447cf3ab.ngrok.io";
const socket = io(serverURL);
// const docId = req.params.id;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.socketId = Date.now();
    this.state = { editorState: EditorState.createEmpty(), collab: "" };
    this.docId = props.match.params.docId;
    this.first = true;
    this.onChange = editorState => {
      console.log("============ ON CHANGE ===============");
      // console.log('changed contentState:', editorState.getCurrentContent().toJS());
      // console.log('original contentState:', this.state.editorState.getCurrentContent().toJS());
      const isContentChanged =
        this.lastSentContent &&
        !is(
          this.lastSentContent.getBlockMap(),
          editorState.getCurrentContent().getBlockMap()
        );
      console.log("isContentChanged", isContentChanged);
      this.setState({ editorState });

      if (isContentChanged) {
        socket.emit("content_update_push", {
          socketId: this.socketId,
          content: convertToRaw(editorState.getCurrentContent()),
          selection: editorState.getSelection().toJS()
        });
      } else {
        socket.emit("selection_update_push", {
          socketId: this.socketId,
          selection: editorState.getSelection().toJS()
        });
      }

      this.lastSentContent = editorState.getCurrentContent();
    };
    socket.on("content_update_merge", ({ socketId, content }) => {
      // console.log('socketid', this.socketId, socketId);
      if (socketId === this.socketId) {
        return;
      }
      console.log("updating editorState with new contentState");
      let contentStateToUpd = convertFromRaw(content);
      let currentState = this.state.editorState.getCurrentContent();
      let finalContentState = currentState
        .set("blockMap", contentStateToUpd.getBlockMap())
        .set("entityMap", contentStateToUpd.getEntityMap());
      const updEditorState = EditorState.push(
        this.state.editorState,
        finalContentState,
        "change-block-data"
      );
      let newEditorState = updEditorState;
      newEditorState = EditorState.forceSelection(
        updEditorState,
        this.state.editorState.getSelection()
      );
      console.log("setting contet", newEditorState.toJS());
      this.setState({ editorState: newEditorState });
    });
    this.socketSelectionMap = {};

    socket.on("selection_update_merge", ({ socketId, selection }) => {
      console.log("updating editorState with new selectionState");
      const previousSelection = this.socketSelectionMap[socketId];
      let currentContent = this.state.editorState.getCurrentContent();
      if (socketId === this.socketId) {
        //remove previous styles
        if (previousSelection) {
          const styles = [
            "selected_backward",
            "cursor_end",
            "cursor_middle",
            "selection_forward"
          ];
          currentContent = _.reduce(
            styles,
            (newContentState, style) =>
              Modifier.removeInlineStyle(
                newContentState,
                previousSelection,
                style
              ),
            currentContent
          );
        }
        return;
      }
      const blockMap = this.state.editorState.getCurrentContent().getBlockMap();
      if (
        !blockMap.get(selection.anchorKey) ||
        !blockMap.get(selection.focusKey)
      ) {
        return;
      }

      // console.log('selection', selection);
      const selectionState = SelectionState.createEmpty("");
      let updatedSelection = selectionState.merge(selection);
      // console.log('block content --', blockMap.get(selection.anchorKey).text);

      // figure out style to add based on selection length
      let styleToAdd = "";
      // if (selection.focusOffset === selection.anchorOffset) {
      // 	if (selection.focusOffset === blockMap.get(selection.anchorKey).characterList.size) {
      // 		styleToAdd = 'cursor_end';
      // 		updatedSelection = updatedSelection.set('anchorOffset', selection.anchorOffset - 1);
      // 	} else {
      // 		styleToAdd = 'cursor_middle';
      // 		updatedSelection = updatedSelection.set('focusOffset', selection.focusOffset + 1);
      // 	}
      // }
      // else if (selection.focusOffset > selection.anchorOffset) {
      // 	styleToAdd = 'selected_forward';
      // } else {
      // 	styleToAdd = 'selected_backward';
      // }
      if (selection.focusOffset > selection.anchorOffset) {
        styleToAdd = "selected_forward";
      } else {
        styleToAdd = "selected_backward";
      }

      /**
       * input: abcd
       * if the cursor isn't seleting anything
       * if cursor is at x=4 then we need to select [x-1, x] with a border right
       * if cursor is in position [0, 4) then we can select [x, x+1] with border left
       *
       * if the cursor is selecting something
       * if selection.isBackwards => background: [anchor, offset] borderLeft
       * if selection.isBackwards => background: [anchor, offset] borderRight
       */

      if (previousSelection) {
        const styles = [
          "selected_backward",
          "cursor_end",
          "cursor_middle",
          "selected_forward"
        ];
        currentContent = _.reduce(
          styles,
          (newContentState, style) =>
            Modifier.removeInlineStyle(
              newContentState,
              previousSelection,
              style
            ),
          currentContent
        );
      }

      // console.log('styleToAdd', styleToAdd);
      const finalContentState = Modifier.applyInlineStyle(
        currentContent,
        updatedSelection,
        styleToAdd
      );
      this.socketSelectionMap[socketId] = updatedSelection;

      // console.log('finalContentState ---', finalContentState.toJS());

      let updEditorState = EditorState.push(
        this.state.editorState,
        finalContentState,
        "change-block-data"
      );
      updEditorState = EditorState.forceSelection(
        updEditorState,
        this.state.editorState.getSelection()
      );

      console.log("setting selection", updEditorState.toJS());

      this.setState({ editorState: updEditorState });
    });
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
    console.log("mounted");
    let docId = this.props.match.params.docId;
    let cont = "";
    let content;
    fetch(`http://447cf3ab.ngrok.io/document/${docId}/get`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      redirect: "follow"
    })
      .then(resp => resp.json())
      .then(respJson => {
        if (respJson.success) {
          cont = respJson.data;
          console.log(respJson);
          content = ContentState.createFromText(cont);
          this.state.editorState = EditorState.createWithContent(content);
        }
      })
      .catch(err => console.log("error on fetch req to document/get", err));
  }

  handleSave() {
    //   console.log("inside handleSave");
    // console.log(req.params.id);
    // send a req to let the server handle the saving part
    fetch(`http://447cf3ab.ngrok.io/document/${this.docId}/save`, {
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

  customStyleFn(style, block) {
    console.log("custom style fn  ==================", style, block);
    if (style.has("selected_backward")) {
      // console.log(block.toJS());
      console.log("selected_backward --+++++ ");
      return {
        borderLeft: "2px solid green",
        paddingLeft: "1px",
        background: "LightGreen"
      };
    }
    if (style.has("selected_forward")) {
      // console.log(block.toJS());
      console.log("selected_forward --+++++ ");
      return {
        borderRight: "2px solid green",
        paddingRight: "1px",
        background: "LightGreen"
      };
    }
    if (style.has("cursor_end")) {
      // console.log(block.toJS());
      console.log("cursor_end --+++++ ");
      return {
        borderRight: "2px solid green",
        paddingRight: "1px"
      };
    }
    if (style.has("cursor_middle")) {
      // console.log(block.toJS());
      console.log("cursor_middle ---+++++ ");
      return {
        borderLeft: "2px solid green",
        paddingLeft: "1px"
      };
    }
  }

  // this function adds collaborator of document using entered email
  addCollab() {
    fetch(`http://447cf3ab.ngrok.io/document/${this.docId}/addCollab`, {
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
            customStyleFn={this.customStyleFn}
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
