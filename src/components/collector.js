import "./share.css";
import "./collector.css";
import textureBlackSvg from "../svg/texture_black.svg";
import audioBlackSvg from "../svg/audio_black.svg";
import videoBlackSvg from "../svg/video_black.svg";
import chaSvg from "../svg/cha.svg";
import gouSvg from "../svg/gou.svg";
import recorderSvg from "../svg/recorder.svg";
import stopSvg from "../svg/stop.svg";

import { useEffect, useRef, useState } from "react";
import TagCircle from "./tagCircle";
import { useDispatch } from "react-redux";
import { addAudioData, addImageData, addVideoData } from "../store/GlobalStore";
import { fetchImageSegmentationResult } from "../api";

export default function Collector ({
    circleRadius,
}) {
    const buttionRadius = 0.115 * circleRadius;
    const iconSize = 0.28 * buttionRadius;

    const canvasRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState([0, 0]);
    useEffect(() => {
        setCanvasSize([
            canvasRef.current?.clientWidth || 0,
            canvasRef.current?.clientHeight || 0
        ]);
    }, [canvasRef])

    const [selecetedM, setSelectedM] = useState(-1); // 0: texture; 1: audio; 2: video

    const [isPlay, setIsPlay] = useState(false);

    const recorderRef = useRef({
        mediaRecorder: null,
        audioData: [],
        videoStream: null,
        videoData: [],
    });

    const [audioUrlData, setAudioUrlData] = useState('');
    const [newAudioTag, setNewAudioTag] = useState('');
    const [hasSetTag, setHasSetTag] = useState(false);
    const [selectedTag, setSelectedTag] = useState(-1);

    const [videoUrlData, setVideoUrlData] = useState('');

    const videoRBGW = 0.85 * circleRadius;
    const videoRBGH = videoRBGW * 1024 / 1366;

    const inputRef = useRef(null);
    const [imgSrc, setImgSrc] = useState("");
    const [anchors, setAnchors] = useState([]);
    const handleCameraImage = (e) => {
        const file = (e.target.files)[0];
        
        // fetch anchors - 30秒左右等待
        const imageData = new FormData();
        imageData.append("img", file);
        fetchImageSegmentationResult(imageData).then((res) => {
            console.log('wyh-test-02', res);
            setAnchors(res.anchors);
            // setImgSrc(res.image);  // return base64 image
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

    useEffect(() => {
        if(selecetedM === 1) {
            if(audioUrlData !== '') {
                if(newAudioTag !== '') {
                    setHasSetTag(true);
                } else {
                    setHasSetTag(false);
                }
            } else {
                setHasSetTag(false);
            }
        }
    }, [newAudioTag, audioUrlData, selecetedM])

    const handleChaClick = () => {
        if(selecetedM === -1) {
            setSelectedM(0);
        } else {
            if(selecetedM === 0) {
                // image
                setSelectedM(-1);
                setImgSrc('');
                setAnchors([]);
            } else if (selecetedM === 1) {
                // audio
                setIsPlay(false);
                setSelectedM(-1);
                setAudioUrlData('');
                setNewAudioTag('');
                setHasSetTag('false');
                setSelectedTag(-1);
                recorderRef.current.mediaRecorder = null;

            } else if (selecetedM === 2) {
                // video
                setIsPlay(false);
                setSelectedM(-1);
                setVideoUrlData('');
                recorderRef.current.mediaRecorder = null;
            }
        }
    }

    const handlePlayClick = () => {
        if(selecetedM === -1) {
            setSelectedM(1);
        } else {
            if(selecetedM === 0) {
                // image
                if(inputRef.current !== null) inputRef.current.click();

            } else if (selecetedM === 1) {
                // audio
                if(isPlay) {
                    const mediaRecorder = recorderRef.current.mediaRecorder;
                    if(mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                        mediaRecorder.onstop = (e) => {
                            const blob = new Blob(recorderRef.current.audioData, {type: 'audio/mp3; codecs=opus'});  // ios不支持 audio/ogg
                            recorderRef.current.audioData = [];

                            const audioURL = URL.createObjectURL(blob);
                            console.log('wyh-test-audioURL', audioURL);
                            setAudioUrlData(audioURL);
                            setIsPlay(false);
                        }
                    }
                } else {
                    setIsPlay(true);
                    setAudioUrlData('');
                    if(recorderRef.current.mediaRecorder === null) {
                        navigator.mediaDevices.getUserMedia({
                            audio: true
                        }).then(stream => {
                            const mediaRecorder = new MediaRecorder(stream);

                            mediaRecorder.start();
                            mediaRecorder.ondataavailable = (e) => {
                                recorderRef.current.audioData.push(e.data);
                            }
                            
                            recorderRef.current.mediaRecorder = mediaRecorder;
                        })
                    } else {
                        const mediaRecorder = recorderRef.current.mediaRecorder;
                        mediaRecorder.start();
                        mediaRecorder.ondataavailable = (e) => {
                            recorderRef.current.audioData.push(e.data);
                        }
                    }
                }
            } else if (selecetedM === 2) {
                // video

                if(isPlay) {
                    const mediaRecorder = recorderRef.current.mediaRecorder;
                    if(mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                        mediaRecorder.onstop = (e) => {
                            const blob = new Blob(recorderRef.current.videoData, {type: 'video/mp4; codecs="avc1.4D401E, mp4a.40.2"'});
                            recorderRef.current.videoData = [];

                            const videoURL = URL.createObjectURL(blob);
                            console.log('wyh-test-videoURL', videoURL);
                            const videoDiv = document.getElementById('video-play');
                            videoDiv.controls = true;
                            videoDiv.srcObject = null;
                            videoDiv.src = videoURL;

                            setVideoUrlData(videoURL);
                            setIsPlay(false);
                        }
                    }
                } else {
                    setIsPlay(true);
                    if(recorderRef.current.mediaRecorder === null) {
                        const mediaRecorder = new MediaRecorder(recorderRef.current.videoStream, {mimeType: 'video/mp4; codecs="avc1.4D401E, mp4a.40.2"'});  // windows和ios支持的mimeType不同
                        mediaRecorder.start();
                        mediaRecorder.ondataavailable = (e) => {
                            recorderRef.current.videoData.push(e.data);
                        }
                        
                        recorderRef.current.mediaRecorder = mediaRecorder;
                    } else{
                        const mediaRecorder = recorderRef.current.mediaRecorder;
                        mediaRecorder.start();
                        mediaRecorder.ondataavailable = (e) => {
                            recorderRef.current.videoData.push(e.data);
                        }
                    }
                }
            }
        }
    }

    // test
    if(selecetedM === 1) {
        const audio = document.getElementById('audio-play');
        if(audio !== null) {
            audio.onerror = (e) => {
                console.log('wyh-test-error', audio.error.code, audio.error.message)
            }
        }
    }

    const dispatch = useDispatch();

    const handleGouClick = () => {
        if(selecetedM === -1) {
            setSelectedM(2);

            // initialize
            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: videoRBGW * 0.9,
                    height: videoRBGH * 0.9
                },
                audio: true,
            }).then(stream => {
                recorderRef.current.videoStream = stream;
                const videoDiv = document.getElementById('video-play');
                videoDiv.controls = false;
                videoDiv.srcObject = stream;
                videoDiv.play();
            }).catch(error => {
                console.log('wyh-test-video-recorder-error', error);
            })
            
        } else {
            if(selecetedM === 0) {
                // image
                if(imgSrc !== '') {
                    const newName = new Date().getTime();
                    dispatch(addImageData({
                        name: newName.toString(),
                        imageURL: imgSrc,
                    }))
                    setImgSrc('');
                    setAnchors([]);
                }
            } else if (selecetedM === 1) {
                // audio
                if(hasSetTag) {
                    const newName = new Date().getTime();
                    dispatch(addAudioData({
                        name: newName.toString(),
                        idImage: newAudioTag,
                        audioURL: audioUrlData,
                    }))
                    setNewAudioTag('');
                    setAudioUrlData('');
                    setSelectedTag(-1);
                }

            } else if (selecetedM === 2) {
                // video
                if(videoUrlData !== '') {
                    const newName = new Date().getTime();
                    const videoDiv = document.getElementById('video-play');
                    dispatch(addVideoData({
                        name: newName.toString(),
                        videoURL: videoDiv.src,
                    }))

                    videoDiv.controls = false;
                    videoDiv.srcObject = recorderRef.current.videoStream;
                    videoDiv.src = null;
                    videoDiv.play();
                    setVideoUrlData('');
                }
            }
        }
    }

    const handleTagSelect = (i, tagUrl) => {
        setSelectedTag(i);
        setNewAudioTag(tagUrl);
    }

    // https://naturesketch.oss-cn-hangzhou.aliyuncs.com/image/flash.png
    const flashSize = 100;
    const flashItems = anchors.map((anchor, idx) => {
        const left = anchor[0] * (videoRBGW * 0.9) - flashSize / 2;
        const top = anchor[1] * (videoRBGH * 0.9) - flashSize / 2;
        return <div key={`flash-${idx}`}
            style={{
                backgroundImage: 'url(https://naturesketch.oss-cn-hangzhou.aliyuncs.com/image/flash.png)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                width: `${flashSize}px`,
                height: `${flashSize}px`,
                position: 'absolute',
                left: `${left}px`,
                top: `${top}px`,
            }}
        />
    })

    return (
        <div className="Container" 
        ref={canvasRef}
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            caretColor: 'transparent'
        }}>

            {/* material-circle */}
            <div className="Material-circle"
            style={{
                width: `${circleRadius}px`,
                height: `${circleRadius}px`,
                top: `-${0.1 * circleRadius}px`,
                left: `-${0.88 * circleRadius}px`,
            }}>
                <div className="Button-material"
                    onClick={handleChaClick}
                    style={{
                        width: `${buttionRadius}px`,
                        height: `${buttionRadius}px`,
                        top: `${0.25 * circleRadius}px`,
                        left: `${circleRadius - 0.88 * buttionRadius}px`,
                    }}>
                        <div style={{
                            backgroundImage: `url(${selecetedM === -1 ? textureBlackSvg : chaSvg})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'contain',
                            width: `${iconSize}px`,
                            height: `${iconSize}px`,
                        }}/>
                </div>

                <div className="Button-material"
                    onClick={handlePlayClick}
                    style={{
                        width: `${buttionRadius}px`,
                        height: `${buttionRadius}px`,
                        top: `${0.45 * circleRadius}px`,
                        left: `${circleRadius - buttionRadius / 2}px`,
                    }}>
                        <div style={{
                            backgroundImage: `url(${selecetedM === -1 ? audioBlackSvg : (isPlay ? stopSvg : recorderSvg)})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'contain',
                            width: `${iconSize}px`,
                            height: `${iconSize}px`,
                        }}/>
                </div>

                <div className="Button-material"
                    onClick={handleGouClick}
                    style={{
                        width: `${buttionRadius}px`,
                        height: `${buttionRadius}px`,
                        top: `${0.65 * circleRadius}px`,
                        left: `${circleRadius - 0.88 * buttionRadius}px`,
                        background: `${selecetedM === 1 ? (hasSetTag ? '#D5E9E9' : '#bbb') : (selecetedM === 2 ? (videoUrlData === '' ? '#bbb' : '#D5E9E9') : (selecetedM === 0 ? (imgSrc === '' ? '#bbb' : '#D5E9E9') : '#D5E9E9'))}`
                    }}>
                        <div style={{
                            backgroundImage: `url(${selecetedM === -1 ? videoBlackSvg : gouSvg})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'contain',
                            width: `${iconSize}px`,
                            height: `${iconSize}px`,
                        }}/>
                </div>
            </div>

            {
                // audio 
                selecetedM === 1 && 
                <div style={{
                    width: '55%',
                    height: '50%',
                    // background: '#bbb',
                }}>
                    <div style={{
                        width: '100%',
                        height: '80%',
                        backgroundImage: 'url(https://naturesketch.oss-cn-hangzhou.aliyuncs.com/audio/bofeng2.png)',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '100% 100%',
                    }}/>
    
                    <div style={{
                        width: '100%', 
                        height: '20%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <audio id='audio-play'
                            controls
                            preload='auto'
                            src={audioUrlData}
                            style={{
                                width: '80%',
                            }}
                        />
                    </div>
                </div>
            }
 
            {/* tag selection */}
            {
                selecetedM === 1 &&
                <TagCircle 
                    circleRadius={circleRadius} 
                    canvasWidth={canvasSize[0]} 
                    canvasHeight={canvasSize[1]}
                    selectNewTag={handleTagSelect}
                    selectedTag={selectedTag}
                />
            }

            {
                // video
                selecetedM === 2 && 
                <div style={{
                    width: `${videoRBGW}px`,
                    height: `${videoRBGH}px`,
                    backgroundImage: 'url(https://naturesketch.oss-cn-hangzhou.aliyuncs.com/video/videoRecorder.png)',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '100% 100%',
                    marginLeft: `${videoRBGW * 0.18}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <video id='video-play' 
                    style={{
                        borderRadius: `${videoRBGH * 0.1}px`
                    }}/>
                </div>
            }

            {
                // image
                selecetedM === 0 &&
                <div style={{
                    width: `${videoRBGW}px`,
                    height: `${videoRBGH}px`,
                    backgroundImage: 'url(https://naturesketch.oss-cn-hangzhou.aliyuncs.com/video/videoRecorder.png)',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '100% 100%',
                    marginLeft: `${videoRBGW * 0.18}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div 
                        style={{
                            width: `${videoRBGW * 0.9}px`,
                            height: `${videoRBGH * 0.9}px`,
                            borderRadius: `${videoRBGH * 0.1}px`,
                            backgroundImage: `url(${imgSrc})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '100% 100%',
                            position: 'relative',
                        }}
                    >
                        {flashItems}
                    </div>
                    <input 
                        type='file' 
                        accept='image/*' 
                        capture='camera' 
                        onChange={handleCameraImage} 
                        ref={inputRef} 
                        style={{display: 'none'}}
                    />
                </div>
            }
        </div>
    )
}