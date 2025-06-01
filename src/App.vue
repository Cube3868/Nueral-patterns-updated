<template>
  <div id="app">
    <Settings ref="Settings" @save="save_open=true" @load="load_open=true"/>
    <Renderer/>
    <OptionsBox  v-if="save_open" title="Save Current Settings" @close="closeOptions">
		<SaveOptions @close="closeOptions"/>
	</OptionsBox>
    <OptionsBox  v-if="load_open" title="Load Settings" @close="closeOptions">
		<LoadOptions 
			@close="closeOptions"
			@loadConfig="loadConfig"/>
	</OptionsBox>

	<FooterMessage message="**EPILEPSY WARNING** Some patterns can contain rapid flashing lights"/>

  </div>
</template>

<script>
import Renderer from './components/Renderer.vue'
import Settings from './components/Settings.vue'

import OptionsBox from './components/Options/OptionsBox.vue'
import SaveOptions from './components/Options/SaveOptions.vue'
import LoadOptions from './components/Options/LoadOptions.vue'

import FooterMessage from './components/FooterMessage.vue'

document.title = "Neural Patterns";

export default {
	name: 'App',
	components: {
		Renderer,
		Settings,
		OptionsBox,
		SaveOptions,
		LoadOptions,
		FooterMessage
	},
	data() {
		return {
			save_open: false,
			load_open: false
		}
	},
	methods: {
		loadConfig(c, reset) {
			this.$refs.Settings.loadConfig(c, reset);
		},
		closeOptions() {
			this.save_open=false;
			this.load_open=false;
			this.$refs.Settings.setPaused(false);
		}
	}
}
</script>

<style>

@import './assets/css-vars.css';
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
@import './assets/glsl-theme.css';

#app {
	font-family: 'Roboto', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #e0e0e0;
	margin: 0px;
	padding: 0px;
}

html, body{
	height: 100%;
	width: 100%;
	border: none;
	margin: 0px;
	padding: 0px;
	background-color: var(--bg-main-dark, #121212);
}

body{
	line-height: 1.6;
	overflow: hidden;
}

button {
	font-size: 1rem;
	padding: 10px 20px;
	background-color: var(--btn-bg-dark, rgba(50, 50, 50, 0.6));
	color: var(--btn-text-dark, #e0e0e0);
	border: 1px solid var(--btn-border-dark, rgba(255, 255, 255, 0.2));
	border-radius: 0.3rem;
	cursor: pointer;
	transition: background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, border-color 0.15s ease-in-out;
	box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

button:hover {
	background-color: var(--btn-hover-dark, rgba(70, 70, 70, 0.7));
	border-color: var(--btn-hover-border-dark, rgba(255, 255, 255, 0.3));
	box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

button:active {
	background-color: var(--btn-active-dark, rgba(40, 40, 40, 0.8));
	transform: translateY(1px);
	box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

label {
	font-size: 0.9rem;
	color: #b0b0b0;
}

.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}

i {
	width: 100%;
}

a {
	color: #87bfff;
	text-decoration: none;
}
a:hover {
	text-decoration: underline;
}
a:visited {
	color: #c1a7ff;
}

select {
    color: var(--text-color-dark, #e0e0e0);
    background-color: var(--in-bg-dark, rgba(50, 50, 50, 0.7));
    border: 1px solid var(--in-border-dark, rgba(255,255,255,0.2));
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22%23e0e0e0%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M2%205l6%206%206-6z%22/%3E%3C/svg%3E');
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 12px 12px;
}

</style>

