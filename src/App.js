import './App.css';
import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import { Menu } from 'antd';
import 'antd/dist/antd.min.css';
import { CameraOutlined, EditOutlined } from '@ant-design/icons';
import Shot from './components/shot';
import Draw from './components/draw';

function App() {
    const items = [
        { 
            key: '/shot', 
            icon: <CameraOutlined />,
            label: <Link to='/shot'>拍摄</Link>
        },
        {
            key: '/draw',
            icon: <EditOutlined />,
            label: <Link to='/draw'>绘制</Link>
        }
    ]

    return (
        <HashRouter>
            <div className='App'>
                <div className='Menu'>
                    <Menu 
                        defaultSelectedKeys={['/shot']}
                        mode='inline'
                        theme='dark'
                        items={items}
                        inlineCollapsed={true}
                        style={{
                            width: '100%',
                            margin: "0px"
                        }}
                    />
                </div>
                <div className='Content'>
                    <Routes>
                        <Route path='/shot' element={<Shot />}/>
                        <Route path='/draw' element={<Draw />}/>
                    </Routes>
                </div>
            </div>
        </HashRouter>
    )
}

export default App;

