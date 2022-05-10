import { Checkbox, Slider } from "antd";
import React, { useEffect, useState } from "react";
import { setNeedOpacity, setUmaOpacity } from "Utils/Store/actions";
import store from "Utils/Store/store";

export default function Appearance() {
    const [_needOpacity, _setNeedOpacity] = useState(store.getState().needOpacity)
    const [opacity, setOpacity] = useState(store.getState().umaOpacity)
    useEffect(() => store.subscribe(() => {
        const { needOpacity, umaOpacity } = store.getState()
        _setNeedOpacity(needOpacity)
        setOpacity(umaOpacity)
    }), [])

    return (
        <>
            <div>
                <Checkbox
                    checked={_needOpacity}
                    onChange={(evt) => {
                        _setNeedOpacity(evt.target.checked)
                        store.dispatch(setNeedOpacity(evt.target.checked))
                    }}
                >空闲时透明化</Checkbox>
                <span style={{ float: 'right', display: _needOpacity ? '' : 'none' }}>当前透明度：{opacity.toFixed(2)}</span>
                <Slider
                    style={{ display: _needOpacity ? 'block' : 'none' }}
                    defaultValue={opacity}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={(value) => {
                        store.dispatch(setUmaOpacity(value))
                    }}
                />
            </div>
        </>
    )
}