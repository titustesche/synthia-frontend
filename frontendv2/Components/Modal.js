export class Modal {
    _background;
    _container;
    _titleElement;

    _onDestroyPromise = {
        reject: undefined,
        resolve: undefined
    };
    _closeListener;

    _title;
    set title(value) {
        if(this._titleElement) this._titleElement.innerText = value;
        this._title = value;
    }
    _inputs;
    set inputs(value) {
        this._inputs = value;
    }
    _canBeClosedManually = true;
    get canBeClosedManually() { return this._canBeClosedManually; }
    set canBeClosedManually(value) { this._canBeClosedManually = value; }

    constructor(title, inputs, details) {
        this._background = document.createElement("div");
        this._background.classList.add("modal-background");

        this._container = document.createElement("div");
        this._container.classList.add("modal-container");

        this._titleElement = document.createElement("h1");
        this._titleElement.classList.add("title");
        this._titleElement.innerText = title;
        this._container.appendChild(this._titleElement);

        for (let input of inputs) {
            input.parentContainer = this._container;
            input.render();
        }

        this.canBeClosedManually = details?.canBeClosedManually ?? true;
    }

    render() {
        document.body.appendChild(this._background);
        this._background.appendChild(this._container);

        if (this._canBeClosedManually) {
            this._closeListener = (event) => {
                if (!this._container.contains(event.target)) this.destroy();
            }
            document.addEventListener("click", this._closeListener);
        }
        return new Promise((resolve, reject) => {
            this._onDestroyPromise.resolve = resolve;
            this._onDestroyPromise.reject = reject;
        });
    }

    destroy() {
        this._onDestroyPromise.resolve?.();
        if (this._closeListener) {
            document.removeEventListener("click", this._closeListener);
            this._closeListener = undefined;
        }
        this._background.remove();
    }
}