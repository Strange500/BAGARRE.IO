import { COLORS } from "../../entities/Player";
import { socket } from "../Game";

const DEFAULT_COLOR = 'black';
const SECTION_SIZE = '50px';
const BORDER_SIZE_DEFAULT = '1px solid black';
const BORDER_SIZE_SELECTED = '3px solid white';

export class PlayerPersonalisationHandler {
    choosenColor;
    colorChooser;

    constructor() {
        this.choosenColor = DEFAULT_COLOR;
        this.colorChooser = document.querySelector('#colorChooser');
        this.fileInput = this._createFileInput();
        this.fileInput.style.display = 'none';

        this._initializeColorSelector();
        this.colorChooser.style.display = 'none';
    }

    _initializeColorSelector() {
        COLORS.forEach(color => this._addColorSection(color));
        const label = document.createElement('label');
        label.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-cloud-arrow-up-fill" viewBox="0 0 16 16">
                              <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2m2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0z"/>
                            </svg>`;
        label.style.backgroundColor = 'black';
        label.style.width = SECTION_SIZE;
        label.style.height = SECTION_SIZE;
        label.style.border = BORDER_SIZE_DEFAULT;
        label.style.display = 'inline-block';
        label.style.cursor = 'pointer';
        label.addEventListener('click', () => this.fileInput.click());
        this.colorChooser.appendChild(this.fileInput);
        this.colorChooser.appendChild(label);
    }

    _addColorSection(color) {
        const sec = document.createElement('section');
        sec.style.backgroundColor = color;
        sec.style.width = SECTION_SIZE;
        sec.style.height = SECTION_SIZE;
        sec.style.border = BORDER_SIZE_DEFAULT;
        sec.style.display = 'inline-block';
        sec.style.cursor = 'pointer';
        sec.onclick = () => this._selectColor(sec, color);
        this.colorChooser.appendChild(sec);
    }

    _selectColor(selectedSection, color) {
        const secs = this.colorChooser.querySelectorAll('section');
        secs.forEach(s => s.style.border = BORDER_SIZE_DEFAULT);
        selectedSection.style.border = BORDER_SIZE_SELECTED;
        this.choosenColor = color;
    }

    _createFileInput() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (event) => this._handleFileChange(event);
        return fileInput;
    }

    _handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                socket.emit('init:customImage', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    hideColorSelector() {
        while (this.colorChooser.firstChild) {
            this.colorChooser.removeChild(this.colorChooser.firstChild);
        }
        this.colorChooser.style.display = 'none';
    }

    showColorSelector() {
        this.colorChooser.style.display = 'flex';
    }
}