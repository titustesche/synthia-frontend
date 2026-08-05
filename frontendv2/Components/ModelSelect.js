import {GridLayout} from "./GridLayout.js";

export class ModelSelect {
    _parentContainer;
    set parentContainer(value) {
        this._parentContainer = value;
    }

    _container;

    _gridLayout;
    _models;
    get models() {
        return this._models;
    }
    set models(value) {
        this._models = value;
        this.refreshModelEntries();
    }

    _modelEntries = {};
    _modelChangeCallback = () => {};

    _selectedModel;
    get selectedModel() {
        return this._selectedModel;
    }
    set selectedModel(value) {
        if (this._selectedModel) {
            this._modelEntries[this._selectedModel.name].container.classList.remove("selected");
        }
        this._selectedModel = value;
        if (this._selectedModel) {
            this._modelEntries[this._selectedModel.name].container.classList.add("selected");
        }
        this._modelChangeCallback(this._selectedModel);
    }

    constructor(parentContainer, details) {
        this._container = document.createElement("div");
        this._container.classList.add("model-select-container");

        this._gridLayout = document.createElement("div");
        this._gridLayout.classList.add("model-select-grid-layout");
        this._container.appendChild(this._gridLayout);

        if (details.models) this.models = details.models;
        if (details.selectedModel) this.selectedModel = details.selectedModel;
        if (details.onModelChange) this.subscribeModelChange(details.onModelChange);
    }

    refreshModelEntries() {
        for (let model of Object.values(this._models)) {
            this._modelEntries[model.name] = {
                container: null,
                nameContainer: null,
                providerContainer: null,
                parameterSizeContainer: null,
            }

            const modelEntry = document.createElement("div");
            modelEntry.classList.add("model-select-model-entry");
            modelEntry.addEventListener("click", () => this.selectedModel = model);
            this._modelEntries[model.name].container = modelEntry;

            const modelName = document.createElement("p");
            modelName.classList.add("model-select-model-name");
            modelName.innerText =
                model.name.includes(":")
                    ? model.name.split(":")[0]
                    : model.name;
            modelEntry.appendChild(modelName);
            this._modelEntries[model.name].nameContainer = modelName;

            const modelProvider = document.createElement("p");
            modelProvider.classList.add("model-select-model-provider");
            modelProvider.innerText = model.provider.name;
            modelEntry.appendChild(modelProvider);
            this._modelEntries[model.name].providerContainer = modelProvider;

            const modelParameterSize = document.createElement("p");
            modelParameterSize.classList.add("model-select-model-parameters");
            modelParameterSize.innerText = model.details.parameter_size;
            modelEntry.appendChild(modelParameterSize);
            this._modelEntries[model.name].parameterSizeContainer = modelParameterSize;

            this._gridLayout.appendChild(modelEntry);
        }
    }

    render() {
        if (!this._parentContainer) throw new Error("Parent container needs to be set before rendering");
        this._parentContainer.appendChild(this._container);
    }

    subscribeModelChange(callback) {
        this._modelChangeCallback = callback;
    }
}