<template>
    <div id='settings-panel'>
        <div id='header'>
            <button id='hide-button' @click="hide_settings = !hide_settings" :title="hide_settings ? 'Show settings panel (V)' : 'Hide settings panel (V)'"><i class="fa" :class="hide_settings ? 'fa-eye' : 'fa-eye-slash'"></i></button>
            <div class="header-title">Neural Patterns</div>
            <div class="header-placeholder"></div>
        </div>

        <div id='hotbar' :class="{ 'is-active': !hide_settings}" v-show="!hide_settings">
            <button id='play-pause-btn' v-on:click="togglePlay()" :title="is_playing ? 'Pause simulation (Space)' : 'Play simulation (Space)'"><i class='fa' :class='is_playing ? "fa-pause" : "fa-play"'></i></button>
            <button id='step-btn' v-on:click="stepOnce()" title='Advance simulation by one step (A)'><i class='fa fa-step-forward'></i></button>
            <button id='randomize-all-btn' v-on:click="randomizeAll()" title="Randomize all settings (R). Uses options from 'Randomization Settings'."><i class='fa fa-random'></i> Randomize</button>
            <button id='mutate-btn' v-on:click="mutateSettings()" title='Slightly change one random current setting (M).'><i class='fa fa-flask'></i> Mutate</button>
            <button id='reset-defaults-btn' v-on:click="resetAllToDefaults()" title='Reset all settings to their initial defaults (D).'><i class='fa fa-undo'></i> Reset</button>
            <button id='clear-btn' v-on:click="clearCanvas()" title='Clear the canvas to background color (C).'><i class='fa fa-eraser'></i> Clear</button>
            <button id='hide-button-inline' @click="hide_settings = !hide_settings" :title="hide_settings ? 'Show settings panel (V)' : 'Hide settings panel (V)'"><i class="fa" :class="hide_settings ? 'fa-chevron-down' : 'fa-chevron-up'"></i> {{ hide_settings ? 'Show Settings' : 'Hide Settings' }}</button>
        </div>

        <div id="main-content" v-show="!hide_settings">
            <AccordionItem title='About' :start_open=false>
                <About/>
            </AccordionItem>

            <AccordionItem title='State & Reset Type'>
                <StateSettings ref='stateSettings'/>
            </AccordionItem>

            <AccordionItem title='Filter & Symmetry (Kernel)'>
                <FilterSettings ref='filterSettings'/>
            </AccordionItem>

            <AccordionItem title='Display & Colors'> 
                <DisplaySettings ref='displaySettings'/>
            </AccordionItem>

            <AccordionItem title='Activation Function (GLSL)'>
                <ActivationSettings ref='activationSettings'/>
            </AccordionItem>

            <AccordionItem title='Randomization Options'>
                <RandomizationSettings ref='randomizationSettings'/>
            </AccordionItem>
            
            <AccordionItem title='Load/Save Options'>
                <LoadSaveOptions ref='loadSaveOptions'/>
            </AccordionItem>
        </div>

        <div id='footer' v-show="!hide_settings">
            <div class="button-group">
            </div>
        </div>

    </div>
</template>

<script>
import Controller from '../js/controller';
import AccordionItem from './AccordionSettings/AccordionItem'
import About from './AccordionSettings/About.vue'
import StateSettings from './AccordionSettings/StateSettings'
import FilterSettings from './AccordionSettings/FilterSettings'
import DisplaySettings from './AccordionSettings/DisplaySettings'
import ActivationSettings from './AccordionSettings/ActivationSettings'
import RandomizationSettings from './AccordionSettings/RandomizationSettings';
import LoadSaveOptions from './Options/LoadOptions.vue'

