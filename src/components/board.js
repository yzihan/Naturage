import "./share.css";
import "./board.css";
import textureBlackSvg from "../svg/texture_black.svg";
import audioBlackSvg from "../svg/audio_black.svg";
import videoBlackSvg from "../svg/video_black.svg";
import { useEffect, useRef, useState } from "react";
import MaterialPanel from "./materialPanel";
import shapeSvg from "../svg/shape.svg";
import deleteSvg from "../svg/delete.svg";
import pencilSvg from "../svg/pencil.svg";
import eraserSvg from "../svg/eraser.svg";
import { createSelector } from "reselect";
import { useSelector } from 'react-redux';

export default function Board ({
    circleRadius,
}) {
    const buttionRadius = 0.115 * circleRadius;
    const iconSize = 0.28 * buttionRadius;
    const panelBorderRadius = 1.5 * iconSize;

    const [selecetedM, setSelectedM] = useState(-1); // 0: texture; 1: audio; 2: video 
    const [selectedD, setSelectedD] = useState(-1); // 0: pencil; 1: eraser; 2: shape; 3: delete

    const canvasRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState([0, 0]);
    const [canvasOffset, setCanvasOffset] = useState([0, 0]);
    useEffect(() => {
        setCanvasSize([
            canvasRef.current?.clientWidth || 0,
            canvasRef.current?.clientHeight || 0
        ]);
        setCanvasOffset([
            canvasRef.current?.offsetLeft || 0,
            canvasRef.current?.offsetTop || 0
        ]);
    }, [canvasRef])

    // console.log('wyh-test-01', canvasSize, canvasOffset);
    // console.log('wyh-test-01', Math.random(0, 1).toFixed(3));

    // canvas
    const [isDraw, setIsDraw] = useState(false);

    // pencil
    const [pencilStyle, setPencilStyle] = useState({
        size: 5,
        color: '#000',
    });

    // eraser
    const [eraserStyle, setEraserStyle] = useState({
        size: 30,
    });
    const [eraserPoint, setEraserPoint] = useState([]);

    // closed shape
    const [shapePoints, setShapePoints] = useState([]);
    const [shapeIndex, setShapeIndex] = useState([]);
    const [selectedShape, setSelectedShape] = useState(-1);
    const [savedCanvas, setSavedCanvas] = useState(null);

    // console.log('wyh-test-05', selectedShape);

    const handleOnTouchStart = (e) => {
        if(selectedD !== -1 && selectedD !== -3) {
            setIsDraw(true);
            const canvas = document.getElementById('painting-canvas');
            const canvasCont = canvas.getContext('2d');

            if(selectedD === 0) {
                canvasCont.beginPath();
                canvasCont.strokeStyle = pencilStyle.color;
                canvasCont.lineWidth = pencilStyle.size;
                canvasCont.lineJoin = 'round';
                canvasCont.lineCap = 'round';
                canvasCont.moveTo(
                    e.changedTouches[0].clientX - canvasOffset[0],
                    e.changedTouches[0].clientY - canvasOffset[1],
                );
            } else if (selectedD === 1) {
                setEraserPoint([
                    e.changedTouches[0].clientX - canvasOffset[0],
                    e.changedTouches[0].clientY - canvasOffset[1],
                ])
            } else if (selectedD === 2) {
                canvasCont.beginPath();
                canvasCont.strokeStyle = pencilStyle.color;
                canvasCont.lineWidth = pencilStyle.size;
                canvasCont.lineJoin = 'round';
                canvasCont.lineCap = 'round';
                canvasCont.moveTo(
                    e.changedTouches[0].clientX - canvasOffset[0],
                    e.changedTouches[0].clientY - canvasOffset[1],
                );

                // update
                shapePoints.push([[
                    e.changedTouches[0].clientX - canvasOffset[0],
                    e.changedTouches[0].clientY - canvasOffset[1],
                ]]);

                let newIndex = Math.round(Math.random(0, 1) * 255);
                while(shapeIndex.indexOf(newIndex) !== -1) {
                    newIndex = Math.round(Math.random(0, 1) * 255);
                }
                shapeIndex.push(newIndex);

                // index-canvas
                const indexCanvas = document.getElementById('index-canvas');
                const indexCanvasCont = indexCanvas.getContext('2d');
                indexCanvasCont.beginPath();
                indexCanvasCont.strokeStyle = pencilStyle.color;
                indexCanvasCont.lineWidth = pencilStyle.size;
                indexCanvasCont.lineJoin = 'round';
                indexCanvasCont.lineCap = 'round';
                indexCanvasCont.fillStyle = `rgba(${newIndex}, 0, 0)`;
                indexCanvasCont.moveTo(
                    e.changedTouches[0].clientX - canvasOffset[0],
                    e.changedTouches[0].clientY - canvasOffset[1],
                );
            }
        }
    }

    const handleOnTouchMove = (e) => {
        if(isDraw) {
            const canvas = document.getElementById('painting-canvas');
            const canvasCont = canvas.getContext('2d');

            if(selectedD === 0) {
                canvasCont.lineTo(
                    e.changedTouches[0].clientX - canvasOffset[0], 
                    e.changedTouches[0].clientY - canvasOffset[1]
                );
                canvasCont.stroke();
            } else if (selectedD === 1) {
                canvasCont.save();
                canvasCont.beginPath();
                canvasCont.arc(
                    eraserPoint[0],
                    eraserPoint[1],
                    eraserStyle.size / 2,
                    0,
                    2 * Math.PI,
                    false
                );
                canvasCont.clip();
                canvasCont.clearRect(0, 0, canvasSize[0], canvasSize[1]);
                canvasCont.restore();
                setEraserPoint([
                    e.changedTouches[0].clientX - canvasOffset[0],
                    e.changedTouches[0].clientY - canvasOffset[1],
                ]);
            } else if (selectedD === 2) {
                canvasCont.lineTo(
                    e.changedTouches[0].clientX - canvasOffset[0], 
                    e.changedTouches[0].clientY - canvasOffset[1]
                );
                canvasCont.stroke();

                // index-canvas
                const indexCanvas = document.getElementById('index-canvas');
                const indexCanvasCont = indexCanvas.getContext('2d');
                indexCanvasCont.lineTo(
                    e.changedTouches[0].clientX - canvasOffset[0], 
                    e.changedTouches[0].clientY - canvasOffset[1]
                );
                indexCanvasCont.stroke();

                // update
                shapePoints[shapePoints.length - 1].push([
                    e.changedTouches[0].clientX - canvasOffset[0], 
                    e.changedTouches[0].clientY - canvasOffset[1]
                ]);
            }
        }
    }

    const handleOnTouchEnd = (e) => {
        if(selectedD !== -1 && selectedD !== -3) {
            setIsDraw(false);
            const canvas = document.getElementById('painting-canvas');
            const canvasCont = canvas.getContext('2d');

            if(selectedD === 0) {
                canvasCont.closePath();
            } else if (selectedD === 1) {
                canvasCont.save();
                canvasCont.beginPath();
                canvasCont.arc(
                    eraserPoint[0],
                    eraserPoint[1],
                    eraserStyle.size / 2,
                    0,
                    2 * Math.PI,
                    false
                );
                canvasCont.clip();
                canvasCont.clearRect(0, 0, canvasSize[0], canvasSize[1]);
                canvasCont.restore();
            } else if (selectedD === 2) {
                canvasCont.closePath();
                canvasCont.stroke();

                // index-canvas
                const indexCanvas = document.getElementById('index-canvas');
                const indexCanvasCont = indexCanvas.getContext('2d');
                indexCanvasCont.closePath();
                indexCanvasCont.stroke();
                indexCanvasCont.fill();
            }
        } else if (selectedD === -1) {
            const indexCanvas = document.getElementById('index-canvas');
            const indexCanvasCont = indexCanvas.getContext('2d');
            const targetR = indexCanvasCont.getImageData(
                e.changedTouches[0].clientX - canvasOffset[0],
                e.changedTouches[0].clientY - canvasOffset[1],
                1,
                1,
            ).data[0];

            // console.log('wyh-test-04', targetR, shapeIndex);
            const selectResult = shapeIndex.indexOf(targetR);
            setSelectedShape(selectResult);
        }
    }

    // current-texture
    const currentInfo = createSelector(
        state => state.global,
        global => global.currentTexture,
    )
    const currentTexture = useSelector(currentInfo);

    // console.log('wyh-test-07', currentTexture);

    useEffect(() => {
        if(selectedShape !== -1) {
            const canvas = document.getElementById('painting-canvas');
            const canvasCont = canvas.getContext('2d');
            if(currentTexture.type === 0) {
                const img = new Image();
                img.crossOrigin = '';
                img.src = currentTexture.url + '?' + new Date().getTime();  // amazing solution for cors
                console.log('wyh-test-last', img.src);
                img.onload = () => {
                    const pattern = canvasCont.createPattern(img, 'repeat');
                    const points = shapePoints[selectedShape];

                    canvasCont.putImageData(savedCanvas, 0, 0);

                    canvasCont.beginPath();
                    canvasCont.fillStyle = pattern;
                    canvasCont.strokeStyle = 'rgba(0, 0, 0, 0)';
                    canvasCont.lineWidth = pencilStyle.size;
                    canvasCont.lineJoin = 'round';
                    canvasCont.lineCap = 'round';
                    canvasCont.moveTo(
                        points[0][0],
                        points[0][1],
                    );
        
                    for(let i = 1; i < points.length; i++) {
                        canvasCont.lineTo(points[i][0], points[i][1]);
                    }
                    canvasCont.closePath();
                    canvasCont.stroke();
                    canvasCont.fill();
                    
                    setSavedCanvas(canvasCont.getImageData(0, 0, canvasSize[0], canvasSize[1])); // 跨域报错
                }
            }
        }
    }, [currentTexture, selectedShape, shapePoints, pencilStyle, canvasSize]);

    // highlight
    useEffect(() => {
        if(selectedShape !== -1) {
            const canvas = document.getElementById('painting-canvas');
            const canvasCont = canvas.getContext('2d');

            if(savedCanvas === null) {
                setSavedCanvas(canvasCont.getImageData(0, 0, canvasSize[0], canvasSize[1]));
            } else {
                canvasCont.putImageData(savedCanvas, 0, 0);
            }
            const points = shapePoints[selectedShape];
            canvasCont.beginPath();
            canvasCont.strokeStyle = '#1990A1';
            canvasCont.lineWidth = pencilStyle.size + 2;
            canvasCont.lineJoin = 'round';
            canvasCont.lineCap = 'round';
            canvasCont.moveTo(
                points[0][0],
                points[0][1],
            );

            for(let i = 1; i < points.length; i++) {
                canvasCont.lineTo(points[i][0], points[i][1]);
            }
            canvasCont.closePath();
            canvasCont.stroke();
        } else {
            if(savedCanvas !== null) {
                const canvas = document.getElementById('painting-canvas');
                const canvasCont = canvas.getContext('2d');
                canvasCont.putImageData(savedCanvas, 0, 0);
            }
        }
    }, [selectedShape, canvasSize, shapePoints, pencilStyle, savedCanvas]);

    return (
        <div className="Container" ref={canvasRef}>
            {/* canvas */}
            <canvas
                id='index-canvas' 
                width={canvasSize[0]} 
                height={canvasSize[1]}
                style={{
                    position: 'fixed',
                    left: '100%',
                }}
            />

            <canvas 
                id='painting-canvas' 
                className="P-canvas" 
                width={canvasSize[0]} 
                height={canvasSize[1]}
                onTouchStart={handleOnTouchStart}
                onTouchMove={handleOnTouchMove}
                onTouchEnd={handleOnTouchEnd}
            />

            {/* material-circle */}
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
                height: `${6.9 * iconSize}px`,
                position: 'absolute',
                right: `${0.7 * iconSize}px`,
                top: `${0.2 * circleRadius}px`,
                caretColor: 'transparent',
                zIndex: '50',
            }}>
                <div className="Draw-button-contain"
                style={{
                    width: `${1.2 * iconSize}px`,
                    height: `${1.2 * iconSize}px`,
                    background: `${selectedD === 0 ? '#D5E9E9' : '#fff'}`
                }}>
                    <div style={{
                        background: `url(${pencilSvg}) no-repeat`,
                        backgroundSize: 'contain',
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                    }}
                    onClick={() => selectedD === 0 ? setSelectedD(-1) : setSelectedD(0)}
                    />
                </div>
                
                <div className="Draw-button-contain"
                style={{
                    width: `${1.2 * iconSize}px`,
                    height: `${1.2 * iconSize}px`,
                    background: `${selectedD === 1 ? '#D5E9E9' : '#fff'}`,
                    marginTop: `${0.7 * iconSize}px`,
                }}>
                    <div style={{
                        background: `url(${eraserSvg}) no-repeat`,
                        backgroundSize: 'contain',
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                    }}
                    onClick={() => selectedD === 1 ? setSelectedD(-1) : setSelectedD(1)}
                    />
                </div>

                <div className="Draw-button-contain"
                style={{
                    width: `${1.2 * iconSize}px`,
                    height: `${1.2 * iconSize}px`,
                    background: `${selectedD === 2 ? '#D5E9E9' : '#fff'}`,
                    marginTop: `${0.7 * iconSize}px`,
                }}>
                    <div style={{
                        background: `url(${shapeSvg}) no-repeat`,
                        backgroundSize: 'contain',
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                    }}
                    onClick={() => selectedD === 2 ? setSelectedD(-1) : setSelectedD(2)}
                    />
                </div>

                <div className="Draw-button-contain"
                style={{
                    width: `${1.2 * iconSize}px`,
                    height: `${1.2 * iconSize}px`,
                    background: `${selectedD === 3 ? '#D5E9E9' : '#fff'}`,
                    marginTop: `${0.7 * iconSize}px`,
                }}>
                    <div style={{
                        background: `url(${deleteSvg}) no-repeat`,
                        backgroundSize: 'contain',
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                    }}
                    onClick={() => selectedD === 3 ? setSelectedD(-1) : setSelectedD(3)}
                    />
                </div>
            </div>
        </div>
    )
}