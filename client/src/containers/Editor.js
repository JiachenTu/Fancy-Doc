import { EditorState, RichUtils, convertFromRaw, convertToRaw } from 'draft-js';
import '../css/App.css';
import React, { Component } from 'react';
import Editor from 'draft-js-plugins-editor';
import io from 'socket.io-client';
import { is } from 'immutable';
import { debounce } from 'lodash';
const serverURL = 'http://localhost:8080';
const socket = io(serverURL);

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = { editorState: EditorState.createEmpty() };
		// this.sendData = debounce(
		// 	editorState => {
		// 		socket.emit('content_update_push', convertToRaw(editorState.getCurrentContent()));
		// 	},
		// 	3000,
		// 	{ leading: false, trailing: true }
		// );

		// this.sendData
		this.first = true;
		this.onChange = editorState => {
			// console.log('before change -- ', this.state.editorState);
			// this.setState({ editorState });

			console.log('============ ON CHANGE ===============');
			console.log('changed contentState', editorState.getCurrentContent().toJS());
			console.log('original --', this.state.editorState.getCurrentContent().toJS());
			// console.log(editorState.getSelection().toJS());
			if (this.first) {
				this.editorState = editorState;
			}

			// distinguish between changes that update selection vs content
			const isContentChanged = is(
				this.state.editorState.getCurrentContent().getBlockMap(),
				editorState.getCurrentContent().getBlockMap()
			);
			console.log('isContentChanged', isContentChanged);
			this.setState({ editorState });
			this.editorState = editorState;
			if (isContentChanged) {
				console.log('selection emit');
				socket.emit('selection_update_push', convertToRaw(editorState.getCurrentContent()));
			} else {
				socket.emit('content_update_push', convertToRaw(editorState.getCurrentContent()));
			}
			// }
			this.first = false;
			// setTimeout(() => {
			// 	const newEditorState = EditorState.push(this.editorState, editorState.getCurrentContent());
			// 	this.setState({ editorState: newEditorState });
			// }, 500);
			// this.sendData(editorState);
			// this.setState({ selObj: window.getSelection() });
			// socket.emit('content_update_push', convertToRaw(editorState.getCurrentContent()));
		};
		socket.on('content_update_merge', receivedContentState => {
			console.log('updating editorState with new contentState');
			let convert = convertFromRaw(receivedContentState);
			let currentState = this.editorState.getCurrentContent();
			let finalContentState = currentState
				.set('blockMap', convert.getBlockMap())
				.set('entityMap', convert.getEntityMap());
			// console.log(finalContentState.toJS());
			// console.log(this.editorState.getSelection().toJS());
			const updEditorState = EditorState.push(
				this.editorState,
				finalContentState,
				'change-block-data'
			);
			// let newEditorState = EditorState.acceptSelection(
			// 	updEditorState,
			// 	updEditorState.getSelection()
			// );
			let newEditorState = EditorState.forceSelection(
				updEditorState,
				updEditorState.getSelection()
			);
			this.setState({ editorState: newEditorState });
		});

		socket.on('selection_update_merge', receivedContentState => {
			console.log('updating editorState with new selectionState');
			let convert = convertFromRaw(receivedContentState);
			let currentState = this.editorState.getCurrentContent();
			let finalContentState = currentState
				.set('blockMap', convert.getBlockMap())
				.set('entityMap', convert.getEntityMap());
			// console.log(finalContentState.toJS());
			// console.log(this.editorState.getSelection().toJS());
			const updEditorState = EditorState.push(
				this.editorState,
				finalContentState,
				'change-block-data'
			);
			// let newEditorState = EditorState.acceptSelection(
			// 	updEditorState,
			// 	updEditorState.getSelection()
			// );
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
	// componentDidUpdate(prevStates) {
	// 	if (!is(this.state.editorState, prevStates.editorState)) {
	// 		console.log('emit content_update_push');
	// 			}
	// }

	componentDidUpdate() {
		// console.log(
		// 	'updated',
		// 	this.state.editorState.getSelection().toJS(),
		// 	this.state.editorState.getCurrentContent().toJS()
		// );
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