export default {
    name: 'SettingsPanel',
    components: {
        AccordionItem,
        About,
        StateSettings,
        FilterSettings,
        DisplaySettings,
        ActivationSettings,
        RandomizationSettings,
        LoadSaveOptions,
    },
    data() {
        return {
            is_playing: Controller.playing,
            hide_settings: false,
        }
    },
    mounted(){
        Controller.settingsVue = this;
        this.adjustHeaderPlaceholder(); // Call on mount
    },
    updated() {
        this.adjustHeaderPlaceholder(); // Call on updates (e.g. when hide_settings changes)
    },
    methods:{
        adjustHeaderPlaceholder() {
            this.$nextTick(() => { // Ensure DOM is updated
                const button = this.$el.querySelector('#hide-button');
                const placeholder = this.$el.querySelector('.header-placeholder');
                if (button && placeholder) {
                    placeholder.style.width = button.offsetWidth + 'px';
                }
            });
        },
        togglePlay(){
            Controller.togglePlay();
            this.is_playing = Controller.playing;
        },
        stepOnce(){
            if (!this.is_playing)
                Controller.step();
        },
        randomizeAll(){
            const options = this.$refs.randomizationSettings.getOptions();
            Controller.randomizeAllParameters(options);
            this.refreshAllSettingsPanels();
        },
        mutateSettings(){
            Controller.mutateCurrentSettings();
            this.refreshAllSettingsPanels();
        },
        resetAllToDefaults(){
            Controller.resetAllSettingsToDefaults();
            this.refreshAllSettingsPanels();
        },
        clearCanvas(){
            Controller.resetState('empty'); // Clears the canvas
        },
        refreshAllSettingsPanels(){
            this.$refs.filterSettings.refreshFromController();
            this.$refs.displaySettings.refreshFromController();
            this.$refs.activationSettings.refreshFromController();
            this.$refs.stateSettings.refreshFromController();
            this.$refs.randomizationSettings.refreshFromController(); // Ensure this also updates if defaults change
        },
        handleHotkeys(event){
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.classList.contains('CodeMirror-line')) {
                return; // Don't trigger hotkeys if typing in an input/textarea or codemirror
            }

            switch(event.key.toLowerCase()){
                case(' '):{ // Spacebar
                    this.togglePlay();
                    event.preventDefault(); // prevent page scroll
                    break;
                }
                case('r'): {
                    this.randomizeAll();
                    break;
                }
                case('m'): { // Hotkey for Mutate
                    this.mutateSettings();
                    break;
                }
                case('d'): { // Hotkey for Reset Defaults
                    this.resetAllToDefaults();
                    break;
                }
                case('c'): { // Hotkey for Clear
                    this.clearCanvas();
                    break;
                }
                case('s'): { // This was for reset('empty') - now covered by 'c'
                    // this.$refs.stateSettings.reset('empty'); // Kept for reference, but 'c' is more direct
                    break;
                }
                case('a'): {
                    if (!this.is_playing)
                        this.stepOnce();
                    break;
                }
                case('v'): {
                    this.hide_settings = !this.hide_settings;
                    break;
                }
                // Add more hotkeys here as needed
            }
        }
    },
    created() {
        window.addEventListener('keydown', this.handleHotkeys);
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleHotkeys);
    },
}
</script>

<style>

#settings-panel {
    position: fixed;
    z-index: 100;
    width: 100%;
    max-width: 400px;
    margin: 20px;
    color: var(--text-color-primary-dark, #e0e0e0); /* Light text for dark panel */
    background-color: var(--panel-bg-blur-dark, rgba(30, 30, 30, 0.75)); /* Dark semi-transparent */
    backdrop-filter: blur(15px) saturate(180%); /* Enhanced blur */
    -webkit-backdrop-filter: blur(15px) saturate(180%);
    border: 1px solid var(--panel-border-blur-dark, rgba(255, 255, 255, 0.15)); /* Subtle light border */
    border-radius: 12px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); /* Adjusted shadow for dark theme */
    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 40px);
}

/*
#settings-panel.is-hidden {
    transform: translateY(-20px);
    opacity: 0;
    /* pointer-events: none; */ /* Allow clicks on the fixed hotbar */
    /* visibility: hidden; */ /* Can cause layout shifts, opacity/transform preferred */
