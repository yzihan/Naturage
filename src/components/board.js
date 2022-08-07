import "./share.css";
import "./board.css";
import textureBlackSvg from "../svg/texture_black.svg";
import audioBlackSvg from "../svg/audio_black.svg";
import videoBlackSvg from "../svg/video_black.svg";
import { useState } from "react";
import MaterialPanel from "./materialPanel";
import shapeSvg from "../svg/shape.svg";
import pencilSvg from "../svg/pencil.svg";
import eraserSvg from "../svg/eraser.svg";

export default function Board ({
    circleRadius,
}) {
    const buttionRadius = 0.115 * circleRadius;
    const iconSize = 0.28 * buttionRadius;
    const panelBorderRadius = 1.5 * iconSize;

    const [selecetedM, setSelectedM] = useState(-1); // 0: texture; 1: audio; 2: video 
    return (
        <div className="Container">
            <div className="Material-circle"
            style={{
                width: `${circleRadius}px`,
                height: `${circleRadius}px`,
                top: `-${0.1 * circleRadius}px`,
                left: `-${0.88 * circleRadius}px`,
            }}>
                <div className="Button-material"
                    onClick={() => selecetedM === 0 ? setSelectedM(-1) : setSelectedM(0)}
                    style={{
                        width: `${buttionRadius}px`,
                        height: `${buttionRadius}px`,
                        top: `${0.25 * circleRadius}px`,
                        left: `${circleRadius - 0.88 * buttionRadius}px`,
                        background: `${selecetedM === 0 ? '#37CCA8' : '#D5E9E9'}`,
                        boxShadow: `${selecetedM === 0 ? '0px 0px 20px rgba(0, 0, 0, 0.7)' : '0px 0px 20px rgba(0, 0, 0, 0.25)'}`
                    }}>
                        <div style={{
                            background: `url(${textureBlackSvg}) no-repeat`,
                            backgroundSize: 'contain',
                            width: `${iconSize}px`,
                            height: `${iconSize}px`,
                        }}/>
                </div>

                <div className="Button-material"
                    onClick={() => selecetedM === 1 ? setSelectedM(-1) : setSelectedM(1)}
                    style={{
                        width: `${buttionRadius}px`,
                        height: `${buttionRadius}px`,
                        top: `${0.45 * circleRadius}px`,
                        left: `${circleRadius - buttionRadius / 2}px`,
                        background: `${selecetedM === 1 ? '#37CCA8' : '#D5E9E9'}`,
                        boxShadow: `${selecetedM === 1 ? '0px 0px 20px rgba(0, 0, 0, 0.7)' : '0px 0px 20px rgba(0, 0, 0, 0.25)'}`
                    }}>
                        <div style={{
                            background: `url(${audioBlackSvg}) no-repeat`,
                            backgroundSize: 'contain',
                            width: `${iconSize}px`,
                            height: `${iconSize}px`,
                        }}/>
                </div>

                <div className="Button-material"
                    onClick={() => selecetedM === 2 ? setSelectedM(-1) : setSelectedM(2)}
                    style={{
                        width: `${buttionRadius}px`,
                        height: `${buttionRadius}px`,
                        top: `${0.65 * circleRadius}px`,
                        left: `${circleRadius - 0.88 * buttionRadius}px`,
                        background: `${selecetedM === 2 ? '#37CCA8' : '#D5E9E9'}`,
                        boxShadow: `${selecetedM === 2 ? '0px 0px 20px rgba(0, 0, 0, 0.7)' : '0px 0px 20px rgba(0, 0, 0, 0.25)'}`
                    }}>
                        <div style={{
                            background: `url(${videoBlackSvg}) no-repeat`,
                            backgroundSize: 'contain',
                            width: `${iconSize}px`,
                            height: `${iconSize}px`,
                        }}/>
                </div>
            </div>

            {/* drawer */}
            <div className={`${selecetedM === -1 ? 'Drawer-hidden' : 'Drawer'}`}
                style={{
                    borderRadius: `${panelBorderRadius}px 0px 0px ${panelBorderRadius}px`
                }}
            >
                {
                    selecetedM !== -1 && <MaterialPanel materialType={selecetedM} itemBorderRadius={panelBorderRadius * 0.67}/>
                }
            </div>

            {/* draw button */}
            <div style={{
                width: `${1.2 * iconSize}px`,
                height: `${4.4 * iconSize}px`,
                position: 'absolute',
                right: `${0.7 * iconSize}px`,
                top: `${0.3 * circleRadius}px`,
                caretColor: 'transparent',
                zIndex: '50',
            }}>
                <div style={{
                    width: `${1.2 * iconSize}px`,
                    height: `${1.2 * iconSize}px`,
                    background: '#D5E9E9',
                    opacity: '0.8',
                    display: 'flex',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '20%'
                }}>
                    <div style={{
                        background: `url(${shapeSvg}) no-repeat`,
                        backgroundSize: 'contain',
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                    }}/>
                </div>
                <div style={{
                    background: `url(${pencilSvg}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    marginTop: `${0.7 * iconSize}px`,
                }}/>
                <div style={{
                    background: `url(${eraserSvg}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    marginTop: `${0.7 * iconSize}px`,
                }}/>
            </div>
        </div>
    )
}