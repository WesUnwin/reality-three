import Renderer from './Renderer';
import Scene from './Scene';
import AssetStore from './assets/AssetStore';
import InputManager from './input/InputManager';
import { GameJSON } from './types';

class Game {
    initialized: boolean;
    baseURL: string;
    gameJSON: null | GameJSON;
    renderer: Renderer;
    scene: Scene | null;
    assetStore: AssetStore | null;
    inputManager: InputManager;
    gameObjectClasses: Object;

    constructor(baseURL: string) {
        this.initialized = false;
        this.gameJSON = null;

        if (typeof baseURL !== 'string') {
            throw new Error('Game must be constructed with a baseURL (first argument). Eg. new Game("file://myprojectfolder")');
        }
        this.baseURL = baseURL;
        if (this.baseURL.endsWith('/')) {
            this.baseURL = this.baseURL.slice(0, this.baseURL.length - 1);
        }

        this.scene = null;
        this.gameObjectClasses = {}; // key-values map game object types to GameObject sub-classes
    }

    _init = async () => {
        if (this.initialized) {
            throw new Error('Game already initialized');
        }
        console.log('Game: reading game.json file to initialize game...');

        this.assetStore = new AssetStore(this.baseURL);

        const gameJSONAsset = await this.assetStore.load('game.json');
        this.gameJSON = gameJSONAsset.data;

        this.renderer = new Renderer(this, this.gameJSON.rendererOptions);
        this.inputManager = new InputManager(this.renderer.getCanvas(), this.gameJSON.inputOptions);

        this.initialized = true;
    };

    registerGameObjectClasses(types: Object) {
        for (const type in types) {
            this.gameObjectClasses[type] = types[type];
        }
    }

    getGameObjectClass(type) {
        const klass = this.gameObjectClasses[type];
        return klass || null;
    }

    async loadScene(sceneName: string) {
        if (typeof sceneName !== 'string') {
            throw new Error('loadScene(): sceneName must be a string, refering to a scene name defined in your game.json file');
        }

        if (!this.initialized) {
            await this._init();
        }

        console.debug(`Game: loading scene: ${sceneName}`);

        if (this.scene) {
            console.debug(`Game: unloading scene: ${sceneName}`);
            this.scene.beforeUnloaded();
            this.scene.forEachGameObject(gameObject => {
                gameObject.beforeUnloaded();
            });
            this.scene.game = null; // Signals that the scene is no longer active
            this.scene = null;
        }

        if (!this.gameJSON.assetOptions?.retainAssetsBetweenScene) {
            console.debug(`Game: clearing all assets as gameJSON.assetOptions.retainAssetsBetweenScene was not set`);
            this.assetStore.unloadAll();
        }

        const sceneJSONassetPath = this.gameJSON.scenes[sceneName];
        if (!sceneJSONassetPath) {
            throw new Error(`Game: no scene with name ${sceneName} defined in game.json`);
        }

        const scene = new Scene(sceneJSONassetPath)
        this.scene = scene;
        await this.scene.load(this);

        console.debug(`Game: successfully loaded scene: ${scene.name}`);

        // Invoke afterLoaded() callback on scene and all its children,
        // AFTER the scene and all its game objects are loaded.
        this.scene.afterLoaded();
        this.scene.forEachGameObject(gameObject => {
            gameObject.afterLoaded();
        });
    }

    async loadAsset(assetPath: string) {
        if (!this.initialized) {
            await this._init();
        }

        return await this.assetStore.load(assetPath);
    }

    play() {
        if (!this.scene) {
            throw new Error('Game: you must call loadScene() before calling play()')
        }
        this.renderer.play();
    }

    pause() {
        if (this.renderer) {
            this.renderer.pause();
        }
    }
}

export default Game