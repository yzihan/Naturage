import { useState } from "react";

const tagImages = [
    'https://naturesketch.oss-cn-hangzhou.aliyuncs.com/audio/water-svg.svg',
    'https://naturesketch.oss-cn-hangzhou.aliyuncs.com/audio/wind-svg.svg',
    'https://naturesketch.oss-cn-hangzhou.aliyuncs.com/audio/rain-svg.svg',
    'https://naturesketch.oss-cn-hangzhou.aliyuncs.com/audio/insect-svg.svg',
]

export default function TagCircle ({
    circleRadius,
    canvasWidth,
    canvasHeight,
    selectNewTag,
    selectedTag,
}) {
    // compute angle
    const incircleRatio = 0.75;
    const distRatio = (1 - incircleRatio) / 2;
    const showCount = 3;
    const angle1 = Math.asin(0.15 / 0.5);
    const angle2 = Math.asin((0.95 * circleRadius - canvasHeight) / (0.5 * circleRadius));
    const itemAngle = (Math.PI / 2 - (angle1 + angle2)) / showCount;

    // slider
    const angle11 = Math.asin(0.15 / (0.5 * incircleRatio));
    const angle22 = Math.asin((0.95 * circleRadius - canvasHeight) / ((0.5 * incircleRatio) * circleRadius));
    const sliderPositionCount = tagImages.length > showCount ? (tagImages.length - showCount) + 1 : 1;
    const sliderPositionAngle = (Math.PI / 2 - (angle11 + angle22)) / sliderPositionCount;

    const [currentSlider, setCurrentSlider] = useState(0);
    // const [selectedTag, setSelectedTag] = useState(-1);

    // tag images
    const maxSize = distRatio * circleRadius;
    const svgMaxSize = 0.7 * maxSize;
    const centerR = (incircleRatio / 2 + (0.5 - incircleRatio / 2) / 2) * circleRadius;

    const tagItems = [];
    for(let i = currentSlider; i < currentSlider + showCount; i++) {
        const angle = angle2 + (i + 0.5 - currentSlider) * itemAngle;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const centerToLeft = 0.5 * circleRadius - centerR * cosAngle;
        const centerToTop = 0.5 * circleRadius - centerR * sinAngle;
        tagItems.push(
            <div key={`tag-${i}`}
                style={{
                    width: `${svgMaxSize}px`,
                    height: `${svgMaxSize}px`,
                    backgroundImage: `url(${tagImages[i]})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    boxSizing: 'border-box',
                    border: `5px solid rgba(255, 255, 255, ${selectedTag === i ? 1 : 0})`,
                    borderRadius: '20%',
                    position: 'absolute',
                    left: `${centerToLeft - svgMaxSize / 2}px`,
                    top: `${centerToTop - svgMaxSize / 2}px`,
                    transformOrigin: 'center',
                    transform: `rotate(-${Math.PI / 2 - angle}rad)`
                }}
                onClick={() => {
                    if(selectedTag !== i) {
                        selectNewTag(i, tagImages[i]);
                    } else {
                        selectNewTag(-1, '');
                    }
                }}
            />
        )
    }

    // slider - same as maskCircle
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

        {tagItems}
        
        <div style={{
            width: '20%',
            height: '8%',
            position: 'absolute',
            top: `${0.245 * circleRadius}px`,
            left: `${0.18 * circleRadius}px`,
        }}>
            <div className='TitleContain'>
                <span className='Title'>Tag</span>
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
    </div>
}