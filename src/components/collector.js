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
import { addAudioData } from "../store/GlobalStore";

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

    const [audioUrlData, setAudioUrlData] = useState('');
    const [newAudioTag, setNewAudioTag] = useState('');
    const [hasSetTag, setHasSetTag] = useState(false);
    const [selectedTag, setSelectedTag] = useState(-1);

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

    // audio data

    const handleChaClick = () => {
        if(selecetedM === -1) {
            setSelectedM(0);
        } else {
            if(selecetedM === 0) {
                // image
            } else if (selecetedM === 1) {
                // audio
                setSelectedM(-1);

            } else if (selecetedM === 2) {
                // video
            }
        }
    }
    
    const recorderRef = useRef({
        mediaRecorder: null,
        audioData: []
    });

    const handlePlayClick = () => {
        if(selecetedM === -1) {
            setSelectedM(1);
        } else {
            if(selecetedM === 0) {
                // image
            } else if (selecetedM === 1) {
                // audio
                if(isPlay) {
                    const mediaRecorder = recorderRef.current.mediaRecorder;
                    if(mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                        mediaRecorder.onstop = (e) => {
                            const blob = new Blob(recorderRef.current.audioData, {type: 'audio/ogg; codecs=opus'});  // 一定要用最新的
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
        } else {
            if(selecetedM === 0) {
                // image
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

            }
        }
    }

    const handleTagSelect = (i, tagUrl) => {
        setSelectedTag(i);
        setNewAudioTag(tagUrl);
    }

    return (
        <div className="Container" 
        ref={canvasRef}
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
                        background: `${selecetedM === 1 ? (hasSetTag ? '#D5E9E9' : '#bbb') : '#D5E9E9'}`
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
                            src={audioUrlData === '' ? 'https://naturesketch.oss-cn-hangzhou.aliyuncs.com/audio/cicada-01.mp3' : audioUrlData}
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
        </div>
    )
}