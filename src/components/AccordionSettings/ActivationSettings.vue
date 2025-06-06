<template>
	<div>
		<codemirror v-model='code' ref='editor' :options="{
			viewportMargin: Infinity,
			theme: 'glsl',
			mode: 'glsl',
		}" title="GLSL code for the activation function. Defines how the sum of kernel-weighted neighbors translates to the pixel's next state."></codemirror>
		<div id='error'> {{this.error}} </div>
		<div id='dropdown'>
				Activation Functions: <select v-model="selected" @change="select()" title="Select a pre-defined activation function, or write your own in the editor above.">
				<option v-for="(activation, i) in activations "
					v-bind:value="activation" 
					:key="i" >
					{{activation.name}}
				</option>
			</select>
		</div>
		<WikiSection><ActivationWiki/></WikiSection>
	</div>
</template>

<script>
import WikiSection from '../Wiki/WikiSection';
import ActivationWiki from '../Wiki/ActivationWiki';

import Controller from '../../js/controller';
import { codemirror } from 'vue-codemirror-lite';
var CodeMirror = require('codemirror/lib/codemirror.js');
require('./glslmode')(CodeMirror);

// have to require it for commenting to work. idk why
let toggleComment = require('codemirror/addon/comment/comment.js');
toggleComment // using it so linting doesn't get mad
function toggleGLSLComment(cm) {
	cm.toggleComment({
		indent: true,
		lineComment: '//',
	});
}

export default {
	name: 'ActivationSettings',
	components: {
		codemirror,
		ActivationWiki,
		WikiSection
	},
	mounted() {
		this.$refs.editor.editor.setOption('extraKeys', {
			'Cmd-/': toggleGLSLComment,
			'Ctrl-/': toggleGLSLComment
		});
		setTimeout(()=>{
			this.$refs.editor.editor.refresh();
		}, 1000);
	},
	data() {
		let activations = require('../../assets/activations.json');
        activations = JSON.parse(JSON.stringify(activations)); // deep copy, will modify
		return {
			code: Controller.activationSource,
			error: '',
			selected: activations.find(a => a.code === Controller.activationSource) || activations[0],
			activations,
			ignore_change: false,
		}
	},

	methods: {
		refreshFromController() {
			this.ignore_change = true; // Prevent watch code() from clearing selected
			this.code = Controller.activationSource;
			// Update the dropdown to match the new code if it's one of the presets
			const matchingPreset = this.activations.find(a => a.code === this.code);
			if (matchingPreset) {
				this.selected = matchingPreset;
			} else {
				this.selected = undefined; // Or a default/custom indicator
			}
			// It's important to ensure CodeMirror instance refreshes if the content was set programmatically
			this.$nextTick(() => {
				if (this.$refs.editor && this.$refs.editor.editor) {
					this.$refs.editor.editor.refresh();
				}
			});
		},
		parseError(error) {
			if (error) {
				error = error.substring(0, error.length-1);
				if (error.includes('float') && error.includes('int')){
					error = '(Use 1. instead of 1 for floats) '.concat(error);
				}
				this.error = error;
			}
			else {
				this.error = '';
			}
		},

		select() {
			this.ignore_change = true;
			this.code = JSON.parse(JSON.stringify(this.selected.code));
		}
	},

	watch: {
		code() {
			if (this.ignore_change)
				this.ignore_change = false;
			else
				this.selected = undefined;
			if (this.pendingSetCode) {
				clearTimeout(this.pendingSetCode);
			}

			this.pendingSetCode = setTimeout(() => {
				Controller.activationSource = this.code;
				let error = Controller.apply(true);
				this.parseError(error);
				this.pendingSetCode = 0;
			}, 500);
		}
	}
}

</script>

<style scoped>

#dropdown {
	font-size: 14px;
	text-align: left;
	margin: 10px;
}

#error {
	margin: 5px;
	text-align: left;
	color: rgb(255, 0, 0);
	font-size: 14px;
	font-family: Consolas, 'SourceCodePro-Medium', monaco, monospace;
}
</style>