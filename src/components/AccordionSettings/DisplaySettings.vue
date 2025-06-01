<template>
    <div id="display-settings">
        <input class='color' id='color' type='color' v-model="hexColor">
        <label for='color'> Foreground Color</label>
        <br>
        <input class='color' id='bg-color' type='color' v-model="bgColor">
        <label for='bg-color'> Background Color</label>
        <br>
        <label for='simulation-speed'>Simulation Speed (steps/update): </label>
        <input id='simulation-speed' type='number' v-model.number="simulationSpeedValue" min="1" step="1" title="Number of simulation steps per visual screen update.">
        <br>
        <input id='persistent' type='checkbox' v-model="persistent" :title="persistent_tooltip" @change="setPersistent()">
        <label for='persistent' :title="persistent_tooltip">Persistent pixels</label>
        <br>
        <input id='randomize-color' type='checkbox' v-model="always_randomize" :title="randomize_tooltip">
        <label for='randomize-color' :title="randomize_tooltip">Always randomize color</label>
        <div class="setting-item">
            <label for='zoom-level'>Zoom Level: </label>
            <input id='zoom-level' type='number' v-model.number="zoomLevelValue" min="1" step="1" title="Higher values make the grid appear larger/more zoomed out.">
        </div>
    </div>
</template>

<script>
import Controller from '../../js/controller';
import Utils from '../../js/utils';

export default {
    name: 'DisplaySettings',
    data() {
        return {
            rgbColor: [0, 0, 0],
            hexColor: '#000000',
            bgColor: '#000000',
            simulationSpeedValue: Controller.renderer ? Controller.renderer.simulationSpeed : 1,
            persistent: false,
            always_randomize: true,
            simulationSpeedTooltip: 'Number of simulation steps calculated per visual screen update. Higher is faster.',
            persistent_tooltip: "If true, pixels are not reset to zero after each step.\nUseful for some types of CA (e.g. Game of Life).",
            randomize_tooltip: "If true, color is randomized on each randomize action.",
            zoomLevelValue: Controller.zoomLevel || 1,
            zoomLevelTooltip: "Controls the logical grid size. Higher values zoom out."
        }
    },

    mounted() {
        this.rgbColor = Controller.color;
        this.hexColor = Utils.rgbToHex(Controller.color);
        this.bgColor = Controller.bgColor || '#000000';
    },

    methods: {
        refreshFromController() {
            // Update foreground color
            this.rgbColor = Controller.color;
            this.hexColor = Utils.rgbToHex(Controller.color);
            
            // Update background color
            this.bgColor = Controller.bgColor;
            // The watch on bgColor will update document.body.style

            // Update persistent checkbox
            this.persistent = Controller.persistent;

            // Update simulationSpeedValue
            if (Controller.renderer) { 
                this.simulationSpeedValue = Controller.renderer.simulationSpeed;
            }

            // Update zoom level
            this.zoomLevelValue = Controller.zoomLevel || 1;

            // Update skip frames
            if (Controller.renderer) {
                this.skip_frames = Controller.renderer.skip_frames;
            }
        },

        randomize() {
            this.rgbColor = Utils.randomColor();
            this.hexColor = Utils.rgbToHex(this.rgbColor);
            this.changeColor();
        },

        changeColor() {
            Controller.setColor(Utils.hexToRgb(this.hexColor));
        },

        setColor(col) {
            this.rgbColor = col;
            this.hexColor = Utils.rgbToHex(col);
        },

        setPersistent() {
            Controller.setPersistent(this.persistent)
        },

        setSimulationSpeed(newValue) {
            Controller.setSimulationSpeed(newValue);
        },

        setZoomLevel(level) {
            Controller.setZoomLevel(level);
        }
    },
    watch: {
        hexColor() {
            this.changeColor()
        },
        bgColor(newVal) {
            Controller.bgColor = newVal;
            document.body.style = "background-color: "+newVal;
        },
        simulationSpeedValue(newVal) {
            const speed = parseInt(newVal, 10);
            if (Controller.renderer && !isNaN(speed) && speed >= 1) {
                Controller.renderer.simulationSpeed = speed;
            }
        },
        zoomLevelValue(newVal) {
            const level = parseInt(newVal, 10);
            if (!isNaN(level) && level >= 1) {
                Controller.setZoomLevel(level);
            }
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#display-settings {
    margin: 0; /* Remove specific margin, rely on accordion padding */
    text-align: left;
}

/* Remove .randomize-options as it's no longer used */

.color {
    /* background-color: rgb(61, 21, 112); */ /* Old purple color */
    background-color: var(--in-bg-blur, rgba(30,30,30,0.6));
    border: 1px solid var(--in-border-blur, rgba(70,70,70,0.5));
    border-radius: 4px;
    width: 30px; /* Adjust size as needed */
    height: 30px;
    padding: 0; /* Remove padding for color inputs */
    cursor: pointer;
    margin-right: 5px;
    vertical-align: middle;
}

/* Style the color input's picker indicator if possible (browser dependent) */
.color::-webkit-color-swatch-wrapper {
    padding: 0;
}
.color::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
}
.color::-moz-color-swatch {
    border: none;
    border-radius: 3px;
}

#simulation-speed, 
#zoom-level /* Apply to zoom-level input as well */
{
    width: 70px; /* Standardized width */
    margin-top: 0; /* Align with label */
    margin-bottom: 10px; /* Consistent bottom margin */
    /* General input styles are inherited from Settings.vue, but can override here if needed */
}

.setting-item {
    margin-top: 15px; /* Increased margin */
    padding-top: 10px;
    border-top: 1px solid var(--accordion-border, rgba(80, 80, 80, 0.3));
}

#display-settings br {
    display: none; /* Remove <br> tags, use margins for spacing */
}

#display-settings label,
#display-settings input[type="checkbox"] + label {
    margin-bottom: 10px; /* Spacing for labels */
    display: inline-block; /* Allow margin-bottom */
}

#display-settings input[type="checkbox"] {
    vertical-align: middle;
    margin-right: 8px;
}

</style>
