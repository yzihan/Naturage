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
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentTexture } from "../store/GlobalStore";
import AdjustPanel from "./adjustPanel";
import MaskCircle from "./maskCircle";
import { fabric } from "fabric";

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

    // console.log('wyh-test-01', circleRadius)

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
    const [shapePoints, setShapePoints] = useState([]); // [[points of a shape], []]
    const [shapeHasDrawed, setShapeHasDrawed] = useState([]); // boolean
    const [shapeIndex, setShapeIndex] = useState([]); // r(rgb) - number[]
    const [moveDistance, setMoveDistance] = useState([0, 0, 0, 0]); // move vector
    const [rangeRects, setRangeRects] = useState([]); // [[], []]
    const [isTranslate, setIsTranslate] = useState(false);
    const [isRotate, setIsRotate] = useState(false);
    const [isScale, setIsScale] = useState(false);
    const [scaleRatio, setScaleRatio] = useState([1, 1]);
    const [rotatePoints, setRotatePoints] = useState([0, 0, 0, 0]);
    const [selectedShape, setSelectedShape] = useState(-1);
    const [savedCanvas, setSavedCanvas] = useState(null);

    const [isAdjustTexture, setIsAdjustTexture] = useState(false);
    const [adjustPoint, setAdjustPoint] = useState([0, 0]);

    // current-texture
    const currentInfo = createSelector(
        state => state.global,
        global => global.currentTexture,
    )
    const currentTexture = useSelector(currentInfo);
    const [shapeTextureInfo, setShapeTextureInfo] = useState([]);

    // console.log('wyh-test-01', shapeTextureInfo);

    const handleOnTouchStart = (e) => {
        if(selectedD !== -1 && selectedD !== -3) {
            setIsDraw(true);
            const canvas = document.getElementById('painting-canvas');
            const canvasCont = canvas.getContext('2d');


            if(selectedD === 0) {
                canvasCont.clearRect(0, 0, canvasSize[0], canvasSize[1]);
                if(savedCanvas !== null) {
                    canvasCont.putImageData(savedCanvas, 0, 0);
                }
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
                canvasCont.clearRect(0, 0, canvasSize[0], canvasSize[1]);
                if(savedCanvas !== null) {
                    canvasCont.putImageData(savedCanvas, 0, 0);
                }
                setEraserPoint([
                    e.changedTouches[0].clientX - canvasOffset[0],
                    e.changedTouches[0].clientY - canvasOffset[1],
                ])
            } else if (selectedD === 2) {
                shapePoints.push([[
                    e.changedTouches[0].clientX - canvasOffset[0],
                    e.changedTouches[0].clientY - canvasOffset[1],
                ]]);

                shapeHasDrawed.push(false);

                let newIndex = Math.round(Math.random(0, 1) * 255);
                while(shapeIndex.indexOf(newIndex) !== -1) {
                    newIndex = Math.round(Math.random(0, 1) * 255);
                }
                shapeIndex.push(newIndex);

                shapeTextureInfo.push({
                    type: -1,
                    name: '',
                    rect: []
                });
            }
        } else if (selectedD === -1) {
            const indexCanvas = document.getElementById('index-canvas');
            const indexCanvasCont = indexCanvas.getContext('2d');
            const currentX = e.changedTouches[0].clientX - canvasOffset[0];
            const currentY = e.changedTouches[0].clientY - canvasOffset[1];
            const targetR = indexCanvasCont.getImageData(
                currentX,
                currentY,
                1,
                1,
            ).data[0];

            const selectResult = shapeIndex.indexOf(targetR);

            if(selectedShape !== -1 && selectResult !== -1) {
                if(selectedShape !== selectResult) setSelectedShape(selectResult);
                moveDistance[0] = currentX;
                moveDistance[1] = currentY;
                moveDistance[2] = moveDistance[0];
                moveDistance[3] = moveDistance[1];
                setIsTranslate(true);
                setIsAdjustTexture(false);
            } else if (selectedShape !== -1 && selectResult === -1) {
                // right top button for scale
                const rectPoints = rangeRects[selectedShape];
                const distX = currentX - (rectPoints[0] + rectPoints[2]);
                const distY = currentY - rectPoints[1]; 
                const dist = Math.sqrt(distX * distX + distY * distY);

                if(dist < 20) {
                    setIsScale(true);
                    setIsAdjustTexture(false);
                } else {
                    rotatePoints[0] = currentX;
                    rotatePoints[1] = currentY;
                    rotatePoints[2] = currentX;
                    rotatePoints[3] = currentY;
                    setIsRotate(true);
                }
            } else if (selectedShape === -1 && selectResult !== -1) {
                setSelectedShape(selectResult);
            } else {

            }
        }
    }

    const handleOnTouchMove = (e) => {
        const currentX = e.changedTouches[0].clientX - canvasOffset[0];
        const currentY = e.changedTouches[0].clientY - canvasOffset[1];
        if(isDraw) {
            const canvas = document.getElementById('painting-canvas');
            const canvasCont = canvas.getContext('2d');

            if(selectedD === 0) {
                canvasCont.lineTo(currentX, currentY);
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
                setEraserPoint([currentX, currentY]);
            } else if (selectedD === 2) {
                // update
                shapePoints[shapePoints.length - 1].push([currentX, currentY]);
                setShapePoints(JSON.parse(JSON.stringify(shapePoints)));
            }
        } else {
            if(selectedShape !== -1) {
                if(isScale) {
                    const rectPoints = rangeRects[selectedShape];
                    scaleRatio[0] = (currentX - rectPoints[0]) / rectPoints[2];
                    scaleRatio[1] = (rectPoints[1] + rectPoints[3] - currentY) / rectPoints[3];
                    setScaleRatio(JSON.parse(JSON.stringify(scaleRatio)));
                }

                if(isTranslate) {
                    moveDistance[2] = currentX;
                    moveDistance[3] = currentY;
                    setMoveDistance(JSON.parse(JSON.stringify(moveDistance)));
                }
                
                if(isRotate) {
                    rotatePoints[2] = currentX;
                    rotatePoints[3] = currentY;
                    setRotatePoints(JSON.parse(JSON.stringify(rotatePoints)));
                }
            }
        }
    }

    // console.log('wyh-test-rangeRects', rotatePoints);

    const handleOnTouchEnd = (e) => {
        if(selectedD !== -1 && selectedD !== -3) {
            setIsDraw(false);
            const canvas = document.getElementById('painting-canvas');
            const canvasCont = canvas.getContext('2d');

            if(selectedD === 0) {
                // canvasCont.closePath();
                setSavedCanvas(canvasCont.getImageData(0, 0, canvasSize[0], canvasSize[1]));
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
                setSavedCanvas(canvasCont.getImageData(0, 0, canvasSize[0], canvasSize[1]));
            } else if (selectedD === 2) {
                const points = shapePoints[shapePoints.length - 1];
                let leftTop = [points[0][0], points[0][1]];
                let rightBottom = [points[0][0], points[0][1]];
                points.forEach(p => {
                    if(p[0] < leftTop[0]) leftTop[0] = p[0];
                    if(p[0] > rightBottom[0]) rightBottom[0] = p[0];
                    if(p[1] < leftTop[1]) leftTop[1] = p[1];
                    if(p[1] > rightBottom[1]) rightBottom[1] = p[1];
                });

                rangeRects.push([leftTop[0], leftTop[1], rightBottom[0] - leftTop[0], rightBottom[1] - leftTop[1]]);

                shapeHasDrawed[shapeHasDrawed.length - 1] = true;
                setShapeHasDrawed(JSON.parse(JSON.stringify(shapeHasDrawed)));
            }
        } else if (selectedD === -1) {
            if(selectedShape !== -1) {
                const rectPoints = rangeRects[selectedShape];
                if(isScale) {
                    const lbx = rectPoints[0];
                    const lby = rectPoints[1] + rectPoints[3];
                    const points = shapePoints[selectedShape];
                    for(let n = 0; n < points.length; n++) {
                        for(let m = 0; m < points[n].length; m++) {
                            if(m % 2 === 0) {
                                const vx = points[n][m] - lbx;
                                points[n][m] = lbx + vx * scaleRatio[0];
                            } else {
                                const vy = points[n][m] - lby;
                                points[n][m] = lby + vy * scaleRatio[1];
                            }
                        }
                    }

                    rangeRects[selectedShape][1] = rectPoints[1] + rectPoints[3] * (1 - scaleRatio[1]);
                    rangeRects[selectedShape][2] = rectPoints[2] * scaleRatio[0];
                    rangeRects[selectedShape][3] = rectPoints[3] * scaleRatio[1];

                    shapeTextureInfo[selectedShape].rect = [];

                    setShapePoints(JSON.parse(JSON.stringify(shapePoints)));
                    setIsScale(false);
                    setScaleRatio([1, 1]);
                }

                if(isTranslate) {
                    if(moveDistance[0] !== moveDistance[2] || moveDistance[1] !== moveDistance[3]) {
                        const deltaX = moveDistance[2] - moveDistance[0];
                        const deltaY = moveDistance[3] - moveDistance[1];
        
                        rangeRects[selectedShape][0] += deltaX;
                        rangeRects[selectedShape][1] += deltaY;
        
                        const points = shapePoints[selectedShape];
                        for(let i = 0; i < points.length; i++) {
                            for(let m = 0; m < points[i].length; m++) {
                                if(m % 2 === 0) {
                                    points[i][m] += deltaX;
                                } else {
                                    points[i][m] += deltaY;
                                }
                            }
                        }
                        shapePoints[selectedShape] = points;
                        setShapePoints(JSON.parse(JSON.stringify(shapePoints)));
                    } 
                    setMoveDistance([0, 0, 0, 0]);
                    setIsTranslate(false);
                }
                
                if(isRotate) {
                    if(rotatePoints[0] === rotatePoints[2] && rotatePoints[1] === rotatePoints[3]) {
                        // right left button for adjusting texture
                        const currentX = e.changedTouches[0].clientX - canvasOffset[0];
                        const currentY = e.changedTouches[0].clientY - canvasOffset[1];
                        const t_disX = currentX - (rectPoints[0] + rectPoints[2]);
                        const t_disy = currentY - (rectPoints[1] + rectPoints[3]);
                        const t_dist = Math.sqrt(t_disX * t_disX + t_disy * t_disy);

                        if(t_dist < 20) {
                            if(!isAdjustTexture) {
                                adjustPoint[0] = rectPoints[0] + rectPoints[2];
                                adjustPoint[1] = rectPoints[1] + rectPoints[3] / 2;
                                setIsAdjustTexture(true);
                            } else {
                                adjustPoint[0] = 0;
                                adjustPoint[1] = 0;
                                setIsAdjustTexture(false);
                            }
                        } else {
                            setSelectedShape(-1);
                            setSelectedM(-1);
                            dispatch(selectCurrentTexture({
                                type: -1,
                                name: '',
                                url: '',
                            }));
                            setIsAdjustTexture(false);
                        }
                    } else {
                        setIsAdjustTexture(false);
                        const rectPoints = rangeRects[selectedShape];

                        // rotate shape points
                        const centerX = rectPoints[0] + 0.5 * rectPoints[2];
                        const centerY = rectPoints[1] + 0.5 * rectPoints[3];
                        const vec1 = [rotatePoints[0] - centerX, rotatePoints[1] - centerY];
                        const vec2 = [rotatePoints[2] - centerX, rotatePoints[3] - centerY];
                        const inmU = vec1[0] * vec2[0] + vec1[1] * vec2[1];
                        const cosV = inmU / (Math.sqrt(vec1[0] * vec1[0] + vec1[1] * vec1[1]) * Math.sqrt(vec2[0] * vec2[0] + vec2[1] * vec2[1]));
                        let rAngle = Math.acos(cosV);
                        if(vec1[0] * vec2[1] - vec1[1] * vec2[0] < 0) rAngle = -rAngle;
                        const points = shapePoints[selectedShape];
                        for(let n = 0; n < points.length; n++) {
                            for(let m = 0; m < points[n].length; ) {
                                const lenX = points[n][m] - centerX;
                                const lenY = points[n][m + 1] - centerY;
                                const len = Math.sqrt(lenX * lenX + lenY * lenY);
                                const pAngle = Math.atan2(lenY, lenX) + rAngle;
                                points[n][m] = centerX + len * Math.cos(pAngle);
                                points[n][m + 1] = centerY + len * Math.sin(pAngle);
                                m += 2;
                            }
                            // const lenX = points[n][0] - centerX;
                            // const lenY = points[n][1] - centerY;
                            // const len = Math.sqrt(lenX * lenX + lenY * lenY);
                            // const pAngle = Math.atan2(lenY, lenX) + rAngle;
                            // points[n][0] = centerX + len * Math.cos(pAngle);
                            // points[n][1] = centerY + len * Math.sin(pAngle);
                        }
                        shapePoints[selectedShape] = points;
                        setShapePoints(JSON.parse(JSON.stringify(shapePoints)));

                        // recompute shape rect
                        let leftTop = [points[0][0], points[0][1]];
                        let rightBottom = [points[0][0], points[0][1]];
                        points.forEach(p => {
                            if(p[0] < leftTop[0]) leftTop[0] = p[0];
                            if(p[0] > rightBottom[0]) rightBottom[0] = p[0];
                            if(p[1] < leftTop[1]) leftTop[1] = p[1];
                            if(p[1] > rightBottom[1]) rightBottom[1] = p[1];
                        });
                        rangeRects[selectedShape][0] = leftTop[0];
                        rangeRects[selectedShape][1] = leftTop[1];
                        rangeRects[selectedShape][2] = rightBottom[0] - leftTop[0];
                        rangeRects[selectedShape][3] = rightBottom[1] - leftTop[1];

                        shapeTextureInfo[selectedShape].rect = [];

                        setRotatePoints([0, 0, 0, 0]);
                    }
                    setIsRotate(false);
                }
            }
        }
    }

    // ref is used to get current info
    const [imageTexture, setImageTexture] = useState([]);
    const texturesRef = useRef({
        textureArr: []
    })

    const initialCanvasWidth = 900;
    useEffect(() => {
        if(selectedShape !== -1) {
            if(currentTexture.type === 0) {
                const index = imageTexture.findIndex(imgT => imgT.name === currentTexture.name);
                // console.log('wyh-test', index, imageTexture);
                if(index === -1) {
                    const img = new Image();
                    img.crossOrigin = '';
                    img.src = currentTexture.url;  // an amazing solution for cors  + '?' + new Date().getTime()
                    img.onload = () => {
                        const initCanvas = document.createElement('canvas');
                        initCanvas.width = initialCanvasWidth;
                        initCanvas.height = Math.round(initialCanvasWidth * 1024 / 1366);
                        const initImage = initCanvas.getContext('2d');
                        initImage.drawImage(img, 0, 0, img.width, img.height, 0, 0, initCanvas.width, initCanvas.height);

                        texturesRef.current.textureArr.push(initCanvas);  // 目前会push两次

                        imageTexture.push({
                            name: currentTexture.name,
                        });
                        setImageTexture(JSON.parse(JSON.stringify(imageTexture)));
                    }
                }

                if(currentTexture.name !==  shapeTextureInfo[selectedShape].name) {
                    shapeTextureInfo[selectedShape] = {
                        type: 0,
                        name: currentTexture.name,
                        rect: []
                    }
                    setShapeTextureInfo(JSON.parse(JSON.stringify(shapeTextureInfo)));
                }
            }
        }
    }, [selectedShape, currentTexture, shapeTextureInfo])

    // console.log('wyh-test-imageTexture', imageTexture, texturesRef.current, shapeTextureInfo)

    // draw
    useEffect(() => {
        if(shapePoints.length > 0) {
            const canvas = document.getElementById('painting-canvas');
            const canvasCont = canvas.getContext('2d');
            canvasCont.clearRect(0, 0, canvasSize[0], canvasSize[1]);
            if(savedCanvas !== null) {
                canvasCont.putImageData(savedCanvas, 0, 0);
            }
            canvasCont.lineJoin = 'round';
            canvasCont.lineCap = 'round';

            for(let i = 0; i < shapePoints.length; i++) {
                canvasCont.strokeStyle = selectedShape === i ? '#1990A1' : pencilStyle.color;
                canvasCont.lineWidth = selectedShape === i ? pencilStyle.size + 2 : pencilStyle.size;
                canvasCont.beginPath();
                let points;
                const rectPoints = rangeRects[i];
                if(selectedShape === i) {
                    points = JSON.parse(JSON.stringify(shapePoints[i]));

                    if(isScale) {
                        // scale
                        const lbx = rectPoints[0];
                        const lby = rectPoints[1] + rectPoints[3];
                        for(let n = 0; n < points.length; n++) {
                            for(let m = 0; m < points[n].length; m++) {
                                if(m % 2 === 0) {
                                    const vx = points[n][m] - lbx;
                                    points[n][m] = lbx + vx * scaleRatio[0];
                                } else {
                                    const vy = points[n][m] - lby;
                                    points[n][m] = lby + vy * scaleRatio[1];
                                }
                            }
                        }
                    }

                    // rotate
                    const centerX = rectPoints[0] + 0.5 * rectPoints[2];
                    const centerY = rectPoints[1] + 0.5 * rectPoints[3];
                    const vec1 = [rotatePoints[0] - centerX, rotatePoints[1] - centerY];
                    const vec2 = [rotatePoints[2] - centerX, rotatePoints[3] - centerY];
                    const inmU = vec1[0] * vec2[0] + vec1[1] * vec2[1];
                    const cosV = inmU / (Math.sqrt(vec1[0] * vec1[0] + vec1[1] * vec1[1]) * Math.sqrt(vec2[0] * vec2[0] + vec2[1] * vec2[1]));
                    let rAngle = Math.acos(cosV);
                    if(rAngle > 0) {
                        if(vec1[0] * vec2[1] - vec1[1] * vec2[0] < 0) rAngle = -rAngle;
                        for(let n = 0; n < points.length; n++) {

                            for(let m = 0; m < points[n].length; ) {
                                const lenX = points[n][m] - centerX;
                                const lenY = points[n][m + 1] - centerY;
                                const len = Math.sqrt(lenX * lenX + lenY * lenY);
                                const pAngle = Math.atan2(lenY, lenX) + rAngle;
                                points[n][m] = centerX + len * Math.cos(pAngle);
                                points[n][m + 1] = centerY + len * Math.sin(pAngle);
                                m += 2;
                            }


                            // const lenX = points[n][0] - centerX;
                            // const lenY = points[n][1] - centerY;
                            // const len = Math.sqrt(lenX * lenX + lenY * lenY);
                            // const pAngle = Math.atan2(lenY, lenX) + rAngle;
                            // points[n][0] = centerX + len * Math.cos(pAngle);
                            // points[n][1] = centerY + len * Math.sin(pAngle);
                        }
                    }
                } else {
                    points = shapePoints[i];
                }

                const deltaX = selectedShape === i ? moveDistance[2] - moveDistance[0] : 0;
                const deltaY = selectedShape === i ? moveDistance[3] - moveDistance[1] : 0;

                for(let k = 0; k < points.length; k++) {
                    for(let m = 0; m < points[k].length; m++) {
                        if(m % 2 === 0) {
                            points[k][m] += deltaX;
                        } else {
                            points[k][m] += deltaY;
                        }
                    }
                }

                for(let k = 0; k < points.length; k++) {
                    if(k === 0) {
                        canvasCont.moveTo(points[k][0], points[k][1]);
                    } else {
                        if(points[k].length === 2) {
                            canvasCont.lineTo(points[k][0], points[k][1]);
                        } else {
                            canvasCont.bezierCurveTo(points[k][0], points[k][1], points[k][2], points[k][3], points[k][4], points[k][5]);
                        }
                    }
                }

                if(shapeHasDrawed[i]) canvasCont.closePath();
                canvasCont.stroke();

                // fill
                if(shapeHasDrawed[i] && !isRotate && !isScale && !isTranslate) {
                    const textureInfo = shapeTextureInfo[i];
                    if(textureInfo.type === 0) {
                        const index = imageTexture.findIndex(imgT => imgT.name === textureInfo.name);

                        if(index !== -1) {
                            const initCanvas = texturesRef.current.textureArr[index];
                            const rangeW = rectPoints[2];
                            const rangeH = rectPoints[3];

                            let r_ltx, r_lty, r_w, r_h;
                            if(shapeTextureInfo[i].rect.length === 0) {
                                const wRatio = initCanvas.width / rangeW;
                                const hRatio = initCanvas.height / rangeH;
                                let adaptW, adaptH;
                
                                if(wRatio > 1 && hRatio > 1) {
                                    adaptW = rangeW;
                                    adaptH = rangeH;
                                } else {     
                                    if(wRatio > hRatio) {
                                        adaptW = initCanvas.height * (rangeW / rangeH);
                                        adaptH = initCanvas.height;
                                    } else {
                                        adaptW = initCanvas.width;
                                        adaptH = initCanvas.width * (rangeH / rangeW);
                                    }
                                }

                                r_ltx = (initCanvas.width - adaptW) / 2;
                                r_lty = (initCanvas.height - adaptH) / 2;
                                r_w = adaptW;
                                r_h = adaptH;
                                shapeTextureInfo[i].rect = [r_ltx, r_lty, r_w, r_h];
                            } else {
                                r_ltx = shapeTextureInfo[i].rect[0];
                                r_lty = shapeTextureInfo[i].rect[1];
                                r_w = shapeTextureInfo[i].rect[2];
                                r_h = shapeTextureInfo[i].rect[3];
                            }
            
                            const middleCanvas = document.createElement('canvas');
                            middleCanvas.width =  rangeW;
                            middleCanvas.height = rangeH;
                            const middleImage = middleCanvas.getContext('2d');
                            middleImage.drawImage(
                                initCanvas, 
                                r_ltx, 
                                r_lty, 
                                r_w, 
                                r_h,
                                0,
                                0, 
                                rangeW, 
                                rangeH
                            );
            
                            const pattern = canvasCont.createPattern(middleCanvas, 'no-repeat');

                            canvasCont.fillStyle = pattern;
                            canvasCont.save();
                            canvasCont.translate(rectPoints[0], rectPoints[1]);
                            canvasCont.fill();
                            canvasCont.restore();
                        }
                    }
                }
            }

            // draw max range rect
            if(selectedShape !== -1) {
                const deltaX = moveDistance[2] - moveDistance[0];
                const deltaY = moveDistance[3] - moveDistance[1];
                canvasCont.lineWidth = pencilStyle.size;
                const rectPoints = rangeRects[selectedShape];
                const usedRatio = 0.1;

                const sW = rectPoints[2] * scaleRatio[0];
                const sH = rectPoints[3] * scaleRatio[1];
                const ltx = rectPoints[0] + deltaX;
                const lty = rectPoints[1] + rectPoints[3] * (1 - scaleRatio[1]) + deltaY;

                // left top
                canvasCont.strokeStyle = '#888';
                canvasCont.beginPath();
                canvasCont.moveTo(ltx, lty + usedRatio * sH);
                canvasCont.lineTo(ltx, lty);
                canvasCont.lineTo(ltx + usedRatio * sW, lty);
                canvasCont.stroke();

                const rtx = ltx + sW;
                const rty = lty;

                // right top
                canvasCont.strokeStyle = '#1990A1';
                canvasCont.beginPath();
                canvasCont.moveTo(rtx - usedRatio * sW, rty);
                canvasCont.lineTo(rtx, rty);
                canvasCont.lineTo(rtx, rty + usedRatio * sH);
                canvasCont.stroke();

                const rbx = rtx;
                const rby = lty + sH;

                // right bottom
                canvasCont.strokeStyle = '#b6dadf';
                canvasCont.beginPath();
                canvasCont.moveTo(rbx, rby - usedRatio * sH);
                canvasCont.lineTo(rbx, rby);
                canvasCont.lineTo(rbx - usedRatio * sW, rby);
                canvasCont.stroke();

                const lbx = ltx;
                const lby = rby;

                // left bottom
                canvasCont.strokeStyle = '#888';
                canvasCont.beginPath();
                canvasCont.moveTo(lbx + usedRatio * sW, lby);
                canvasCont.lineTo(lbx, lby);
                canvasCont.lineTo(lbx, lby - usedRatio * sH);
                canvasCont.stroke();
            }

            // index-canvas
            const indexCanvas = document.getElementById('index-canvas');
            const indexCanvasCont = indexCanvas.getContext('2d');
            indexCanvasCont.clearRect(0, 0, canvasSize[0], canvasSize[1]);
            indexCanvasCont.strokeStyle = pencilStyle.color;
            indexCanvasCont.lineWidth = pencilStyle.size;
            indexCanvasCont.lineJoin = 'round';
            indexCanvasCont.lineCap = 'round';

            for(let i = 0; i < shapePoints.length; i++) {
                if(shapeHasDrawed[i]) {
                    indexCanvasCont.fillStyle = `rgba(${shapeIndex[i]}, 0, 0)`;
                    indexCanvasCont.beginPath();
                    const points = shapePoints[i];

                    for(let k = 0; k < points.length; k++) {
                        if(k === 0) {
                            indexCanvasCont.moveTo(points[k][0], points[k][1]);
                        } else {
                            if(points[k].length === 2) {
                                indexCanvasCont.lineTo(points[k][0], points[k][1]);
                            } else {
                                indexCanvasCont.bezierCurveTo(points[k][0], points[k][1], points[k][2], points[k][3], points[k][4], points[k][5]);
                            }
                        }
                    }
                    indexCanvasCont.closePath();
                    indexCanvasCont.stroke();
                    indexCanvasCont.fill();
                }
            }
        }
    }, [shapePoints, shapeHasDrawed, shapeIndex, pencilStyle, savedCanvas, selectedShape, moveDistance, isScale, scaleRatio, rotatePoints, shapeTextureInfo, rangeRects, imageTexture, isRotate, isTranslate])

    const dispatch = useDispatch();
    const adjustPanelWidth = 300;
    const adjustPanelHeight = Math.round(adjustPanelWidth * 1024 / 1366);
    const toTop = adjustPoint[1] - (adjustPanelHeight / 2);
    const index = selectedShape !== -1 ? imageTexture.findIndex(imgT => imgT.name === shapeTextureInfo[selectedShape].name) : -1;

    // console.log('wyh-test-isAdjustTexture', isAdjustTexture)
    const handleTextureAdjust = (newRect) => {
        shapeTextureInfo[selectedShape].rect = newRect;
        setShapeTextureInfo(JSON.parse(JSON.stringify(shapeTextureInfo)));
    }

    const handleMaskDrag = (center, svgUrl) => {
        // console.log('wyh-test-drag', center, svgUrl);
        fabric.loadSVGFromURL(svgUrl, (objects, _) => {
            // console.log('wyh-test-path', objects[0].path);

            const pathData = objects[0].path;
            const svgPoints = [];
            for(let i = 0; i < pathData.length; i++) {
                const mode = pathData[i][0];
                if(mode === 'z') {
                    break
                }
                svgPoints.push(pathData[i].slice(1, pathData[i].length))
            }

            // console.log('wyh-test-points', svgPoints);
            // add to shapePoints
            let newIndex = Math.round(Math.random(0, 1) * 255);
            while(shapeIndex.indexOf(newIndex) !== -1) {
                newIndex = Math.round(Math.random(0, 1) * 255);
            }
            shapeIndex.push(newIndex);

            shapeTextureInfo.push({
                type: -1,
                name: '',
                rect: []
            });

            let leftTop = [svgPoints[0][0], svgPoints[0][1]];
            let rightBottom = [svgPoints[0][0], svgPoints[0][1]];
            svgPoints.forEach(p => {
                let px, py;
                if(p.length === 2) {
                    px = p[0];
                    py = p[1];
                } else {
                    px = p[4];
                    py = p[5];
                }
                if(px < leftTop[0]) leftTop[0] = px;
                if(px > rightBottom[0]) rightBottom[0] = px;
                if(py < leftTop[1]) leftTop[1] = py;
                if(py > rightBottom[1]) rightBottom[1] = py;
            })


            const width = rightBottom[0] - leftTop[0];
            const height = rightBottom[1] - leftTop[1];

            // console.log('wyh-test-01', width, height)

            // scale to (128, _)
            const newWidth = 128;
            const ratio = newWidth / width;
            const newHeight = height * ratio;

            const cx = leftTop[0] + 0.5 * width;
            const cy = leftTop[1] + 0.5 * height;

            const deltaX = center[0] - cx;
            const deltaY = center[1] - cy;
            for(let i = 0; i < svgPoints.length; i++) {
                for(let k = 0; k < svgPoints[i].length; k++) {
                    if(k % 2 === 0) {
                        svgPoints[i][k] = (svgPoints[i][k] - cx) * ratio + cx + deltaX;
                    } else {
                        svgPoints[i][k] = (svgPoints[i][k] - cy) * ratio + cy + deltaY;
                    }
                }
            }

            rangeRects.push([
                center[0] - newWidth / 2,
                center[1] - newHeight / 2,
                newWidth,
                newHeight,
            ])

            shapeHasDrawed.push(true);
            shapePoints.push(svgPoints);
            setShapePoints(JSON.parse(JSON.stringify(shapePoints)));
        })
    }

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

            {
                isAdjustTexture && <div style={{
                    width: `${adjustPanelWidth}px`,
                    height: `${adjustPanelHeight}px`,
                    background: '#fff',
                    position: 'absolute',
                    left: `${adjustPoint[0] + 30}px`,
                    top: `${toTop}px`,
                    boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.25)',
                    caretColor: 'transparent',
                }}>
                    <AdjustPanel 
                        canvasSize={[adjustPanelWidth, adjustPanelHeight]}
                        imgCanvas={index !== -1 ? texturesRef.current.textureArr[index] : null}
                        rectPosition={shapeTextureInfo[selectedShape].rect}
                        scaleRatio={adjustPanelWidth / initialCanvasWidth}
                        imgLT={[adjustPoint[0] + 30, toTop + canvasOffset[1]]}
                        changeTexture={handleTextureAdjust}
                    />
                </div>
            }

            {/* material-circle */}
            <div className="Material-circle"
            style={{
                width: `${circleRadius}px`,
                height: `${circleRadius}px`,
                top: `-${0.1 * circleRadius}px`,
                left: `-${0.88 * circleRadius}px`,
            }}>
                <div className="Button-material"
                    onClick={() => {
                        if(selecetedM === 0) {
                            setSelectedM(-1);
                            dispatch(selectCurrentTexture({
                                type: -1,
                                name: '',
                                url: '',
                            }))
                        } else {
                            setSelectedM(0);
                        }
                    }}
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
                    onClick={() => {
                        if(selectedD === 0) {
                            setSelectedD(-1)
                        } else {
                            setSelectedD(0)
                        }
                        setSelectedShape(-1);
                    }}
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
                    onClick={() => {
                        if(selectedD === 1) {
                            setSelectedD(-1)
                        } else {
                            setSelectedD(1)
                        }
                        setSelectedShape(-1);
                    }}
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
                    onClick={() => {
                        if(selectedD === 2) {
                            setSelectedD(-1)
                        } else {
                            setSelectedD(2)
                        }
                        setSelectedShape(-1);
                    }}
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
                    // onClick={() => selectedD === 3 ? setSelectedD(-1) : setSelectedD(3)}
                    onClick={() => {
                        if(selectedShape !== -1) {
                            shapeIndex.splice(selectedShape, 1);
                            shapeTextureInfo.splice(selectedShape, 1);
                            rangeRects.splice(selectedShape, 1);
                            shapeHasDrawed.splice(selectedShape, 1);
                            shapePoints.splice(selectedShape, 1);
                            setSelectedShape(-1);
                        }
                    }}
                    />
                </div>
            </div>

            {/* mask circle */}
            <MaskCircle 
                circleRadius={circleRadius} 
                canvasWidth={canvasSize[0]} 
                canvasHeight={canvasSize[1]} 
                offsetHeight={canvasOffset[1]}
                dragMaskIntoCanvas={handleMaskDrag}
            />
        </div>
    )
}