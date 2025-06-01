<template>
    <div id='settings-panel' :class="{ 'is-hidden': hide_settings }">
        <div id='header'>
            <button id='hide-button' @click="hide_settings = !hide_settings" :title="hide_settings ? 'Show settings panel (V)' : 'Hide settings panel (V)'"><i class="fa" :class="hide_settings ? 'fa-eye' : 'fa-eye-slash'"></i></button>
            Neural Patterns
        </div>

        <div id='hotbar' :class="{ 'is-active': !hide_settings}">
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
            hide_settings: true,
        }
    },
    mounted(){
        Controller.settingsVue = this;
    },
    methods:{
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
    max-width: 360px; /* Adjusted max-width */
    margin: 20px;
    color: var(--text-color-primary, #E0E0E0); /* Brighter text for better contrast on blur */
    background-color: var(--panel-bg-blur, rgba(45, 45, 45, 0.65)); /* Dark, semi-transparent */
    backdrop-filter: blur(18px) saturate(180%);
    -webkit-backdrop-filter: blur(18px) saturate(180%);
    border: 1px solid var(--panel-border-blur, rgba(80, 80, 80, 0.4));
    border-radius: 12px; /* Softer, more Apple-like rounded corners */
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    overflow: hidden; /* Needed for border-radius on children and for smooth transition */
    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 40px); /* Prevent panel from being taller than viewport */
}

#settings-panel.is-hidden {
    transform: translateY(-20px);
    opacity: 0;
    pointer-events: none; /* Allow clicks to pass through when hidden */
    /* visibility: hidden; */ /* Can cause layout shifts, opacity/transform preferred */
}


#hotbar {
    display: flex;
    justify-content: space-around; /* Distribute buttons evenly */
    align-items: center;
    padding: 8px 10px;
    background-color: var(--hotbar-bg-blur, rgba(35, 35, 35, 0.75));
    backdrop-filter: blur(12px) saturate(150%);
    -webkit-backdrop-filter: blur(12px) saturate(150%);
    border-top: 1px solid var(--panel-border-blur, rgba(70, 70, 70, 0.3));
    /* border-bottom: 1px solid var(--panel-border-blur, rgba(70, 70, 70, 0.3)); */
    /* Removed bottom border for seamless look when panel open */
    position: fixed; /* Make hotbar fixed at the top of the viewport within settings panel's influence */
    bottom: 20px; /* Position it from the bottom */
    left: 20px;
    width: 360px; /* Match panel width */
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.25);
    z-index: 101; /* Above settings panel when settings are hidden */
    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

/* When settings panel is SHOWN, hotbar is integrated and not fixed */
#settings-panel:not(.is-hidden) #hotbar {
    position: relative; /* Revert to normal flow within the panel */
    bottom: auto;
    left: auto;
    width: auto; /* Let it take the panel's width */
    border-radius: 0; /* No specific radius, it's part of the panel now */
    box-shadow: none; /* No separate shadow */
    border-top: none; /* No top border if it's the first visible element */
    border-bottom: 1px solid var(--panel-border-blur, rgba(70, 70, 70, 0.3)); /* Line to separate from accordion content */
    margin: 0; /* Remove fixed positioning margins */
    padding: 10px; /* Standard padding */
}


#settings-panel.is-hidden + #hotbar {
    /* This style might not be necessary if hotbar is always visible or part of settings-panel */
    /* Styles for hotbar when settings are hidden, if it were a separate always-visible element */
}

#hotbar button {
    background-color: transparent; /* Make hotbar buttons more subtle */
    border: none;
    color: var(--text-color-secondary, #B0B0B0);
    padding: 6px 10px;
    font-size: 13px;
    border-radius: 5px;
}

#hotbar button .fa {
    margin-right: 4px;
}

#hotbar button:hover {
    background-color: var(--btn-hover-subtle, rgba(255,255,255,0.1));
    color: var(--text-color-primary, #E0E0E0);
}
#hotbar button:active {
    background-color: var(--btn-active-subtle, rgba(255,255,255,0.05));
}

/* Specific for the main action buttons if they remain in hotbar and need emphasis */
#hotbar #randomize-all-btn, #hotbar #mutate-btn, #hotbar #reset-defaults-btn, #hotbar #clear-btn {
    /* background-color: var(--btn-bg, rgba(80, 80, 80, 0.7)); */ /* Keep them distinct */
    /* color: var(--btn-text, white); */
    /* border: 1px solid var(--btn-border, rgba(100, 100, 100, 0.5)); */
    /* Using transparent style like other hotbar buttons for consistency now */
}

#hotbar #hide-button-inline {
    /* margin-left: auto; */ /* Pushes it to the right */
}


#header{
    width:100%;
    padding: 12px 15px;
    font-size: 1.1em;
    font-weight: 500; /* Slightly bolder header text */
    text-align: center; /* Center title */
    border-bottom: 1px solid var(--panel-border-blur, rgba(70,70,70,0.3));
    /* background-color: rgba(0,0,0,0.1); */ /* Subtle header background if needed */
    position: relative; /* For positioning the hide button */
}

#hide-button{
    position: absolute; /* Position relative to header */
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: var(--text-color-secondary, #B0B0B0);
    font-size: 18px;
    padding: 5px;
    cursor: pointer;
    border-radius: 5px;
}
#hide-button:hover{
    color: var(--text-color-primary, #E0E0E0);
    background-color: var(--btn-hover-subtle, rgba(255,255,255,0.1));
}

#main-content{
    width:100%;
    overflow-y: auto; /* Allow content to scroll */
    padding: 0px 15px 15px 15px; /* Padding for accordion items */
    flex-grow: 1; /* Takes up available space */
}

#footer {
    padding: 10px 15px;
    border-top: 1px solid var(--panel-border-blur, rgba(70,70,70,0.3));
    /* background-color: rgba(0,0,0,0.1); */ /* Subtle footer background if needed */
    text-align: center; /* Center button group */
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

