import Utils from './utils'
import Renderer from '../js/renderer';
import Shaders from '../js/shaders';
import IsMobile from '../js/ismobile';

const defaultKernel = new Float32Array([0,0,0, 0,1,0, 0,0,0]);
const defaultColor = [1.0, 1.0, 1.0]; // White
const defaultBgColor = '#000000';
const defaultPersistent = false;
const defaultSkipFrames = false;
const defaultHorSym = false;
const defaultVerSym = false;
const defaultFullSym = false;
const defaultResetType = 'empty';
const defaultSimulationSpeed = 1;
const defaultZoomLevel = 1; // New default

// Default settings for which parameters are included in "Randomize All"
const defaultRandomizationOptions = {
    kernel: true,
    foregroundColor: true,
    backgroundColor: true,
    persistentPixels: true,
    simulationSpeed: true,
    activationFunction: true,
    resetType: true,
    zoomLevel: true,
};

const ACTIVATION_FUNCTIONS_LIST = [
    { name: "Identity", code: "float activation(float x) {\n  return x;\n}" },
    { name: "Sin", code: "float activation(float x) {\n  return sin(x);\n}" },
    { name: "Power", code: "float activation(float x) {\n  return pow(x, 2.);\n}" },
    { name: "Absolute Value", code: "float activation(float x) {\n  return abs(x);\n}" },
    { name: "Tanh", code: "float activation(float x) {\n  return (exp(2.*x)-1.)/(exp(2.*x)+1.);\n}" },
    { name: "Inverse Gaussian", code: "float activation(float x) {\n  return -1./pow(2., (pow(x, 2.)))+1.;\n}" },
    { name: "Sin (Scaled by PI)", code: "float activation(float x) {\n  return sin(x * 3.1415926535);\n}" },
    { name: "Step (0.0 threshold)", code: "float activation(float x) {\n  return step(0.0, x);\n}" },
    { name: "Smoothstep (-0.5 to 0.5)", code: "float activation(float x) {\n  return smoothstep(-0.5, 0.5, x);\n}" }
];