/* }
*/


#header {
    padding: 8px 12px;
    font-size: 1rem;
    font-weight: 500;
    color: var(--header-text-dark, #f0f0f0); /* Light header text */
    background-color: var(--header-bg-blur-dark, rgba(40, 40, 40, 0.7)); /* Darker semi-transparent header */
    border-bottom: 1px solid var(--panel-border-blur-dark, rgba(255, 255, 255, 0.1));
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
}

.header-title {
    flex-grow: 1;
    text-align: center;
    color: var(--text-color-primary-dark, #e0e0e0); /* Light title text */
}

#header #hide-button {
    background-color: transparent;
    color: var(--text-color-secondary-dark, #b0b0b0); /* Light icon color */
    border: none;
    font-size: 0.9rem;
    flex-shrink: 0;
}

.header-placeholder {
    visibility: hidden;
    flex-shrink: 0;
}

#header #hide-button:hover {
    color: #ffffff; /* Brighter on hover */
    background-color: rgba(255,255,255,0.1);
}

#hotbar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 6px 8px;
    background-color: var(--hotbar-bg-blur-dark, rgba(35, 35, 35, 0.65)); /* Dark semi-transparent hotbar */
    border-bottom: 1px solid var(--panel-border-blur-dark, rgba(255, 255, 255, 0.1));
}

#hotbar button {
    padding: 5px 8px;
    font-size: 0.8rem;
    background-color: rgba(255,255,255, 0.1); /* Light, semi-transparent buttons on dark bg */
    color: #e0e0e0; /* Light text for buttons */
    border: 1px solid rgba(255,255,255,0.2);
}
#hotbar button:hover {
    background-color: rgba(255,255,255, 0.2);
    border-color: rgba(255,255,255,0.3);
}

#hotbar button i.fa {
    margin-right: 5px; /* Space between icon and text if any */
}

/* Ensure the hide button in the hotbar (if it's different from the header one) is styled */
#hotbar #hide-button-inline {
    /* Similar to header hide button or global button style */
    /* This might be redundant if the main header button is always visible */
}

#main-content {
    overflow-y: auto;
    flex-grow: 1;
    padding: 10px;
    background-color: transparent; /* Content background should be transparent to see panel bg */
}

#footer {
    padding: 10px 15px;
    background-color: var(--footer-bg-blur, rgba(255, 255, 255, 0.6)); /* Semi-transparent footer */
    border-top: 1px solid var(--panel-border-blur, rgba(255, 255, 255, 0.25));
    border-bottom-left-radius: 12px; /* Match panel radius */
    border-bottom-right-radius: 12px; /* Match panel radius */
}

#footer .button-group {
    display: flex;
    justify-content: center; /* Center buttons within the group */
    gap: 10px; /* Space between buttons */
}

/* General input styling (can be overridden by specific components) */
#settings-panel input[type="text"],
#settings-panel input[type="number"],
#settings-panel select {
    background-color: var(--in-bg-blur, rgba(30,30,30,0.6));
    color: var(--text-color-primary, #E0E0E0);
    border: 1px solid var(--in-border-blur, rgba(70,70,70,0.5));
    border-radius: 5px;
    padding: 6px 8px;
    margin: 2px 0;
    font-size: 14px;
}
#settings-panel input[type="text"]:focus,
#settings-panel input[type="number"]:focus,
#settings-panel select:focus {
    border-color: var(--in-border-focus, rgba(100, 130, 255, 0.8));
    outline: none;
    box-shadow: 0 0 0 2px rgba(100, 130, 255, 0.2);
}

#settings-panel input[type="checkbox"] {
    margin-right: 5px;
    vertical-align: middle;
    accent-color: var(--accent-color, #70a0ff); /* For modern checkbox color */
}

#settings-panel label {
    color: var(--text-color-secondary, #B0B0B0);
    font-size: 14px;
    margin-bottom: 3px;
    display: inline-block;
}

</style>

