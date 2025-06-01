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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
@import './assets/glsl-theme.css';

#app {
	font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin: 0px;
	padding: 0px;
}

html, body{
	height: 100%;
	width: 100%;
	border: none;
	margin: 0px;
	padding: 0px;
	background-color: var(--bg-main, black);
}

body{
	line-height: 1.6;
	overflow: hidden;
}

button {
	font-size: 14px;
	padding: 8px 15px;
	background-color: var(--btn-bg, rgba(80, 80, 80, 0.7));
	color: var(--btn-text, white);
	border: 1px solid var(--btn-border, rgba(100, 100, 100, 0.5));
	border-radius: 6px;
	cursor: pointer;
	transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.1s ease;
}

button:hover {
	background-color: var(--btn-hover, rgba(95, 95, 95, 0.8));
	border-color: var(--btn-hover-border, rgba(120, 120, 120, 0.7));
}

button:active {
	background-color: var(--btn-active, rgba(70, 70, 70, 0.9));
	border-style: solid;
	transform: translateY(1px) scale(0.98);
}

label {
	font-size: 15px;
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
	color: rgb(80, 80, 255);
}
a:visited {
	color: rgb(216, 116, 255);
}

select {
    color: var(--text-color, white);
    background-color: var(--in-bg, rgba(50, 50, 50, 0.7));
    border: 1px solid var(--in-border, rgba(80, 80, 80, 0.5));
    padding: 8px 12px;
    border-radius: 6px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5z%22%20fill%3D%22%23FFFFFF%22%2F%3E%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 12px;
}

</style>

