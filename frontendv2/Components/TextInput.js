export class TextInput {
    _parentContainer;
    set parentContainer(value) { this._parentContainer = value; }
    _container;
    _textInput;
    
    _value;
    get value() { return this._value; }
    set value(value) {
        this._value = value;
        this._textInput.value = value;
    }

    constructor(parentContainer, inputDetails) {
        this._container = document.createElement("div");
        this._container.classList.add("text-input-container");
        this._parentContainer = parentContainer;
        
        this._textInput = document.createElement("input");
        this._textInput.type = "text";
        this._textInput.placeholder = inputDetails.placeholder;
        this._textInput.classList.add("text-input");
        this._container.appendChild(this._textInput);

        this._textInput.addEventListener("input", () => {
            this.value = this._textInput.value;
        });
    }

    render() {
        this._parentContainer.appendChild(this._container);
    }
}