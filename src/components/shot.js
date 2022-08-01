import "./shot.css";
import "./share.css";
import { useCallback, useEffect, useRef, useState } from "react";
import cameraLogo from "../camera.svg";
import grassTexture from "../grass.png";
import { fetchImageSegmentationResult } from "../api";

export default function Shot () {
    const sizeRatio = 1024 / 768;
    const padding = 30;
    const cameraContainRef = useRef(null);
    const [cameraContainSize, setCameraContainSize] = useState([0, 0]);
    useEffect(() => {
        const imgHeight = cameraContainRef.current?.clientHeight - 2 * padding || 0;
        const imgWidth = imgHeight > 0 ? imgHeight * sizeRatio : 0;
        setCameraContainSize([imgWidth, imgHeight]);
    }, [cameraContainRef])

    // console.log('wyh-test-01', cameraContainSize, sizeRatio)

    const textureContainRef = useRef(null);
    const [textureContainSize, setTextureContainSize] = useState([0, 0]);
    useEffect(() => {
        setTextureContainSize([
            textureContainRef.current?.clientWidth || 0, 
            textureContainRef.current?.clientHeight || 0, 
        ]);
    }, [textureContainRef])

    // fetch camera image
    const inputRef = useRef(null);
    const [imgSrc, setImgSrc] = useState("");
    const [anchors, setAnchors] = useState([]); // anchor的位置要做一个缩放计算
    const handleCameraImage = (e) => {
        const file = (e.target.files)[0];
        
        // fetch anchors - 30秒左右等待
        const imageData = new FormData();
        imageData.append("img", file);
        fetchImageSegmentationResult(imageData).then((res) => {
            console.log('wyh-test-02', res);
            setAnchors(res.anchors);
        })

        // display images
        const reader = new FileReader();
        reader.onloadend = () => {
            setImgSrc(reader.result);
            // send to backend
        }
        if(file) {
            reader.readAsDataURL(file);
        } else {
            setImgSrc("");
        }
    }

    const handleCameraClick = useCallback(() => {
        if(inputRef.current !== null) inputRef.current.click();
    }, [inputRef])

    const textureSize = textureContainSize[1] * 0.8;
    const paddingLeftV = (textureContainSize[1] - textureSize) / 2;
    return (
        <div className="Container">
            <div className="CameraContain" ref={cameraContainRef}>
                <div 
                    className="ImgContain"
                    onClick={handleCameraClick}
                    style={{
                        width: `${cameraContainSize[0]}px`,
                        height: `${cameraContainSize[1]}px`,
                    }}>
                        <img 
                            src={imgSrc === "" ? cameraLogo : imgSrc} 
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                        />
                </div>
                <input 
                    type='file' 
                    accept='image/*' 
                    capture='camera' 
                    onChange={handleCameraImage} 
                    ref={inputRef} 
                    style={{display: 'none'}}/>
            </div>
            <div className="TextureContain" ref={textureContainRef} style={{paddingLeft: `${paddingLeftV}px`}}>
                <div style={{
                    width: `${textureSize}px`,
                    height: `${textureSize}px`,
                    backgroundColor: 'antiquewhite',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img 
                        src={grassTexture} 
                        style={{
                            width: '90%',
                            height: '90%',
                        }}
                    />
                </div>
            </div>
        </div>
    )
}