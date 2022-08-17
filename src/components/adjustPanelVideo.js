import { useEffect, useState } from "react";


export default function AdjustPanelVideo ({
    canvasSize,
    videoDiv,
    rectPosition,
    imgLT,
    forLeft,
    forTop,
    changeTexture
}) {
    const divHeight = videoDiv === null ? canvasSize[1] : canvasSize[0] * videoDiv.videoHeight / videoDiv.videoWidth;

    let timer = null;
    useEffect(() => {
        if(videoDiv !== null) {
            timer = setInterval(() => {
                const canvas = document.getElementById('texture-canvas');
                const canvasCont = canvas.getContext('2d');
                canvasCont.drawImage(
                    videoDiv, 
                    0,
                    0,
                    videoDiv.videoWidth,
                    videoDiv.videoHeight,
                    0,
                    0, 
                    canvasSize[0], 
                    divHeight
                );
            }, 1000/30)
        }
    }, [videoDiv])

    // same as componentwillunmount 
    useEffect(() => {
        // console.log('create ********')
        return () => {
            // console.log('destroy ********')
            clearInterval(timer);
            timer = null;
        }
    }, [])

    const scaleRatio = videoDiv !== null ? canvasSize[0] / videoDiv.videoWidth : 1;
    const heightOffset  = imgLT[1] + forTop - divHeight / 2;
    const r_ltx = rectPosition[0] * scaleRatio;
    const r_lty = rectPosition[1] * scaleRatio;
    const r_w = rectPosition[2] * scaleRatio;
    const r_h = rectPosition[3] * scaleRatio;

    const [moveDistance, setMoveDistance] = useState([0, 0, 0, 0]); // move vector
    const [isTranslate, setIsTranslate] = useState(false);

    const [isScale, setIsScale] = useState(false);
    const [scaleRatio2, setScaleRatio2] = useState([1, 1]);

    const handleOnTouchStart = (e) => {
        if(rectPosition.length > 0) {
            const currentX = e.changedTouches[0].clientX - imgLT[0];
            const currentY = e.changedTouches[0].clientY - heightOffset;

            if(currentX >= r_ltx && currentX < (r_ltx + r_w) && currentY >= r_lty && currentY < (r_lty + r_h)) {
                moveDistance[0] = currentX;
                moveDistance[1] = currentY;
                moveDistance[2] = moveDistance[0];
                moveDistance[3] = moveDistance[1];
                setIsTranslate(true);
            } else {
                const distX = currentX - (r_ltx + r_w);
                const distY = currentY - r_lty ; 
                const dist = Math.sqrt(distX * distX + distY * distY);
                if(dist < 20) {
                    setIsScale(true);
                }
            }
        }
    }

    const handleOnTouchMove = (e) => {
        const currentX = e.changedTouches[0].clientX - imgLT[0];
        const currentY = e.changedTouches[0].clientY - heightOffset;

        if(isTranslate) {
            moveDistance[2] = currentX;
            moveDistance[3] = currentY;
            setMoveDistance(JSON.parse(JSON.stringify(moveDistance)));
        }
        if(isScale) {
            scaleRatio2[0] = (currentX - r_ltx) / r_w;
            scaleRatio2[1] = scaleRatio2[0]; // set same 
            setScaleRatio2(JSON.parse(JSON.stringify(scaleRatio2)));
        }
    }

    const handleOnTouchEnd = (e) => {
        if(isTranslate) {
            if(moveDistance[0] !== moveDistance[2] || moveDistance[1] !== moveDistance[3]) {
                changeTexture([
                    (r_ltx + moveDistance[2] - moveDistance[0]) / scaleRatio,
                    (r_lty + moveDistance[3] - moveDistance[1]) / scaleRatio,
                    rectPosition[2],
                    rectPosition[3]
                ])
            }
            setIsTranslate(false);
            setMoveDistance([0, 0, 0, 0]);
        }

        if(isScale) {
            if(scaleRatio2[0] !== 1 || scaleRatio2[1] !== 1) {
                changeTexture([
                    r_ltx / scaleRatio,
                    (r_lty + r_h - r_h * scaleRatio2[1]) / scaleRatio,
                    rectPosition[2] * scaleRatio2[0],
                    rectPosition[3] * scaleRatio2[1],
                ])
            }
            setIsScale(false);
            setScaleRatio2([1, 1]);
        }
    }

    useEffect(() => {
        if(videoDiv !== null) {
            const canvas = document.getElementById('mask-canvas');
            const canvasCont = canvas.getContext('2d');
            canvasCont.clearRect(0, 0, canvasSize[0], divHeight);

            const deltaX = moveDistance[2] - moveDistance[0];
            const deltaY = moveDistance[3] - moveDistance[1];

            const r_ltx_2 = r_ltx + deltaX;
            const r_lty_2 = r_lty + r_h - r_h * scaleRatio2[1] + deltaY;
            const r_w_2 = r_w * scaleRatio2[0];
            const r_h_2 = r_h * scaleRatio2[1];

            // console.log('wyh-test-mask', scaleRatio, canvasSize[0], videoDiv.videoWidth, r_ltx_2 , r_lty_2, r_w_2, r_h_2)

            canvasCont.fillStyle = 'rgba(255, 255, 255, 0.6)'
            canvasCont.fillRect(r_ltx_2 , r_lty_2, r_w_2, r_h_2);

            // reuse for drawing anchors
            const sW = r_w_2;
            const sH = r_h_2;
            const ltx = r_ltx_2;
            const lty = r_lty_2;
            const usedRatio = 0.1;
            canvasCont.lineWidth = 3;

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
            canvasCont.strokeStyle = '#888';
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
    }, [videoDiv, rectPosition, moveDistance, scaleRatio2, r_w, r_h, r_ltx, r_lty])

    return <div style={{
        width: `${canvasSize[0]}px`,
        height: `${divHeight}px`,
        background: '#fff',
        position: 'absolute',
        left: `${forLeft}px`,
        top: `${forTop - divHeight / 2}px`,
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.25)',
        caretColor: 'transparent',
    }}>
        <canvas 
            id='texture-canvas' 
            width={canvasSize[0]} 
            height={divHeight}
            style={{
                position: 'absolute',
                left: '0px',
                top: '0px',
            }}
        />

        <canvas 
            id='mask-canvas' 
            width={canvasSize[0]} 
            height={divHeight}
            style={{
                position: 'absolute',
                left: '0px',
                top: '0px',
            }}
            onTouchStart={handleOnTouchStart}
            onTouchMove={handleOnTouchMove}
            onTouchEnd={handleOnTouchEnd}
        />

    </div>
}