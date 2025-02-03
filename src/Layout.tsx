import React from 'react';
import {
    ScissorOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

const siderStyle: React.CSSProperties = {
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top:0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
    maxWidth:'160px',
    minWidth:'160px',
    overflowY:'auto',
};

const menuPropsLabel =[
    '裁剪工具',
    '不是裁剪工具',
    '不是裁剪工具',
    '不是裁剪工具',
    '不是裁剪工具',
    '不是裁剪工具',
]

const items: MenuProps['items'] = [
    ScissorOutlined,
    ScissorOutlined,
    ScissorOutlined,
    ScissorOutlined,
    ScissorOutlined,
    ScissorOutlined,
].map((icon, index) => ({
    key: String(index + 1),
    icon: React.createElement(icon),
    label: menuPropsLabel[index],
}));

const App: React.FC = () => {
    const navigate = useNavigate()
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const onClick: MenuProps['onClick'] = (e) => {
        //跳转路由
        switch (e.key) {
            case '1':
                navigate('/')
                break;
            case '2':
                navigate('/w')
                break;
            default:
                break;
        }
      };
    return (
        <Layout hasSider>
            <Sider style={siderStyle}>
                <div className="demo-logo-vertical" />
                <Menu
                 theme="dark"
                 mode="inline" 
                 defaultSelectedKeys={['1']} 
                 items={items}
                 onClick={onClick}
                 />
            </Sider>
            <Layout>
                <Content style={{ 
                    margin: '12px 0 12px 12px',
                    overflowY: 'auto',
                    scrollbarGutter:'stable',
                    scrollbarWidth:'thin',
                    }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default App;