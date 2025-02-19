import React, { useEffect, useState } from 'react';
import {
    ScissorOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

const siderStyle: React.CSSProperties = {
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
    maxWidth: '160px',
    minWidth: '160px',
    overflowY: 'auto',
};

const menuPropsLabel = [
    '裁剪工具',
    '不是裁剪工具',
    '不是裁剪工具',
    '不是裁剪工具',
    '不是裁剪工具',
    '不是裁剪工具',
];

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

interface LayoutProps {
    children: React.ReactNode;
}

const App: React.FC<LayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const [selectedKeys, setSelectedKeys] = useState<[string] | []>([]);

    useEffect(() => {
        // 根据当前路径设置 selectedKeys
        switch (location.pathname) {
            case '/':
                setSelectedKeys(['1']);
                break;
            case '/w':
                setSelectedKeys(['2']);
                break;
            default:
                setSelectedKeys(['1']); // 默认选中第一个菜单项
                break;
        }
    }, [location.pathname]);

    const onClick: MenuProps['onClick'] = (e) => {
        setSelectedKeys([e.key]);
        // 跳转路由
        switch (e.key) {
            case '1':
                navigate('/');
                break;
            case '2':
                navigate('/w');
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
                    selectedKeys={selectedKeys}
                    items={items}
                    onClick={onClick}
                />
            </Sider>
            <Layout>
                <Content style={{
                    margin: '12px 0 12px 12px',
                    overflowY: 'auto',
                    scrollbarGutter: 'stable',
                    scrollbarWidth: 'thin',
                    height:"100px"
                }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default App;