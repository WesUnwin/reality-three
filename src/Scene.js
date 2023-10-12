import * as THREE from 'three';
import GameObject from './GameObject';

class Scene {
    constructor(sceneData = {}) {
        this.threeJSScene = new THREE.Scene();
        this.threeJSScene.background = sceneData.background || new THREE.Color('lightblue');

        this.gameObjects = [];
        (sceneData.gameObjects || []).forEach(g => this.createGameObject(this, g));
    }

    createGameObject(parent, gameObjectData) {
        const options = { ...gameObjectData };
        delete options.children;
        const GameObjectClass = gameObjectData.klass || GameObject;
        const gameObject = new GameObjectClass(parent, options);
        parent.addGameObject(gameObject);
        this.threeJSScene.add(gameObject.threeJSObject3D);
        (gameObjectData.gameObjects || []).forEach(childData => {
            this.createGameObject(gameObject, childData);
        });
    }

    addGameObject(gameObject) {
        if (!this.gameObjects.some(g => g === gameObject)) {
            gameObject.parent = this;
            this.gameObjects.push(gameObject);
            this.threeJSScene.add(gameObject.threeJSObject3D);
        }
    }

    removeGameObject(gameObject) {
        if (this.gameObjects.some(g => g === gameObject)) {
            // gameObject is indeed a child of this scene
            this.gameObjects = this.gameObjects.filter(g => g !== gameObject);
            gameObject.parent = null;
            this.threeJSScene.remove(gameObject.threeJSObject3D);
        }
    }

    getRootGameObjects() {
        return this.gameObjects;
    }

    find(fn) {
        for (let i = 0; i<this.gameObjects.length; i++) {
            const obj = this.gameObjects[i];
            if (fn(obj)) {
                return obj;
            }
            const child = obj.find(fn);
            if (child) {
                return child;
            }
        }
        return null;
    }

    findAll(fn) {
        let results = [];
        for (let i = 0; i<this.gameObjects.length; i++) {
            const obj = this.gameObjects[i];
            if (fn(obj)) {
                results.push(obj);
            }
            const childResults = obj.findAll(fn);
            results = results.concat(childResults);
        }
        return results;
    }

    findByName(name) {
        return this.find(g => g.name === name);
    }

    findAllByTag(tag) {
        return this.findAll(g => g.hasTag(tag));
    }
}

export default Scene