const Controller = {
    init() {
        this.filter = new Float32Array(defaultKernel); // Ensure it's a new copy
        this.color = [...defaultColor]; // Ensure it's a new copy
        this.bgColor = defaultBgColor;
        this.activationSource = Shaders.defaultActivationSource;
        this.persistent = defaultPersistent;
        // skip_frames is usually on the renderer instance, initRenderer will handle it
        this.hor_sym = defaultHorSym;
        this.ver_sym = defaultVerSym;
        this.full_sym = defaultFullSym;
        this.paused = false;
        this.reset_type = defaultResetType;
        this.zoomLevel = defaultZoomLevel; // Initialize controller's zoom
        this.randomizationOptions = JSON.parse(JSON.stringify(defaultRandomizationOptions)); // Initialize randomization options
    },

    updateRandomizationOptions(newOptions) {
        if (newOptions) {
            this.randomizationOptions = { ...this.randomizationOptions, ...newOptions };
        }
    },

    resetAllSettingsToDefaults() {
        this.filter = new Float32Array(defaultKernel);
        this.color = [...defaultColor];
        this.bgColor = defaultBgColor;
        this.activationSource = Shaders.defaultActivationSource;
        this.persistent = defaultPersistent;
        this.hor_sym = defaultHorSym;
        this.ver_sym = defaultVerSym;
        this.full_sym = defaultFullSym;
        this.reset_type = defaultResetType;
        this.zoomLevel = defaultZoomLevel; // Reset zoom level
        this.randomizationOptions = JSON.parse(JSON.stringify(defaultRandomizationOptions)); // Reset randomization options

        if (this.renderer) {
            this.renderer.skip_frames = defaultSkipFrames;
            this.renderer.simulationSpeed = defaultSimulationSpeed;
            this.renderer.setZoomLevel(this.zoomLevel); // Update renderer
        }

        this.setPersistent(this.persistent); // This calls apply(true) internally
        // setColor and setKernel are implicitly handled by apply() if it re-reads from controller state,
        // but explicit calls ensure it if shaders directly use passed values not controller state.
        if (this.renderer) {
            this.renderer.setColor(this.color);
            this.renderer.setKernel(this.filter);
        }
        document.body.style["background-color"] = this.bgColor; // Directly update bg color

        this.resetState(this.reset_type); // Reset pixel state
        // Ensure not paused after reset to defaults
        this.setPaused(false);
    },

    randomizeAllParameters(options) { // options will now come from RandomizationSettings.vue
        const currentOptions = options || this.randomizationOptions || defaultRandomizationOptions;

        // Randomize kernel symmetry
        if (currentOptions.kernel) {
            const h_sym = Math.random() < 0.5;
            const v_sym = Math.random() < 0.5;
            const full_sym = Math.random() < 0.25;
            this.filter = Utils.randomKernel(-1, 1, h_sym, v_sym, full_sym);
            // Update controller's internal symmetry flags
            this.hor_sym = h_sym || full_sym;
            this.ver_sym = v_sym || full_sym;
            this.full_sym = full_sym;
        }

        if (currentOptions.foregroundColor) {
            this.color = Utils.randomColor(); // For foreground
        }

        // Randomize background color
        if (currentOptions.backgroundColor) {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            this.bgColor = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            document.body.style["background-color"] = this.bgColor;
        }

        // Randomize persistent state
        if (currentOptions.persistentPixels) {
            this.persistent = Math.random() < 0.5;
        }
        
        // Randomize simulationSpeed
        if (this.renderer && currentOptions.simulationSpeed) {
            this.renderer.simulationSpeed = Math.floor(Math.random() * 5) + 1; // Speed 1 to 5
        }
        
        // Randomize Activation Function
        if (currentOptions.activationFunction) {
            this.activationSource = ACTIVATION_FUNCTIONS_LIST[Math.floor(Math.random() * ACTIVATION_FUNCTIONS_LIST.length)].code;
        }

        // Randomize Reset Type
        if (currentOptions.resetType) {
            const resetTypes = ['random', 'random_bool', 'center', 'center_top'];
            this.reset_type = resetTypes[Math.floor(Math.random() * resetTypes.length)];
        }
        
        // Randomize Zoom Level
        if (currentOptions.zoomLevel) {
            this.zoomLevel = Math.floor(Math.random() * 5) + 1; // Example: Zoom 1 to 5
             if (this.renderer) {
                this.renderer.setZoomLevel(this.zoomLevel);
            }
        }
        
        this.setPersistent(this.persistent); // Apply persistent setting (this calls apply(true) internally)
        if (this.renderer) { // Ensure renderer specific updates
            this.renderer.setColor(this.color); 
            this.renderer.setKernel(this.filter); 
        }
        this.resetState(this.reset_type); // Reset state with the new type (or existing if not randomized)
    },

    initRenderer(canvas) {
        let renderer = new Renderer(canvas);
        renderer.simulationSpeed = defaultSimulationSpeed; // Set default on new renderer instance
        renderer.setActivationSource(this.activationSource);
        renderer.setKernel(this.filter);
        renderer.compileShaders(Shaders.vertexShader, Shaders.fragmentShader);
        renderer.setColor(this.color);
        renderer.setState(Utils.generateState(renderer.width, renderer.height, 'random'));
        renderer.beginRender();
        this.renderer = renderer;

        function nearestPow2(n){
            return Math.pow(2, Math.ceil(Math.log(n) / Math.log(2))); 
        }

        window.onresize = () => {
			if (window.innerWidth === this.renderer.width && window.innerHeight === this.renderer.height)
				return;
			this.renderer.stopRender();
			canvas.height = IsMobile ? nearestPow2(window.innerHeight) : window.innerHeight;
			canvas.width = IsMobile? nearestPow2(window.innerWidth) : window.innerWidth;
            // canvas.height = 256;
			// canvas.width = 512;
			this.renderer.height = canvas.height;
			this.renderer.width = canvas.width;
			this.renderer.gl.viewport(0, 0, this.renderer.width, this.renderer.height);
			this.renderer.setState(Utils.generateState(this.renderer.width, this.renderer.height, this.reset_type));
            if (!this.paused)
                this.renderer.beginRender();
		};
        window.onresize();
    }, 

    load(config, reset) {
        this.reset_type = config.reset_type;
        this.filter = config.filter;
        this.activationSource = config.activation;
        if (config.color !== "random")
            this.color = config.color;
        this.setPersistent(config.persistent);
        this.apply(true);
        if (reset)
            this.resetState();
    },

    setRenderer(r) {
        this.renderer = r;
    },

    apply(recompile=false) {
        if (!this.paused) {
            this.renderer.stopRender();
            let error = this._apply(recompile);
            this.renderer.beginRender();
            return error;
        }
        else {
            let error =  this._apply(recompile);
            this.renderer.applyValues();
            return error;
        }
    },

    _apply(recompile) {
        this.renderer.setKernel(this.filter);
        this.renderer.setColor(this.color);
        this.renderer.activationSource = this.activationSource;
        
        if (recompile)
            return this.renderer.recompile();
        return null;
    },

    resetState(type = this.reset_type) {
        this.reset_type = (type!==`empty`) ? type : this.reset_type;
        let state = Utils.generateState(this.renderer.width, this.renderer.height, type);
        this.renderer.setState(state);
    },

    setColor(color) {
        this.color = color;
        this.renderer.setColor(color);
    },

    setPersistent(c) {
        this.renderer.persistent = c;
        this.apply(true);
    },

    pauseToggle() {
        this.setPaused(!this.paused)
    },

    setPaused(paused) {
        if (this.paused === paused) return;
        this.paused = paused;
        if (this.paused)
            this.renderer.stopRender();
        else 
            this.renderer.beginRender();
        return this.paused;
    },

    step() {
        this.renderer.render();
    },

    offsetSkippedFrame() {
        this.renderer.updateState();
        this.renderer.updateDisplay();
    },

    setSimulationSpeed(speed) {
        if (this.renderer) {
            const newSpeed = parseInt(speed, 10);
            if (!isNaN(newSpeed) && newSpeed >= 0) { // Allow 0 for paused-like state if desired, or >=1
                this.renderer.simulationSpeed = newSpeed;
            }
        }
    },

    setZoomLevel(level) {
        this.zoomLevel = Math.max(1, level); // Ensure zoom is at least 1
        if (this.renderer) {
            this.renderer.setZoomLevel(this.zoomLevel);
        }
    },

    mutateCurrentSettings() {
        const mutationType = Math.floor(Math.random() * 7); // 7 types of mutations for now
        let recompileShaders = false;

        switch (mutationType) {
            case 0: { // Mutate Kernel Value
                const kIndex = Math.floor(Math.random() * 9);
                const change = (Math.random() * 0.4) - 0.2; // Small change between -0.2 and 0.2
                this.filter[kIndex] = Math.max(-1, Math.min(1, this.filter[kIndex] + change)); // Clamp between -1 and 1
                if (this.renderer) this.renderer.setKernel(this.filter);
                break;
            }
            case 1: { // Mutate Foreground Color (one channel)
                const cIndex = Math.floor(Math.random() * 3);
                const cChange = (Math.random() * 0.4) - 0.2;
                this.color[cIndex] = Math.max(0, Math.min(1, this.color[cIndex] + cChange)); // Clamp 0-1
                if (this.renderer) this.renderer.setColor(this.color);
                break;
            }
            case 2: { // Mutate Background Color (one channel)
                let [r, g, b] = Utils.hexToRgb(this.bgColor);
                const bgCIndex = Math.floor(Math.random() * 3);
                const bgCChange = (Math.random() * 0.4) - 0.2;
                if (bgCIndex === 0) r = Math.max(0, Math.min(1, r + bgCChange));
                else if (bgCIndex === 1) g = Math.max(0, Math.min(1, g + bgCChange));
                else b = Math.max(0, Math.min(1, b + bgCChange));
                this.bgColor = Utils.rgbToHex([r, g, b]);
                document.body.style["background-color"] = this.bgColor;
                break;
            }
            case 3: { // Change Activation Function
                const currentIndex = ACTIVATION_FUNCTIONS_LIST.findIndex(af => af.code === this.activationSource);
                let nextIndex = (currentIndex + 1) % ACTIVATION_FUNCTIONS_LIST.length;
                if (currentIndex === -1 || ACTIVATION_FUNCTIONS_LIST.length <=1) nextIndex = 0; // Fallback
                this.activationSource = ACTIVATION_FUNCTIONS_LIST[nextIndex].code;
                recompileShaders = true;
                break;
            }
            case 4: { // Change Reset Type
                const resetTypes = ['random', 'random_bool', 'center', 'center_top', 'empty'];
                let currentResetIndex = resetTypes.indexOf(this.reset_type);
                let nextResetIndex = (currentResetIndex + 1) % resetTypes.length;
                this.reset_type = resetTypes[nextResetIndex];
                this.resetState(this.reset_type); // Apply immediately
                break;
            }
            case 5: { // Change Simulation Speed
                if (this.renderer) {
                    const speedChange = Math.random() < 0.5 ? 1 : -1;
                    let newSpeed = this.renderer.simulationSpeed + speedChange;
                    this.renderer.simulationSpeed = Math.max(1, Math.min(10, newSpeed)); // Clamp 1-10
                }
                break;
            }
            case 6: { // Change Zoom Level
                const zoomChange = Math.random() < 0.5 ? 1 : -1;
                let newZoom = this.zoomLevel + zoomChange;
                this.setZoomLevel(Math.max(1, Math.min(10, newZoom))); // Uses internal clamping & renderer update
                break;
            }
            // Future: case 7: Toggle Persistent, etc.
        }

        this.apply(recompileShaders); 
        // Paused state should be maintained, apply() handles this.
    }
}
Controller.init()
export default Controller