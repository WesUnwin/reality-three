import React, { useEffect } from 'react';
import TreeView from "./TreeView.jsx";
import * as FileHelpers from '../../util/FileHelpers.js'
import { useDispatch, useSelector } from 'react-redux';
import { getSelectedItem, selectItem } from '../../Redux/SelectedItemSlice.js';

const GameObjectItem = ({ dirHandle, scenePath, indices }) => {
    const dispatch = useDispatch();

    const selectedItem = useSelector(getSelectedItem());

    const compareIndices = (indicesOne, indicesTwo) => {
        if (indicesOne.length === indicesTwo.length) {
            const indicesAreSame = !indicesOne.some((idx, i) => idx !== indicesTwo[i]);
            return indicesAreSame;
        } else {
            return false;
        }
    };

    const isSelected = selectedItem &&
                       selectedItem.type === 'gameObject' &&
                       compareIndices(selectedItem.params.indices, indices);

    useEffect(() => {
        FileHelpers.loadFile(dirHandle, scenePath, dispatch, { type: 'sceneJSON' })
    }, [scenePath]);

    const onClick = () => {
        // indices is an array of numbers that identify which game object in the sceneJSON,
        // eg. [0][1] means within the 0th top-level gameObject, get the 2nd (index: 1) child GameObject
        dispatch(selectItem(scenePath, 'gameObject', { indices }));
    };

    return (
        <TreeView label={`GameObject ${indices[0]}`} onClick={onClick} isSelected={isSelected} />
    );
};

export default GameObjectItem;