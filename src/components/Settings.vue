<template>
    <div>
        <div id="settings-panel" v-show="panel_open&&!hide_settings">
            <div id='header'>
                <button id="min-btn" v-on:click="setOpen(false)"><i class="fa fa-minus"></i></button>
                <button id="save-btn" v-on:click="$emit('save');setPaused(true);" v-if="!IsMobile">Save</button>
                <button id="load-btn" v-on:click="$emit('load');setPaused(true);">Load</button>
            </div>
            <div id='accordion'>
                <AccordionItem title='About'>
                    <About/>
                </AccordionItem>
                <AccordionItem title='Restart Options'>
                    <StateSettings ref='stateSettings'/>
                </AccordionItem>
                <AccordionItem title='Filter' :start_open=true>
                    <FilterSettings ref='filterSettings'/>
                </AccordionItem>
                <AccordionItem title='Activation' :start_open=true>
                    <ActivationSettings ref='activationSettings'/>
                </AccordionItem>
                <AccordionItem title='Display'> 
                    <DisplaySettings ref='displaySettings'/>
                </AccordionItem>
                <AccordionItem title='Randomization Options' :start_open=false>
                    <RandomizationSettings ref='randomizationSettings'/>
                </AccordionItem>
            </div>
            <div id='footer'>
                <button id='pause-btn' v-on:click="pauseToggle()" title='Pause/Play. Hotkey: Spacebar'>
                    <i class="fa fa-pause" v-if=is_playing></i>
                    <i class="fa fa-play" v-else></i>
                </button>
                <button id='step-btn' v-on:click="step()" v-if=!is_playing title='Step the simulation once. Hotkey: A'>
                    <i class="fa fa-step-forward"></i>
                </button>
                <button id='randomize-btn' v-on:click="randomize()" title='Randomize filter and color. Hotkey: F'>Randomize</button>
                <button id='reset-btn' v-on:click="reset()" title='Reset all pixel values as defined in Restart Options. Hotkey: D'>Restart</button>
                <button id='randomize-all-btn' v-on:click="randomizeAll()" title='Randomize kernel, colors, symmetry, and reset type. Hotkey: R'>Randomize All</button>
                <button id='mutate-btn' v-on:click="mutateSettings()" title='Slightly change one of the current settings.'>Mutate</button>
                <button id='reset-defaults-btn' v-on:click="resetAllToDefaults()" title='Reset all settings to their initial defaults.'>Reset Defaults</button>
                <button id='clear-btn' v-on:click="clearCanvas()" title='Clear the canvas. Hotkey: C'>Clear</button>
            </div>
        </div>
        <div id="hotbar" v-show="!panel_open&&!hide_settings">
            <button id='settings-btn' v-on:click="setOpen(true)">
                <i class="fa fa-gear"></i>
            </button>
            <button id='pause-btn-hot' v-on:click="pauseToggle()" title='Pause/Play. Hotkey: Spacebar'>
                <i class="fa fa-pause" v-if=is_playing></i>
                <i class="fa fa-play" v-else></i>
            </button>
            <button id='randomize-btn-hot' v-on:click="randomize()" title='Randomize filter and color. Hotkey: F'>Randomize</button>
        </div>

    </div>
</template>

<script>
import Utils from '../js/utils'
import Controller from '../js/controller'
import IsMobile from '../js/ismobile'

import AccordionItem from './AccordionSettings/AccordionItem'
import About from './AccordionSettings/About'
import StateSettings from './AccordionSettings/StateSettings'
import FilterSettings from './AccordionSettings/FilterSettings'
import DisplaySettings from './AccordionSettings/DisplaySettings'
import ActivationSettings from './AccordionSettings/ActivationSettings'
import RandomizationSettings from './AccordionSettings/RandomizationSettings'


