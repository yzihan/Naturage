import './maskCircle.css';
import clothSvg from '../svg/mask/cloth.svg';
import cloudSvg from '../svg/mask/cloud.svg';
import loveSvg from '../svg/mask/love.svg';
import qqSvg from '../svg/mask/qq.svg';
import { useState } from 'react';

const maskSvgs = [
    {
        svg: clothSvg,
        svgPath: ''
    },
    {
        svg: loveSvg,
        svgPath: ''
    },
    {
        svg: cloudSvg,
        svgPath: ''
    },
    {
        svg: qqSvg,
        svgPath: ''
    },
]

export default function MaskCircle ({
    circleRadius,
    canvasWidth,
    canvasHeight,
    offsetHeight,
    dragMaskIntoCanvas,
}) {
    // compute angle
    const incircleRatio = 0.75;
    const distRatio = (1 - incircleRatio) / 2;
    const showCount = 3;
    const angle1 = Math.asin(0.15 / 0.5);
    const angle2 = Math.asin((0.95 * circleRadius - canvasHeight) / (0.5 * circleRadius));
    const itemAngle = (Math.PI / 2 - (angle1 + angle2)) / showCount;

    // console.log('wyh-test-angle', angle1, angle2, itemAngle);

    // slider
    const angle11 = Math.asin(0.15 / (0.5 * incircleRatio));
    const angle22 = Math.asin((0.95 * circleRadius - canvasHeight) / ((0.5 * incircleRatio) * circleRadius));
    const sliderPositionCount = maskSvgs.length > showCount ? (maskSvgs.length - showCount) + 1 : 1;
    const sliderPositionAngle = (Math.PI / 2 - (angle11 + angle22)) / sliderPositionCount;

    const [currentSlider, setCurrentSlider] = useState(0);

    // mask images
    const maxSize = distRatio * circleRadius;
    const scaleMaxSize = 0.8 * maxSize;
    const svgMaxSize = 0.7 * maxSize;
    const centerR = (incircleRatio / 2 + (0.5 - incircleRatio / 2) / 2) * circleRadius;

    const [isMaskDrag, setIsMaskDrag] = useState(false);
    const [maskMoveP, setMaskMoveP] = useState([0, 0]);
    const [selectedMask, setSelectedMask] = useState('');

    const handleSvgDragStart = (svg, e) => {
        // console.log('wyh-test-01', svg, e.changedTouches[0].clientX);
        setIsMaskDrag(true);
        setSelectedMask(svg);
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
            dragMaskIntoCanvas(
                [
                    e.changedTouches[0].clientX,
                    e.changedTouches[0].clientY - offsetHeight
                ],
                selectedMask
            )
            setIsMaskDrag(false);
            setMaskMoveP([0, 0])
            setSelectedMask('');
        }
    }

    const maskItems = [];
    for(let i = currentSlider; i < currentSlider + showCount; i++) {
        const angle = angle2 + (i + 0.5 - currentSlider) * itemAngle;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const centerToLeft = 0.5 * circleRadius - centerR * cosAngle;
        const centerToTop = 0.5 * circleRadius - centerR * sinAngle;
        maskItems.push(
            <div key={`mask-${i}`}
                onTouchStart={(e) => handleSvgDragStart(maskSvgs[i].svg, e)}
                onTouchMove={handleSvgDragMove}
                onTouchEnd={handleSvgDragEnd}
            >
                <div
                    style={{
                        width: `${scaleMaxSize}px`,
                        height: `${scaleMaxSize}px`,
                        background: '#fff',
                        borderRadius: '50%',
                        position: 'absolute',
                        left: `${centerToLeft - scaleMaxSize / 2}px`,
                        top: `${centerToTop - scaleMaxSize / 2}px`,
                        transformOrigin: 'center',
                        transform: `rotate(-${Math.PI / 2 - angle}rad)`
                    }}
                />

                <div
                    style={{
                        width: `${svgMaxSize}px`,
                        height: `${svgMaxSize}px`,
                        background: `url(${maskSvgs[i].svg}) no-repeat`,
                        backgroundSize: 'contain',
                        position: 'absolute',
                        left: `${centerToLeft - svgMaxSize / 2}px`,
                        top: `${centerToTop - svgMaxSize / 2}px`,
                        transformOrigin: 'center',
                        transform: `rotate(-${Math.PI / 2 - angle}rad)`
                    }}
                />
            </div>
        )
    }

    const [isDrag, setIsDrag] = useState(false);
    const [sliderMoveP, setSliderMoveP] = useState([0, 0]);

    // slider point
    const s_r = circleRadius * incircleRatio / 2 - 4;  // - half of solid border width
    const slider_r = maxSize * 0.2;
    
    const handleOnTouchStart = (e) => {
        setIsDrag(true);
    }

    const handleOnTouchMove = (e) => {
        // 简单点吧
        const currentX = e.changedTouches[0].clientX;

        if(isDrag) {
            const x = canvasWidth - currentX + 0.15 * circleRadius;
            const a = Math.acos(x / s_r);
            setSliderMoveP([
                0.5 * circleRadius - x - slider_r / 2,
                0.5 * circleRadius - s_r * Math.sin(a) - slider_r / 2
            ])
        }
    }

    const handleOnTouchEnd = (e) => {
        if(isDrag) {
            const currentX = e.changedTouches[0].clientX;
            const x = canvasWidth - currentX + 0.15 * circleRadius;
            const a = Math.acos(x / s_r);
            const index = Math.floor((a - angle22) / sliderPositionAngle);
            setCurrentSlider(index);
            setIsDrag(false);
        }
    }

    const s_angle = angle22 + (currentSlider + 0.5) * sliderPositionAngle;
    const s_cosAngle = Math.cos(s_angle);
    const s_sinAngle = Math.sin(s_angle);
    const s_left = 0.5 * circleRadius - s_r * s_cosAngle - slider_r / 2;
    const s_top = 0.5 * circleRadius - s_r * s_sinAngle - slider_r / 2;

    return <div className="Mask-circle" 
        style={{
            width: `${circleRadius}px`,
            height: `${circleRadius}px`,
            top: `${0.45 * circleRadius}px`,
            right: `-${ 0.65 * circleRadius}px`,
            background: 'radial-gradient(circle at 50% 50%, #fff, #1990A1)'
        }}>
            <div className="Mask-circle"
                style={{
                    width: `${circleRadius * incircleRatio}px`,
                    height: `${circleRadius * incircleRatio}px`,
                    border: '8px solid #fff',
                    top: `${distRatio* circleRadius}px`,
                    left: `${distRatio * circleRadius}px`,
                }}
            />

            {maskItems}

            <div style={{
                width: '20%',
                height: '8%',
                position: 'absolute',
                top: `${0.245 * circleRadius}px`,
                left: `${0.18 * circleRadius}px`,
            }}>
                <div className='TitleContain'>
                    <span className='Title'>Mask</span>
                </div>
                <div className='TitleContain'>
                    <span className='Title'>Selection</span>
                </div>
            </div>

            <div id='slider'
                style={{
                    width: `${slider_r}px`,
                    height: `${slider_r}px`,
                    background: '#fff',
                    borderRadius: '50%',
                    position: 'absolute',
                    left: `${isDrag ? sliderMoveP[0] : s_left}px`,
                    top: `${isDrag ? sliderMoveP[1] : s_top}px`,
                }}
                onTouchStart={handleOnTouchStart}
                onTouchMove={handleOnTouchMove}
                onTouchEnd={handleOnTouchEnd}
            />

            {
                isMaskDrag && <div 
                    style={{
                        width: `${svgMaxSize}px`,
                        height: `${svgMaxSize}px`,
                        background: `url(${selectedMask}) no-repeat`,
                        backgroundSize: 'contain',
                        position: 'absolute',
                        left: `${maskMoveP[0] - (canvasWidth - 0.35 * circleRadius) - svgMaxSize / 2}px`,
                        top: `${maskMoveP[1] - (offsetHeight + 0.45 * circleRadius) - svgMaxSize / 2}px`,
                    }}
                />
            }
    </div>
}