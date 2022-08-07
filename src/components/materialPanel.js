import "./materialPanel.css";
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from "reselect";
import addBlackSvg from "../svg/add_black.svg";
import { useEffect, useRef, useState } from "react";
import { selectCurrentTexture } from "../store/GlobalStore";

export default function MaterialPanel ({
    materialType,
    itemBorderRadius,
}) {
    const globalInfo = createSelector(
        state => state.global,
        global => {
            switch (materialType) {
                case 0:
                    return global.images;
                default: 
                    return global.images;
            }
        }
    );
    const listData = useSelector(globalInfo);

    const currentInfo = createSelector(
        state => state.global,
        global => global.currentTexture,
    )
    const currentTexture = useSelector(currentInfo);

    console.log('wyh-test-01', listData, currentTexture);

    const dispatch = useDispatch();
    const listItems = listData.map((data, index) => {
        const borderStyle = (currentTexture.type === materialType && currentTexture.name === data.name) ? '3px solid #fff': 'none';
        switch (materialType) {
            case 0:
                return <div className="ItemContainer" key={`item-${index}`}>
                    <div className="ItemSplit"/>
                    <div className="Item" onClick={() => dispatch(selectCurrentTexture({
                        type: materialType,
                        name: data.name,
                        url: data.imageURL
                    }))}>
                        <img className="ItemImage" 
                            src={data.imageURL} 
                            alt={`item-${index}`} 
                            style={{
                                border: `${borderStyle}`,
                                borderRadius: `${itemBorderRadius}px`,
                                boxShadow:`${(currentTexture.type === materialType && currentTexture.name === data.name) ? '10px 10px 20px rgba(0, 0, 0, 0.7)' : '10px 10px 20px rgba(0, 0, 0, 0.25)'}`,
                            }}
                        />
                        <div className="ItemTitle"
                            style={{
                                border: `${borderStyle}`,
                                borderRadius: `0px 0px ${itemBorderRadius}px ${itemBorderRadius}px`,
                            }}>
                            <span className="TitleText">{data.name}</span>
                        </div>
                    </div>
                </div>
            default:
                return []
        }
    });

    const buttonRef = useRef(null);
    const [buttonRefHeight, setBottonRefHeight] = useState(0);
    useEffect(() => {
        setBottonRefHeight(buttonRef.current?.clientHeight || 0);
    }, [buttonRef])

    return (
        <div className="PanelContainer">
            <div className="ListContainer">
                {listItems}
            </div>
            <div className="AddButtonContainer">
                <div className="AddButton" 
                    style={{
                        borderRadius: `${itemBorderRadius}px`,
                        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.25)',
                    }} 
                    ref={buttonRef}
                >
                        <div style={{
                            background: `url(${addBlackSvg}) no-repeat`,
                            backgroundSize: 'contain',
                            width: `${buttonRefHeight * 0.6}px`,
                            height: `${buttonRefHeight * 0.6}px`,
                        }}/>
                </div>
            </div>
        </div>
    )
}