const Utils = {
	generateState(width, height, option='random') {
		let cells = new Uint8Array(height * width * 4);
		switch(option) {
			case 'random': {
				for(let i = 0; i < height * width*4; i+=4){
					let r =  Math.floor(255 * Math.random());
					cells[i] = r;
					cells[i+1] = r;
					cells[i+2] = r;
					cells[i+3] = r;
				}
				break;
            }

			case 'random_bool': {
				for(let i = 0; i < height * width*4; i+=4){
					let r =  255 * Math.floor(Math.random()*2);
					cells[i] = r;
					cells[i+1] = r;
					cells[i+2] = r;
					cells[i+3] = r;
				}
				break;
            }

			case 'center': {
				for(let i = 0; i < cells.length; i++){
					cells[i] = 0;
				}
				let center = Math.floor(cells.length/2);
				if (height%2 === 0) {
					// if height is even, it must be shifted over for some reason
					center += width*2;
				}
				cells[center] = 255;
				cells[center+1] = 255;
				cells[center+2] = 255;
				cells[center+3] = 255;
				break;
            }
			
			case 'center_top': {
				for(let i = 0; i < cells.length; i++){
					cells[i] = 0;
				}
				cells[width*2] = 255;
				cells[width*2+1] = 255;
				cells[width*2+2] = 255;
				cells[width*2+3] = 255;
				break;
            }

			case 'empty': {
				for(let i = 0; i < cells.length; i++){
					cells[i] = 0;
				}
				break;
            }
		}
		return cells;
	},

    randomColor() {
        let color = [0, 0, 0];
        for (let i in color) {
            color[i] = Math.random();
        }
        color[Math.floor(Math.random()*3)] = 1;
        return color;
    },

    randomKernel(min=-1, max=1, h_symmetry=false, v_symmetry=false, full_symmetry=false) {
        let range = max - min;
        let kernel = new Float32Array(9);
    
        for (let i in kernel){
            kernel[i] = Math.random()*range + min;
        }

		if (full_symmetry)
			kernel = this.fullSymmetry(kernel);
		else{
			if (h_symmetry)
				kernel = this.hSymmetry(kernel);
			if (v_symmetry)
				kernel = this.vSymmetry(kernel);
		}
        return kernel;
    },

	hSymmetry(k) {
		k[6] = k[0];
		k[7] = k[1];
		k[8] = k[2];
		return k;
	},

	vSymmetry(k) {
		k[2] = k[0];
		k[5] = k[3];
		k[8] = k[6];
		return k;
	},

	fullSymmetry(k) {
		k[3] = k[1];
		k = this.hSymmetry(k);
		k = this.vSymmetry(k);
		return k;
	},

	hexToRgb(hex) {
		let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? [
			parseInt(result[1], 16) / 255,
			parseInt(result[2], 16) / 255,
			parseInt(result[3], 16) / 255
		] : null; // Returns [r,g,b] where values are 0-1, or null if invalid hex
	},

	rgbToHex(rgb) {
		// Expects rgb as an array [r,g,b] where values are 0-1
		let r = Math.round(rgb[0]*255);
		let g = Math.round(rgb[1]*255);
		let b = Math.round(rgb[2]*255);
		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}
}

export default Utils