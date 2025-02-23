import React, { useEffect, useState } from 'react';
import { Input, Button, Typography, Form } from 'antd'; // 导入 Ant Design 组件
import styles from './BeastTranslator.module.css'; // 如果需要自定义样式
import { encode, decode } from '@/utils/beast';

const { Title } = Typography;

// 定义长度为 1 的字符串类型
type SingleChar = string & { length: 1 };

const BeastTranslator: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [key, setKey] = useState('嗷呜啊~');
  
  // 使用类型断言初始化 splictKey
  const [splictKey, setSplictKey] = useState<[SingleChar, SingleChar, SingleChar, SingleChar]>(['嗷' as SingleChar, '呜' as SingleChar, '啊' as SingleChar, '~' as SingleChar]); 

  useEffect(() => {
    if (key) {
      const keys = key.split('') as SingleChar[];
      if (keys.length === 4 && keys.every(char => char.length === 1)) {
        setSplictKey(keys as [SingleChar, SingleChar, SingleChar, SingleChar]);
      }else if(keys.length === 4){
        setKey('嗷呜啊~')
      }
    }
  }, [key]);

  const handleEncrypt = () => {
    if(uniqueArrayLength(splictKey) != splictKey.length) return
    const encryptedText = encode(inputText, splictKey);
    console.log(encryptedText);
    setOutputText(encryptedText);
  };

  const handleDecrypt = () => {
    if(inputText.length < 4) return
    const inputTextArray = inputText.split("")
    const newKey = inputTextArray[2] + inputTextArray[1] + inputTextArray[inputTextArray.length - 1] + inputTextArray[0]
    setKey(newKey)
    if(uniqueArrayLength(newKey.split("")) != newKey.split("").length) return
    const decryptedText = decode(inputText, newKey.split("") as (string & { length: 1; })[] & { length: 4; });
    console.log(decryptedText);
    setOutputText(decryptedText);
  };
  function uniqueArrayLength<T>(arr: T[]): number {
    return Array.from(new Set(arr)).length;
  }
  return (
    <div className={styles.container}>
      <Title level={1} style={{ fontSize: '1.5rem' }}>兽音译者</Title>
      <Form layout="vertical">
        <Form.Item label="输入文本">
          <Input.TextArea
            placeholder="输入文本"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            style={{ width: '100%', resize: 'none' }}
          />
        </Form.Item>
        <Form.Item label="输出文本">
          <Input.TextArea
            placeholder="输出文本"
            value={outputText}
            readOnly
            rows={4}
            style={{ width: '100%', resize: 'none' }}
          />
        </Form.Item>
        <Form.Item label="秘钥">
          <Input
            type="text"
            placeholder="秘钥"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            style={{ width: '30%' }}
          />
        </Form.Item>
        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" onClick={handleEncrypt} style={{ width: '80px', marginRight: '10px' }}>
              加密
            </Button>
            <Button type="default" onClick={handleDecrypt} style={{ width: '80px' }}>
              解密
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BeastTranslator;
