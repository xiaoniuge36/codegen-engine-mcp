import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Upload, Progress, message } from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  FileOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps, RcFile } from 'antd/es/upload/interface';
import { useFileUpload } from './hooks/useFileUpload';
import './index.less';

/** 文件上传组件 Props */
export interface FileUploadProps {
  /** 上传接口地址 */
  uploadUrl?: string;
  /** 最大上传数量 */
  maxCount?: number;
  /** 单文件最大大小（MB） */
  maxSize?: number;
  /** 允许的文件类型（MIME 类型数组） */
  acceptTypes?: string[];
  /** 进度条颜色 */
  progressColor?: string;
  /** 业务类型标识 */
  uploadType?: string | number;
  /** 上传提示文案 */
  uploadTip?: string;
  /** 上传按钮文案 */
  uploadBtnText?: string;
  /** 列表展示类型 */
  listType?: 'picture-card' | 'text' | 'picture';
  /** 是否禁用 */
  disabled?: boolean;
  /** 初始文件列表 */
  defaultFileList?: UploadFile[];
  /** 自定义请求头 */
  headers?: Record<string, string>;
  /** 额外的上传参数 */
  extraData?: Record<string, any>;
  /** 上传成功回调 */
  onSuccess?: (file: UploadFile, response: any) => void;
  /** 文件移除回调 */
  onRemove?: (file: UploadFile) => void;
  /** 文件列表变化回调 */
  onChange?: (fileList: UploadFile[]) => void;
}

/** 组件暴露的方法 */
export interface FileUploadRef {
  /** 获取文件列表 */
  getFileList: () => UploadFile[];
  /** 设置文件列表 */
  setFileList: (list: UploadFile[]) => void;
  /** 清空文件列表 */
  clearFileList: () => void;
}

/**
 * React PC 文件上传组件
 * 基于 Ant Design Upload 封装，支持上传进度、多格式预览
 */
const FileUpload = forwardRef<FileUploadRef, FileUploadProps>((props, ref) => {
  const {
    uploadUrl = '/api/upload',
    maxCount = 5,
    maxSize = 10,
    acceptTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    progressColor = '#1890ff',
    uploadType = 82,
    uploadTip = '',
    uploadBtnText = '上传文件',
    listType = 'picture-card',
    disabled = false,
    defaultFileList = [],
    headers = {},
    extraData = {},
    onSuccess,
    onRemove,
    onChange,
  } = props;

  const [fileList, setFileList] = useState<UploadFile[]>(defaultFileList);
  const uploadRef = useRef<any>(null);

  // 使用自定义 Hook 处理上传逻辑
  const { customUpload, beforeUpload, isImageFile, isVideoFile, getFileExtension } =
    useFileUpload({
      uploadUrl,
      maxSize,
      acceptTypes,
      uploadType,
      headers,
      extraData,
      onProgress: (uid, percent) => {
        setFileList((prev) =>
          prev.map((f) => (f.uid === uid ? { ...f, percent } : f))
        );
      },
      onUploadSuccess: (uid, response) => {
        setFileList((prev) =>
          prev.map((f) =>
            f.uid === uid
              ? {
                  ...f,
                  status: 'done',
                  url: response?.url || response?.fileUrl,
                  response,
                }
              : f
          )
        );
        const file = fileList.find((f) => f.uid === uid);
        if (file && onSuccess) {
          onSuccess(file, response);
        }
      },
      onUploadError: (uid, error) => {
        setFileList((prev) => prev.filter((f) => f.uid !== uid));
        message.error(error?.message || '上传失败');
      },
    });

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getFileList: () => fileList,
    setFileList: (list: UploadFile[]) => setFileList(list),
    clearFileList: () => setFileList([]),
  }));

  // 处理文件列表变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    onChange?.(newFileList);
  };

  // 处理文件预览
  const handlePreview = (file: UploadFile) => {
    if (file.url) {
      window.open(file.url);
    } else if (file.originFileObj) {
      const url = URL.createObjectURL(file.originFileObj);
      window.open(url);
    }
  };

  // 处理文件移除
  const handleRemove = (file: UploadFile) => {
    onRemove?.(file);
    return true;
  };

  // 处理超出限制
  const handleExceed = () => {
    message.warning(`最多只能上传 ${maxCount} 个文件`);
  };

  // 渲染文件缩略图
  const renderThumbnail = (file: UploadFile) => {
    if (isImageFile(file.name || '')) {
      return (
        <img
          src={file.url || file.thumbUrl}
          alt={file.name}
          className="upload-thumbnail-img"
        />
      );
    }

    if (isVideoFile(file.name || '')) {
      return (
        <div className="upload-thumbnail-video">
          <VideoCameraOutlined />
          <span>视频</span>
        </div>
      );
    }

    return (
      <div className="upload-thumbnail-doc">
        <FileOutlined />
        <span>{getFileExtension(file.name || '')}</span>
      </div>
    );
  };

  // 渲染上传按钮
  const uploadButton = (
    <div className="upload-button">
      <PlusOutlined />
      <div className="upload-text">{uploadBtnText}</div>
    </div>
  );

  // 自定义渲染文件项
  const itemRender = (
    originNode: React.ReactElement,
    file: UploadFile,
    fileList: UploadFile[],
    actions: { download: () => void; preview: () => void; remove: () => void }
  ) => {
    const isUploading = file.status === 'uploading';

    return (
      <div className="custom-upload-item">
        {/* 缩略图 */}
        <div className="upload-thumbnail">{renderThumbnail(file)}</div>

        {/* 操作按钮 */}
        <div className="upload-actions">
          <span className="action-btn" onClick={actions.preview}>
            <EyeOutlined />
          </span>
          {!disabled && (
            <span className="action-btn" onClick={actions.remove}>
              <DeleteOutlined />
            </span>
          )}
        </div>

        {/* 上传进度 */}
        {isUploading && (
          <div className="upload-progress">
            <Progress
              percent={file.percent || 0}
              size="small"
              strokeColor={progressColor}
              showInfo={false}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="file-upload-wrapper">
      <Upload
        ref={uploadRef}
        action={uploadUrl}
        accept={acceptTypes.join(',')}
        customRequest={customUpload}
        beforeUpload={beforeUpload}
        fileList={fileList}
        onChange={handleChange}
        onPreview={handlePreview}
        onRemove={handleRemove}
        maxCount={maxCount}
        listType={listType}
        disabled={disabled}
        multiple
        itemRender={listType === 'picture-card' ? itemRender : undefined}
        className={fileList.length >= maxCount ? 'hide-upload-btn' : ''}
      >
        {fileList.length < maxCount && uploadButton}
      </Upload>

      {uploadTip && <div className="upload-tip">{uploadTip}</div>}
    </div>
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;

