<template>
    <div class="randomization-settings-container">
        <div class="setting-group">
            <label>
                <input type="checkbox" v-model="options.kernel">
                Randomize Kernel & Symmetry
            </label>
        </div>
        <div class="setting-group">
            <label>
                <input type="checkbox" v-model="options.foregroundColor">
                Randomize Foreground Color
            </label>
        </div>
        <div class="setting-group">
            <label>
                <input type="checkbox" v-model="options.backgroundColor">
                Randomize Background Color
            </label>
        </div>
        <div class="setting-group">
            <label>
                <input type="checkbox" v-model="options.persistentPixels">
                Randomize Persistent Pixels
            </label>
        </div>
        <div class="setting-group">
            <label>
                <input type="checkbox" v-model="options.simulationSpeed">
                Randomize Simulation Speed
            </label>
        </div>
        <div class="setting-group">
            <label>
                <input type="checkbox" v-model="options.activationFunction">
                Randomize Activation Function
            </label>
        </div>
        <div class="setting-group">
            <label>
                <input type="checkbox" v-model="options.resetType">
                Randomize Reset Type
            </label>
        </div>
        <div class="setting-group">
            <label>
                <input type="checkbox" v-model="options.zoomLevel">
                Randomize Zoom Level
            </label>
        </div>
    </div>
</template>

<script>
import Controller from '../../js/controller';

export default {
    name: 'RandomizationSettings',
    data() {
        return {
            options: {
                kernel: true,
                foregroundColor: true,
                backgroundColor: true,
                persistentPixels: true,
                simulationSpeed: true,
                activationFunction: true,
                resetType: true,
                zoomLevel: true,
            }
        };
    },
    watch: {
        options: {
            handler(newOptions) {
                // Optional: Could emit an event here if settings need to react immediately
                // Or controller could directly read from this component's data via a ref
                Controller.updateRandomizationOptions(newOptions); // We'll need to add this to Controller
            },
            deep: true
        }
    },
    methods: {
        getOptions() {
            return this.options;
        },
        refreshFromController() {
            // This method will be called to sync with Controller's default randomization options
            if (Controller.randomizationOptions) {
                this.options = JSON.parse(JSON.stringify(Controller.randomizationOptions));
            }
        }
    },
    mounted() {
        this.refreshFromController(); // Initialize with defaults from controller
    }
}
</script>

<style scoped>
.randomization-settings-container {
    padding: 10px 0; /* Add some padding around the groups */
}
.setting-group {
    margin-bottom: 12px;
    padding: 8px;
    background-color: var(--accordion-content-bg, rgba(50, 50, 50, 0.4));
    border-radius: 6px;
}

.setting-group label {
    display: flex; /* Changed to flex */
    align-items: center; /* Vertically align items */
    font-size: 14px;
    color: var(--text-color-primary, #E0E0E0);
    cursor: pointer;
}

.setting-group input[type="checkbox"] {
    margin-right: 10px; /* Space between checkbox and label text */
    width: auto; /* Override panel-wide input styles */
    margin-bottom: 0; /* Override panel-wide input styles */
    /* Style checkboxes for a more modern feel if desired */
    /* Example: custom checkbox appearance */
    appearance: none;
    -webkit-appearance: none;
    background-color: var(--in-bg-blur, rgba(30,30,30,0.6));
    border: 1px solid var(--in-border-blur, rgba(70,70,70,0.5));
    padding: 8px; /* Make it square */
    border-radius: 4px;
    display: inline-block;
    position: relative;
    cursor: pointer;
}

.setting-group input[type="checkbox"]:checked {
    background-color: var(--accent-color, #007aff); /* Apple-like blue */
    border-color: var(--accent-color, #007aff);
}

.setting-group input[type="checkbox"]:checked::after {
    content: '\2713'; /* Checkmark character */
    font-size: 12px;
    color: white;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

</style> 