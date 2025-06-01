<template>
    <div id="state-settings">
        <button  v-for="val in reset_types" :key="val.type" 
            type='button'
            :title="val.tooltip"
            v-bind:class="{selected: selected_type === val.type}"
            v-on:click="reset(val.type)">
                {{val.title}}
        </button>
        <br>
        <button type='button' id='empty' v-on:click="reset('empty')" title='Set all pixels to 0. Hotkey: S'>Clear</button>
        <br>
        Restart on randomize: <input id='reset-on-random' type='checkbox' v-model="reset_on_random">
    </div>
</template>

<script>
import Controller from '../../js/controller';

export default {
    name: 'StateSettings',
    data() {
        return {
            reset_types: [
                {type: 'random', title: 'Random Floats', tooltip: 'Random decimal values between 0 and 1'},
                {type: 'random_bool', title: 'Random Ints', tooltip: 'Random 1s and 0s'},
                {type: 'center', title: 'Center', tooltip: 'A single 1 in the center'},
                {type: 'center_top', title: 'Center Top', tooltip: 'A single 1 at the top (wraps to bottom)'}
            ],
            selected_type: Controller.reset_type,
            reset_on_random: true
        }
    },

    methods: {
        reset(type=undefined) {
            if (type!==undefined && type!==`empty`) {
                this.selected_type = type;
            }
            Controller.resetState(type);
        },
        refreshFromController() {
            this.selected_type = Controller.reset_type;
            // reset_on_random could also be reset to a default if desired, e.g.:
            // this.reset_on_random = true; 
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#state-settings {
    margin-top: 5px;
    margin-bottom: 5px;
    font-size: 14px;
    /* Buttons will inherit global styles from App.vue now */
}

button {
    /* Ensure these buttons also have some margin if they are stacked or wrapped */
    margin: 4px;
}

button:not(#empty) {
    width: 120px;
    /* Global button styles will apply, this width can remain if desired */
}

.selected {
    /* background-color: rgb(160, 127, 20); */ /* Old gold color */
    background-color: var(--btn-selected-bg, rgba(100, 100, 100, 0.85)); /* New selected color - slightly darker/more opaque */
    border-color: var(--btn-selected-border, rgba(130, 130, 130, 0.9));
    /* Optional: add a more prominent border or a subtle inner shadow for selection */
    /* box-shadow: inset 0 0 0 1px var(--btn-selected-border, rgba(150,150,150,0.8)); */
}

.selected:hover {
    /* background-color: rgb(214, 174, 43); */
    background-color: var(--btn-selected-hover-bg, rgba(115, 115, 115, 0.9));
    border-color: var(--btn-selected-border, rgba(140, 140, 140, 0.9));
}

.selected:active {
    /* background-color: #4d3a07; */
    background-color: var(--btn-selected-active-bg, rgba(90, 90, 90, 0.95));
    transform: translateY(1px) scale(0.98); /* Keep consistent press effect */
    /* border-style: inset; */ /* No need for inset if using transform and color change */
}

#state-settings br {
    display: none; /* Remove <br> for better spacing control with margins */
}

#state-settings input[type="checkbox"] {
    vertical-align: middle;
    margin-left: 5px; /* Space before checkbox */
}
</style>
