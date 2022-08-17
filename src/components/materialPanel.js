import "./materialPanel.css";
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from "reselect";
import addBlackSvg from "../svg/add_black.svg";
import { useEffect, useRef, useState } from "react";
import { selectCurrentTexture } from "../store/GlobalStore";

export default function MaterialPanel ({
    materialType,
    itemBorderRadius,
    offsetLeft,
    offsetTop,
    dragAudioIntoCanvas,
}) {
    const globalInfo = createSelector(
        state => state.global,
        global => {
            switch (materialType) {
                case 0:
                    return global.images;
                case 1:
                    return global.audios;
                case 2:
                    return global.videos;
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

    // console.log('wyh-test-01', listData, materialType);

    // reuse drag code in maskdrag
    const [isMaskDrag, setIsMaskDrag] = useState(false);
    const [maskMoveP, setMaskMoveP] = useState([0, 0]);
    const [selectedMask, setSelectedMask] = useState('');
    const [selectedAudio, setSelectedAudio] = useState('');

    const handleSvgDragStart = (svg, audio, e) => {
        setIsMaskDrag(true);
        setSelectedMask(svg);
        setSelectedAudio(audio)
        setMaskMoveP([
            e.changedTouches[0].clientX,
            e.changedTouches[0].clientY
        ])
    }

    const handleSvgDragMove = (e) => {
        if(isMaskDrag) {
            setMaskMoveP([
                e.changedTouches[0].clientX,
                e.changedTouches[0].clientY
            ])
        }
    }
    
    const handleSvgDragEnd = (e) => {
        if(isMaskDrag) {
            dragAudioIntoCanvas(
                [
                    e.changedTouches[0].clientX,
                    e.changedTouches[0].clientY - offsetTop
                ],
                selectedMask,
                selectedAudio
            )
            setIsMaskDrag(false);
            setMaskMoveP([0, 0])
            setSelectedMask('');
        }
    }

    const dispatch = useDispatch();
    const listItems = listData.map((data, index) => {
        const borderStyle = (currentTexture.type === materialType && currentTexture.name === data.name) ? '3px solid #fff': 'none';
        switch (materialType) {
            case 0:
                return <div className="ItemContainer" key={`item-${index}`}>
                    <div className="ItemSplit"/>
                    <div className="Item" onClick={() => {
                            dispatch(
                                selectCurrentTexture({
                                    type: materialType,
                                    name: data.name,
                                    url: data.imageURL,
                                })
                            )
                        }}>
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
            case 1: 
                return <div className="ItemContainer" key={`item-${index}`}>
                    <div className="ItemSplit"/>
                    <div className="Item" 
                        // onClick={() => {
                        //     dispatch(
                        //         selectCurrentTexture({
                        //             type: materialType,
                        //             name: data.name,
                        //             url: data.audioURL,
                        //         })
                        //     )
                        // }}
                        onTouchStart={(e) => handleSvgDragStart(data.idImage, data.audioURL, e)}
                        onTouchMove={handleSvgDragMove}
                        onTouchEnd={handleSvgDragEnd}
                    >
                        <div className="ItemImage" 
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `${borderStyle}`,
                                borderRadius: `${itemBorderRadius}px`,
                                boxShadow:`${(currentTexture.type === materialType && currentTexture.name === data.name) ? '10px 10px 20px rgba(0, 0, 0, 0.7)' : '10px 10px 20px rgba(0, 0, 0, 0.25)'}`,
                            }}
                        >
                            <div 
                                style={{
                                    width: '74%',
                                    height: '100%',
                                    background: `url(${data.idImage}) no-repeat`,
                                    backgroundSize: 'contain',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <audio src={data.audioURL} 
                                    controls 
                                    style={{
                                        display: "block",
                                        width: '100%',
                                        height: '25%'
                                    }}
                                    preload='auto'
                                />
                            </div>
                        </div>

                        <div className="ItemTitle"
                            style={{
                                border: `${borderStyle}`,
                                borderRadius: `0px 0px ${itemBorderRadius}px ${itemBorderRadius}px`,
                            }}>
                            <span className="TitleText">{data.name}</span>
                        </div>
                    </div>
                </div>
            case 2:
                return <div className="ItemContainer" key={`item-${index}`}>
                    <div className="ItemSplit"/>
                    <div className="Item" onClick={() => {
                            dispatch(
                                selectCurrentTexture({
                                    type: materialType,
                                    name: data.name,
                                    url: data.videoURL,
                                })
                            )
                        }}>

                        <video className="ItemImage"
                            src={data.videoURL}
                            type='video/mp4'
                            preload='auto'
                            controls
                            style={{
                                height: '75.6%',
                                border: `${borderStyle}`,
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
        <div className="PanelContainer" style={{position: 'relative'}}>
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
            {
                isMaskDrag && 
                <div style={{
                    width: `${offsetTop}px`,
                    height: `${offsetTop}px`,
                    background: "linear-gradient(to right, #3196A8, #b0e0d1)",
                    position: 'absolute',
                    left: `${maskMoveP[0] - offsetLeft - offsetTop / 2}px`,
                    top: `${maskMoveP[1] - offsetTop - offsetTop / 2}px`,
                    borderRadius: `${0.2 * offsetTop}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div
                        style={{
                            width: '90%',
                            height: '90%',
                            background: `url(${selectedMask}) no-repeat`,
                            backgroundSize: 'contain',
                        }}
                    />
                </div>
            }
        </div>
    )
}