import './App.css';
import { Link, Route, Routes, BrowserRouter } from 'react-router-dom';
import 'antd/dist/antd.min.css';
import boardSvg from "./svg/board.svg";
import boardBlackSvg from "./svg/board_black.svg";
import collectorSvg from "./svg/collector.svg";
import materialBlackSvg from "./svg/material_black.svg";
import materialSvg from "./svg/material.svg";
import collectorBlackSvg from "./svg/collector_black.svg";
import { useEffect, useRef, useState } from 'react';
import Collector from './components/collector';
import Board from './components/board';

function App() {
    const menuRef = useRef(null);
    const [menuRefHeight, setMenuRefHeight] = useState(0);
    useEffect(() => {
        setMenuRefHeight(menuRef.current?.clientHeight || 0);
    }, [menuRef])
    const iconSize = 0.7 * menuRefHeight;
    const circleRatio = 18;

    const [selectedItem, setSelectedItem] = useState(2);

    useEffect(() => {
        const app = document.getElementById('app');
        app.addEventListener("touchmove", e => {
            // console.log('wyh-test-01-father')
            e.preventDefault(); // 这玩意会被继承
            // return false
        }, {
            useCapture: false,
            passive: false
        })
    }, [])

    const texturesRef = useRef({
        textureArr: []
    })
    
    const handleTextureArrChange = (n) => {
        texturesRef.current.textureArr.push(n);
    }

    const videosRef = useRef({
        videoArr: []
    })

    const handleVideoArrChange = (n) => {
        videosRef.current.videoArr.push(n);
    }

    const canvasRef = useRef({
        drawedCanvas: null
    })
    // const [savedCanvas, setSavedCanvas] = useState(null);

    const handleCanvasDraw = (n) => {
        canvasRef.current.drawedCanvas = n;
    }

    return (
        <BrowserRouter>
            <div className='App' id='app'>
                <div className='Menu' ref={menuRef}>
                    <div style={{
                        width: `${3.5 * menuRefHeight}px`,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        float: 'right',
                        borderRadius: `0 0 0 ${0.2 * menuRefHeight}px`,
                        backgroundColor: '#F6FFFC',
                    }}>
                        <Link  to='/material'>
                            <div className='ManuItem'
                            style={{
                                width: `${0.9 * menuRefHeight}px`,
                                height: `${0.9 * menuRefHeight}px`,
                                marginLeft: `${0.2 * menuRefHeight}px`
                            }} onClick={() => setSelectedItem(0)}>
                                {
                                    selectedItem === 0 ? 
                                    <div className='ItemSelected'>
                                        <div style={{
                                            background: `url(${materialSvg}) no-repeat`,
                                            backgroundSize: 'contain',
                                            width: `${iconSize}px`,
                                            height: `${iconSize}px`,
                                        }}/>
                                    </div> : 
                                    <div style={{
                                        background: `url(${materialBlackSvg}) no-repeat`,
                                        backgroundSize: 'contain',
                                        width: `${iconSize}px`,
                                        height: `${iconSize}px`,
                                    }}/>
                                }
                            </div>
                        </Link>
                        <Link  to='/collector'>
                            <div className='ManuItem'
                            style={{
                                width: `${0.9 * menuRefHeight}px`,
                                height: `${0.9 * menuRefHeight}px`,
                                marginLeft: `${0.2 * menuRefHeight}px`
                            }} onClick={() => setSelectedItem(1)}>
                                {
                                    selectedItem === 1 ? 
                                    <div className='ItemSelected'>
                                        <div style={{
                                            background: `url(${collectorSvg}) no-repeat`,
                                            backgroundSize: 'contain',
                                            width: `${iconSize}px`,
                                            height: `${iconSize}px`,
                                        }}/>
                                    </div> : 
                                    <div style={{
                                        background: `url(${collectorBlackSvg}) no-repeat`,
                                        backgroundSize: 'contain',
                                        width: `${iconSize}px`,
                                        height: `${iconSize}px`,
                                    }}/>
                                }
                            </div>
                        </Link>
                        <Link to='/io-test'>
                            <div className='ManuItem'
                            style={{
                                width: `${0.9 * menuRefHeight}px`,
                                height: `${0.9 * menuRefHeight}px`,
                                marginLeft: `${0.2 * menuRefHeight}px`
                            }} onClick={() => setSelectedItem(2)}>
                                {
                                    selectedItem === 2 ? 
                                    <div className='ItemSelected'>
                                        <div style={{
                                            background: `url(${boardSvg}) no-repeat`,
                                            backgroundSize: 'contain',
                                            width: `${iconSize}px`,
                                            height: `${iconSize}px`,
                                        }}/>
                                    </div> : 
                                    <div style={{
                                        background: `url(${boardBlackSvg}) no-repeat`,
                                        backgroundSize: 'contain',
                                        width: `${iconSize}px`,
                                        height: `${iconSize}px`,
                                    }}/>
                                }
                            </div>
                        </Link>
                    </div>
                </div>
                <div className='Page' id='page'>
                    <Routes>
                        <Route path='/io-test' element={
                            <Board 
                                circleRadius={circleRatio * menuRefHeight} 
                                textureArr={texturesRef.current.textureArr}
                                changeTextureArr={handleTextureArrChange}
                                videoArr={videosRef.current.videoArr}
                                changeVideoArr={handleVideoArrChange}
                                drawedCanvas={canvasRef.current.drawedCanvas}
                                changeDrawedCanvas={handleCanvasDraw}
                            />
                        }/>
                        <Route path='/collector' element={<Collector circleRadius={circleRatio * menuRefHeight} />}/>
                        <Route path='/material' element={<div />}/>
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    )
}

// function App() {
//     const items = [
//         { 
//             key: '/shot', 
//             icon: <CameraOutlined />,
//             label: <Link to='/shot'>拍摄</Link>
//         },
//         {
//             key: '/draw',
//             icon: <EditOutlined />,
//             label: <Link to='/draw'>绘制</Link>
//         }
//     ]

//     return (
//         <HashRouter>
//             <div className='App'>
//                 <div className='Menu'>
//                     <Menu 
//                         defaultSelectedKeys={['/shot']}
//                         mode='inline'
//                         theme='dark'
//                         items={items}
//                         inlineCollapsed={true}
//                         style={{
//                             width: '100%',
//                             margin: "0px"
//                         }}
//                     />
//                 </div>
//                 <div className='Content'>
//                     <Routes>
//                         <Route path='/shot' element={<Shot />}/>
//                         <Route path='/draw' element={<Draw />}/>
//                     </Routes>
//                 </div>
//             </div>
//         </HashRouter>
//     )
// }

export default App;

