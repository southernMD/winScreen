import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, message, Modal, Checkbox, CheckboxProps, Empty } from 'antd';
import { Trash2, Copy, FolderInput } from 'lucide-react';
import styles from './ImageList.module.css';
import { ImageCard } from './ImageCard';
import { useLocalStorage } from '@/hooks/useLocalStorage';


interface imageListProps {
  ref: React.ForwardedRef<any>;
  style: React.CSSProperties
}
const ImageList = forwardRef<HTMLDivElement, imageListProps>(({ style }, ref) => {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const deleteLocalCheckBoxRef = useRef<{ ifDeleteLocal: boolean }>(null);

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedImages(new Set());
    }
  };

  const handleImageSelect = (id: string, selected: boolean) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  //TODO: 批量移动和复制时如果文件路径不存在没有操作，目前为弹出提示，且只要有一个文件路径不存在就停止操作
  const handleBatchAction = async (action: 'delete' | 'copy' | 'move') => {
    const optionList = Images.filter(img => Array.from(selectedImages).includes(img.hash))
    if (optionList.length === 0) return
    switch (action) {
      case 'delete':
        Modal.confirm({
          title: '确认删除',
          content: <DeleteLocalCheckBox ref={deleteLocalCheckBoxRef} />,
          cancelText: '取消',
          okText: '确认',
          centered: true,
          onOk: async () => {
            if (deleteLocalCheckBoxRef.current?.ifDeleteLocal) {
              await window.ipcRenderer.invoke('delete-images', { imagePaths: optionList.map(item => item.path) });
            }
            setImages(Images.filter(img => !optionList.includes(img)));
            toggleSelectMode()
          },
        });
        break;
      case 'copy': {
        const { success } = await window.ipcRenderer.invoke('copy-images', { imagePaths: optionList.map(item => item.path) });
        if (success) {
          toggleSelectMode()
        } else {
          message.error('复制失败,可能是因为路径丢失')
        }
        break;
      }
      case 'move': {
        const { success, newPaths } = await window.ipcRenderer.invoke('move-images', { imagePaths: optionList.map(item => item.path) });
        if (success) {
          setImages(Images.map((img, index) => {
            return {
              ...img,
              path: newPaths[index]
            }
          }))
          toggleSelectMode()
        } else {
          message.error('移动失败,可能是因为路径丢失')
        }
        break;
      }
    }
  };
  const handleSingleAction = async (action: string, hash: string) => {
    const { path: imagePath, data } = Images.find(img => img.hash === hash)!
    switch (action) {
      case 'delete': {
        Modal.confirm({
          title: '确认删除',
          content: <DeleteLocalCheckBox ref={deleteLocalCheckBoxRef} />,
          cancelText: '取消',
          okText: '确认',
          centered: true,
          onOk: async () => {
            if (deleteLocalCheckBoxRef.current?.ifDeleteLocal) {
              await window.ipcRenderer.invoke('delete-image', { imagePath });
            }
            setImages(Images.filter(img => img.hash !== hash));
          },
        });
        break;
      }
      case 'copy': {
        const { exist, arrayBuffer } = await window.ipcRenderer.invoke('copy-image', { imagePath, data })
        const blob = new Blob([arrayBuffer], { type: 'image/png' });
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        message.success('复制成功');
        //ant message
        if (!exist) {
          showImageNotFoundModal(data, hash)
        }
        break;
      }
      case 'openFolder': {
        window.ipcRenderer.send('open-image-Folder', { imagePath })
        break;
      }
      case 'openFile': {
        const { success } = await window.ipcRenderer.invoke('open-image-File', { imagePath })
        if (!success) {
          showImageNotFoundModal(data, hash)
        }
      }
    }


    // console.log(`Single ${action} for image:`, id);
  };
  const [Images, setImages] = useLocalStorage<{ fileName: string, data: string, path: string, hash: string }[]>('imageList', []);
  const showImageNotFoundModal = (data: string, hash: string,) => {
    const modal = Modal.confirm({
      title: '图片不存在',
      content: '目标图片不存在，是否重新保存？',
      closable: true,
      footer: () => {
        return (
          <>
            <Button key="back" onClick={() => {
              window.ipcRenderer.invoke('resave-screenShot', { base64: data }).then(({ success, filePath, fileName }) => {
                if (success) {
                  setImages(Images.map((item) => {
                    if (item.hash === hash) {
                      return { ...item, path: filePath, fileName };
                    } else {
                      return item;
                    }
                  }));
                }
                modal.destroy();
              });
            }}>
              重新保存
            </Button>
            <Button key="submit" type="primary" onClick={() => {
              setImages(Images.filter(img => img.hash !== hash));
              modal.destroy();
            }}>
              删除记录
            </Button>
          </>
        );
      }
    });
  };

  useEffect(() => {
    window.ipcRenderer.on("finished-save-image", ({ }, { url, path, fileName, hash }) => {
      setImages([{ fileName, data: url, path, hash }, ...Images]);
    })
    return () => {
      window.ipcRenderer.removeAllListeners("finished-save-image")
    }
  }, [Images])

  return (
    <div className={styles.container} style={style} ref={ref}>
      <div className={styles.header}>
        <div className={styles.headerActions}>
          {isSelectMode && (
            <>
              <Button
                type="primary"
                danger
                icon={<Trash2 size={16} />}
                onClick={() => handleBatchAction('delete')}
              >
                删除选中
              </Button>
              <Button
                icon={<Copy size={16} />}
                onClick={() => handleBatchAction('copy')}
              >
                复制选中
              </Button>
              <Button
                icon={<FolderInput size={16} />}
                onClick={() => handleBatchAction('move')}
              >
                移动选中
              </Button>
            </>
          )}
        </div>
        <Button
          type={isSelectMode ? "default" : "primary"}
          onClick={toggleSelectMode}
        >
          {isSelectMode ? '取消' : '多选'}
        </Button>
      </div>
      {
        Images.length != 0 ?
          <div className={styles.grid}>
            {Images.map((image) => (
              <ImageCard
                key={image.path}
                src={image.data}
                isSelectable={isSelectMode}
                isSelected={selectedImages.has(image.hash)}
                onSelect={(selected) => handleImageSelect(image.hash, selected)}
                onDelete={() => handleSingleAction('delete', image.hash)}
                onCopy={() => handleSingleAction('copy', image.hash)}
                onOpenFolder={() => handleSingleAction('openFolder', image.hash)}
                onOpenFile={() => handleSingleAction('openFile', image.hash)}
              />
            ))}
          </div>
          : <Empty
            style={{ width: '100%',marginInline:'inherit' }}
            description={
              '没有图片'
            } />
      }

    </div>
  );
})
const DeleteLocalCheckBox = forwardRef((props, ref) => {
  const [ifDeleteLocal, setIfDeleteLocal] = useLocalStorage("ifDeleteLocal", false);

  useImperativeHandle(ref, () => ({
    ifDeleteLocal,
  }));

  return (
    <div>
      <p>你确定要删除这张图片吗？</p>
      <Checkbox
        checked={ifDeleteLocal}
        onChange={(e) => setIfDeleteLocal(e.target.checked)}
      >
        删除本地文件
      </Checkbox>
    </div>
  );
})


export default ImageList;