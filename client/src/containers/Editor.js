import { EditorState, RichUtils, convertFromRaw, convertToRaw } from 'draft-js';
import '../css/App.css';
import React, { Component } from 'react';
import Editor from 'draft-js-plugins-editor';
import io from 'socket.io-client';
import { is } from 'immutable';
// import { debounce } from 'lodash';
const serverURL = 'http://localhost:8080';
const socket = io(serverURL);

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = { editorState: EditorState.createEmpty() };
		this.first = true;
		this.onChange = editorState => {
			console.log('============ ON CHANGE ===============');
			console.log('changed contentState:', editorState.getCurrentContent().toJS());
			console.log('original contentState:', this.state.editorState.getCurrentContent().toJS());
			const isContentChanged = is(
				this.state.editorState.getCurrentContent().getBlockMap(),
				editorState.getCurrentContent().getBlockMap()
			);
			console.log('isContentChanged', isContentChanged);
			this.setState({ editorState });
			if (isContentChanged) {
				socket.emit('selection_update_push', convertToRaw(editorState.getCurrentContent()));
			} else {
				socket.emit('content_update_push', convertToRaw(editorState.getCurrentContent()));
			}
		};
		socket.on('content_update_merge', receivedContentState => {
			console.log('updating editorState with new contentState');
			let contentStateToUpd = convertFromRaw(receivedContentState);
			let currentState = this.state.editorState.getCurrentContent();
			let finalContentState = currentState
				.set('blockMap', contentStateToUpd.getBlockMap())
				.set('entityMap', contentStateToUpd.getEntityMap());
			const updEditorState = EditorState.push(
				this.state.editorState,
				finalContentState,
				'change-block-data'
			);
			let newEditorState = EditorState.forceSelection(
				updEditorState,
				updEditorState.getSelection()
			);
			this.setState({ editorState: newEditorState });
		});

		socket.on('selection_update_merge', receivedContentState => {
			console.log('updating editorState with new selectionState');
			let contentStateToUpd = convertFromRaw(receivedContentState);
			let currentState = this.state.editorState.getCurrentContent();
			let finalContentState = currentState
				.set('blockMap', contentStateToUpd.getBlockMap())
				.set('entityMap', contentStateToUpd.getEntityMap());
			const updEditorState = EditorState.push(
				this.state.editorState,
				finalContentState,
				'change-block-data'
			);
			let newEditorState = EditorState.acceptSelection(
				updEditorState,
				updEditorState.getSelection()
			);
			this.setState({ editorState: newEditorState });
		});
	}

	componentDidMount() {
		socket.on('start', msg => {
			console.log(msg);
		});
	}

	_onBoldClick() {
		this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
	}

	_onItalicizeClick() {
		this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'));
	}

	_onUnderlineClick() {
		this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'UNDERLINE'));
	}

	render() {
		return (
			<div id='content'>
				<h1>My Editor</h1>
				<button onClick={this._onBoldClick.bind(this)}>Bold</button>
				<button onClick={this._onItalicizeClick.bind(this)}>Italicize</button>
				<button onClick={this._onUnderlineClick.bind(this)}>Underline</button>

				<div className='editor'>
					<Editor editorState={this.state.editorState} onChange={this.onChange} />
				</div>
			</div>
		);
	}
}
