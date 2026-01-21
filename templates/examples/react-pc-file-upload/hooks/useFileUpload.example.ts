import { useCallback, useRef } from 'react';
import type { RcFile, UploadRequestOption } from 'antd/es/upload/interface';
import { message } from 'antd';
import axios from 'axios';

/** useFileUpload Hook 配置 */
export interface UseFileUploadOptions {
  /** 上传接口地址 */
  uploadUrl: string;
  /** 单文件最大大小（MB） */
  maxSize: number;
  /** 允许的文件类型（MIME 类型数组） */
  acceptTypes: string[];
  /** 业务类型标识 */
  uploadType: string | number;
  /** 自定义请求头 */
  headers?: Record<string, string>;
  /** 额外的上传参数 */
  extraData?: Record<string, any>;
  /** 进度回调 */
  onProgress?: (uid: string, percent: number) => void;
  /** 上传成功回调 */
  onUploadSuccess?: (uid: string, response: any) => void;
  /** 上传失败回调 */
  onUploadError?: (uid: string, error: Error) => void;
}

/** 图片文件扩展名 */
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];

/** 视频文件扩展名 */
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm'];

/**
 * 文件上传 Hook
 * 封装上传逻辑、文件校验、类型判断等功能
 */
export function useFileUpload(options: UseFileUploadOptions) {
  const {
    uploadUrl,
    maxSize,
    acceptTypes,
    uploadType,
    headers = {},
    extraData = {},
    onProgress,
    onUploadSuccess,
    onUploadError,
  } = options;

  const abortControllerRef = useRef<Map<string, AbortController>>(new Map());

  /**
   * 获取文件扩展名
   */
  const getFileExtension = useCallback((fileName: string): string => {
    if (!fileName) return '';
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()?.toUpperCase() || '' : '';
  }, []);

  /**
   * 判断是否为图片文件
   */
  const isImageFile = useCallback((fileName: string): boolean => {
    const ext = getFileExtension(fileName).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
  }, [getFileExtension]);

  /**
   * 判断是否为视频文件
   */
  const isVideoFile = useCallback((fileName: string): boolean => {
    const ext = getFileExtension(fileName).toLowerCase();
    return VIDEO_EXTENSIONS.includes(ext);
  }, [getFileExtension]);

  /**
   * 上传前校验
   */
  const beforeUpload = useCallback(
    (file: RcFile): boolean | Promise<boolean> => {
      // 校验文件大小
      const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
      if (!isLtMaxSize) {
        message.error(`文件大小不能超过 ${maxSize}MB`);
        return false;
      }

      // 校验文件类型
      if (acceptTypes.length > 0 && !acceptTypes.includes(file.type)) {
        const acceptStr = acceptTypes
          .map((t) => t.split('/')[1])
          .filter(Boolean)
          .join('、');
        message.error(`仅支持上传 ${acceptStr} 格式的文件`);
        return false;
      }

      return true;
    },
    [maxSize, acceptTypes]
  );

  /**
   * 自定义上传请求
   */
  const customUpload = useCallback(
    async (options: UploadRequestOption) => {
      const { file, onProgress: uploadProgress, onSuccess, onError } = options;
      const rcFile = file as RcFile;

      // 创建 AbortController 用于取消请求
      const abortController = new AbortController();
      abortControllerRef.current.set(rcFile.uid, abortController);

      const formData = new FormData();
      formData.append('file', rcFile);
      formData.append('uploadType', String(uploadType));

      // 添加额外参数
      Object.entries(extraData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      try {
        const response = await axios.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...headers,
          },
          signal: abortController.signal,
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              ((progressEvent.loaded || 0) * 100) / (progressEvent.total || 1)
            );
            uploadProgress?.({ percent });
            onProgress?.(rcFile.uid, percent);
          },
        });

        const data = response.data;

        // 兼容多种响应格式
        if (data.code === 200 || data.code === 0 || data.success) {
          const result = data.data || data.result || data;
          onSuccess?.(result);
          onUploadSuccess?.(rcFile.uid, result);
        } else {
          throw new Error(data.message || data.msg || '上传失败');
        }
      } catch (error: any) {
        // 忽略取消的请求
        if (axios.isCancel(error)) {
          return;
        }
        onError?.(error);
        onUploadError?.(rcFile.uid, error);
      } finally {
        // 清理 AbortController
        abortControllerRef.current.delete(rcFile.uid);
      }
    },
    [uploadUrl, uploadType, headers, extraData, onProgress, onUploadSuccess, onUploadError]
  );

  /**
   * 取消上传
   */
  const cancelUpload = useCallback((uid: string) => {
    const controller = abortControllerRef.current.get(uid);
    if (controller) {
      controller.abort();
      abortControllerRef.current.delete(uid);
    }
  }, []);

  /**
   * 取消所有上传
   */
  const cancelAllUploads = useCallback(() => {
    abortControllerRef.current.forEach((controller) => {
      controller.abort();
    });
    abortControllerRef.current.clear();
  }, []);

  return {
    customUpload,
    beforeUpload,
    isImageFile,
    isVideoFile,
    getFileExtension,
    cancelUpload,
    cancelAllUploads,
  };
}