export default {
    name: 'Settings',
    components: {
        AccordionItem,
        About,
        StateSettings,
        FilterSettings,
        DisplaySettings,
        ActivationSettings,
        RandomizationSettings,
    },
    data() {
        return {
            filter: Utils.randomKernel(),
            is_playing: true,
            panel_open: !IsMobile,
            IsMobile: IsMobile,
            hide_settings: false,
        }
    },
    mounted() {
        document.body.onkeyup = (e) => {
        let focused = document.activeElement.tagName;
        if (focused !== "INPUT" && focused !== "TEXTAREA") {
                switch (e.key.toLowerCase()) {
                    case(' '): {
                        this.pauseToggle();
                        if (focused ==="BUTTON") 
                            e.preventDefault();
                        break;
                    }
                    case('f'): {
                        this.randomize();
                        break;
                    }
                    case('r'): {
                        this.randomizeAll();
                        break;
                    }
                    case('d'): {
                        this.$refs.stateSettings.reset();
                        break;
                    }
                    case('s'): {
                        this.$refs.stateSettings.reset('empty');
                        break;
                    }
                    case('a'): {
                        if (!this.is_playing)
                            this.step();
                        break;
                    }
                    case('v'): {
                        this.hide_settings = !this.hide_settings;
                        break;
                    }
                    case('c'): { // Hotkey for Clear Canvas
                        this.clearCanvas();
                        break;
                    }
                }
            }
        }
    },
    methods: {
        pauseToggle() {
            Controller.pauseToggle();
            this.is_playing = !Controller.paused;
        },
        resetAllToDefaults() {
            Controller.resetAllSettingsToDefaults();
            this.is_playing = !Controller.paused; // Should be false after defaults

            // Refresh UI of child components
            this.$refs.filterSettings.refreshSymmetryFlagsAndInputs();
            this.$refs.displaySettings.refreshFromController();
            this.$refs.activationSettings.refreshFromController();
            this.$refs.stateSettings.refreshFromController(); // Assuming/hoping StateSettings has or will have this
            if (this.$refs.randomizationSettings) {
                this.$refs.randomizationSettings.refreshFromController();
            }
        },
        randomizeAll() {
            const randomizationOptions = this.$refs.randomizationSettings 
                ? this.$refs.randomizationSettings.getOptions() 
                : Controller.randomizationOptions;

            Controller.randomizeAllParameters(randomizationOptions);
            this.is_playing = !Controller.paused; // Update playing state
            this.$refs.filterSettings.refreshSymmetryFlagsAndInputs(); // Refresh filter UI
            this.$refs.displaySettings.refreshFromController(); // Refresh display UI
            this.$refs.activationSettings.refreshFromController(); // Refresh activation UI
            this.$refs.stateSettings.refreshFromController(); // Refresh state settings UI
        },
        setPaused(paused) {
            Controller.setPaused(paused);
            this.is_playing = !Controller.paused;
        },
        step() {
            Controller.step();
        },
        randomize() {
            this.$refs.filterSettings.randomize();
            if (this.$refs.displaySettings.always_randomize)
                this.$refs.displaySettings.randomize();
            if (this.$refs.stateSettings.reset_on_random)
                this.reset();
        },
        reset() {
            this.$refs.stateSettings.reset();
        },
        loadConfig(config, reset) {
            //restart options
            this.$refs.stateSettings.persistent = config.persistent;
            this.$refs.stateSettings.active_button = config.active_button;

            //filter
            this.$refs.filterSettings.clearSymmetry();
            this.$refs.filterSettings.hor_sym = Boolean(config.hor_sym);
            this.$refs.filterSettings.ver_sym = Boolean(config.ver_sym);
            this.$refs.filterSettings.full_sym = Boolean(config.full_sym);
            this.$refs.filterSettings.setSymmetry(2);
            this.$refs.filterSettings.setFilter(config.filter);

            //activation
            this.$refs.activationSettings.code = config.activation;

            // display settings
            if (config.color === "random")
                this.$refs.displaySettings.randomize();
            else
                this.$refs.displaySettings.setColor(config.color);

            let bg_color = config.bg_color ? config.bg_color : '#000000';
            this.$refs.displaySettings.bgColor = bg_color;

            this.$refs.displaySettings.persistent = config.persistent;
            this.$refs.displaySettings.skip_frames = config.skip_frames;
            this.$refs.displaySettings.setSkipFrames();

            Controller.load(config, reset);
        },
        setOpen(open) {
            this.panel_open=open;
        },
        mutateSettings() {
            Controller.mutateCurrentSettings();
            // After mutation, refresh all settings panels to reflect changes
            this.$refs.filterSettings.refreshSymmetryFlagsAndInputs();
            this.$refs.displaySettings.refreshFromController();
            this.$refs.activationSettings.refreshFromController();
            this.$refs.stateSettings.refreshFromController();
            this.is_playing = !Controller.paused; // Ensure UI reflects playing state
        },
        clearCanvas() {
            Controller.resetState('empty');
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
    border-radius: 12px; /* Softer, more Apple-like radius */
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25); /* More pronounced shadow for depth */
    overflow: hidden;
}

#header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 10px 15px;
    height: auto;
    /* No border or different background needed, panel blur will show through */
}

#header button {
    margin-left: 10px;
    background-color: transparent; /* Make header buttons more subtle */
    border: none;
    padding: 6px;
}
#header button:hover {
    background-color: rgba(255,255,255,0.1);
}


#min-btn {
    margin-right: auto;
}

#accordion {
    max-height: calc(90vh - 120px); /* Adjusted for padding/header/footer */
    overflow-y: auto;
    padding: 0 15px 15px 15px; /* Padding around accordion items */
}

#footer {
    padding: 12px 15px;
    /* No border or different background, panel blur shows */
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
}

#footer button {
    flex-grow: 1; /* Allow buttons to grow and fill space */
    background-color: var(--footer-btn-bg, rgba(60,60,60,0.7));
}

#footer button:hover {
    background-color: var(--footer-btn-hover, rgba(75,75,75,0.8));
}

#hotbar {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 99;
    background-color: var(--panel-bg-blur, rgba(45, 45, 45, 0.65));
    backdrop-filter: blur(18px) saturate(180%);
    -webkit-backdrop-filter: blur(18px) saturate(180%);
    padding: 10px;
    border-radius: 10px;
    border: 1px solid var(--panel-border-blur, rgba(80, 80, 80, 0.4));
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    display: flex;
    gap: 10px;
}

#hotbar button {
    background-color: transparent;
    border: none;
    padding: 8px;
}
#hotbar button:hover {
    background-color: rgba(255,255,255,0.1);
}

/* General improvements for inputs within settings */
#settings-panel input[type="text"],
#settings-panel input[type="number"],
#settings-panel select {
    width: 100%; /* Simpler width */
    padding: 10px;
    margin-bottom: 10px;
    background-color: var(--in-bg-blur, rgba(30,30,30,0.6));
    color: var(--text-color-primary, #E0E0E0);
    border: 1px solid var(--in-border-blur, rgba(70,70,70,0.5));
    border-radius: 8px;
    box-sizing: border-box;
}

#settings-panel label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: var(--text-color-secondary, #B0B0B0); /* Softer label color */
}

</style>

