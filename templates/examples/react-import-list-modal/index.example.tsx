import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Upload, Space, message, notification, Badge } from 'antd';
import { UploadOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import type { UploadProps } from 'antd';
import {
  downloadTemplate,
  uploadExcelDataAsync,
  getBatchFileList,
  getImportProcessingTask,
  getImportProcessingState,
  downloadProcessedFile,
} from '@/services/import';
import './index.less';

/**
 * 导入记录类型
 */
export interface ImportRecord {
  id: string;
  fileName: string;
  importTime: string;
  status: 1 | 2 | 3;  // 1-处理中, 2-成功, 3-失败
  importerName: string;
  resultFileUrl?: string;
  errorFileUrl?: string;
}

/**
 * 导入弹窗组件属性
 */
export interface ImportModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  customDownload?: () => Promise<void>;
  uploadConfig?: {
    maxFileSize?: number;  // MB
    accept?: string;
  };
}

/**
 * Excel 导入弹窗
 * 
 * 功能：
 * - 模板下载
 * - 文件上传（仅 xlsx/xls）
 * - 异步导入 + 轮询
 * - 导入记录列表
 * - 下载处理结果/错误文件
 */
const ImportModal: React.FC<ImportModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  customDownload,
  uploadConfig = {},
}) => {
  const actionRef = useRef<ActionType>();
  const [uploading, setUploading] = useState(false);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const notificationKeyRef = useRef<string>('');

  const { maxFileSize = 5, accept = '.xlsx,.xls' } = uploadConfig;

  // 清理轮询定时器
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
      if (notificationKeyRef.current) {
        notification.close(notificationKeyRef.current);
      }
    };
  }, []);

  // 模板下载
  const handleDownloadTemplate = async () => {
    try {
      if (customDownload) {
        await customDownload();
        return;
      }

      await downloadTemplate({
        title: '导入模板',
        typeCode: 'DEFAULT_IMPORT',
      });

      message.success('模板下载成功');
    } catch (error) {
      message.error('模板下载失败');
    }
  };

  // 文件上传前校验
  const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isExcel =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls');

    if (!isExcel) {
      message.error('只能上传 Excel 文件（.xlsx 或 .xls）');
      return Upload.LIST_IGNORE;
    }

    const isLtMaxSize = file.size / 1024 / 1024 < maxFileSize;
    if (!isLtMaxSize) {
      message.error(`文件大小不能超过 ${maxFileSize}MB`);
      return Upload.LIST_IGNORE;
    }

    return false;  // 阻止自动上传，由 customRequest 处理
  };

  // 自定义上传
  const handleCustomRequest: UploadProps['customRequest'] = async (options) => {
    const { file } = options;

    setUploading(true);
    try {
      const res = await uploadExcelDataAsync(file);

      message.success('文件上传成功');

      // 检查是否需要轮询
      if (res.processStatus === 1) {
        // 显示处理中通知
        notificationKeyRef.current = `import-${Date.now()}`;
        notification.info({
          key: notificationKeyRef.current,
          message: '导入处理中',
          description: '正在处理导入数据，请稍候...',
          duration: 0,  // 持续显示
        });

        // 开始轮询
        startPolling(res.invoice);
      } else {
        // 同步导入，刷新列表
        actionRef.current?.reload();
        onSuccess?.();
      }
    } catch (error: any) {
      message.error(error?.message || '文件上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 开始轮询导入状态
  const startPolling = (invoice: string) => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }

    pollingTimerRef.current = setInterval(async () => {
      try {
        const status = await getImportProcessingState(invoice);

        if (status.processStatus === 2) {
          // 处理完成
          clearInterval(pollingTimerRef.current!);
          pollingTimerRef.current = null;

          notification.close(notificationKeyRef.current);
          notification.success({
            message: '导入成功',
            description: '数据已成功导入',
          });

          actionRef.current?.reload();
          onSuccess?.();
        } else if (status.processStatus === 3) {
          // 处理失败
          clearInterval(pollingTimerRef.current!);
          pollingTimerRef.current = null;

          notification.close(notificationKeyRef.current);
          notification.error({
            message: '导入失败',
            description: '数据导入失败，请检查文件格式',
          });

          actionRef.current?.reload();
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);  // 每 3 秒轮询一次
  };

  // 下载处理结果/错误文件
  const handleDownloadFile = async (fileUrl: string, fileName: string) => {
    try {
      await downloadProcessedFile(fileUrl, fileName);
      message.success('下载成功');
    } catch (error) {
      message.error('下载失败');
    }
  };

  // 导入记录列配置
  const columns: ProColumns<ImportRecord>[] = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      ellipsis: true,
      width: 200,
    },
    {
      title: '导入时间',
      dataIndex: 'importTime',
      key: 'importTime',
      width: 180,
      search: false,
    },
    {
      title: '处理结果',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      valueEnum: {
        1: { text: '处理中', status: 'Processing' },
        2: { text: '成功', status: 'Success' },
        3: { text: '失败', status: 'Error' },
      },
    },
    {
      title: '导入人',
      dataIndex: 'importerName',
      key: 'importerName',
      width: 120,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'action',
      width: 150,
      render: (_, record) => {
        const actions = [];

        if (record.status === 2 && record.resultFileUrl) {
          actions.push(
            <a
              key="download-result"
              onClick={() => handleDownloadFile(record.resultFileUrl!, `${record.fileName}-结果.xlsx`)}
            >
              下载结果
            </a>
          );
        }

        if (record.status === 3 && record.errorFileUrl) {
          actions.push(
            <a
              key="download-error"
              onClick={() => handleDownloadFile(record.errorFileUrl!, `${record.fileName}-错误详情.xlsx`)}
            >
              下载错误详情
            </a>
          );
        }

        return actions.length > 0 ? actions : null;
      },
    },
  ];

  return (
    <Modal
      title="批量导入"
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={null}
      destroyOnClose
    >
      <div className="import-modal">
        {/* 操作按钮区 */}
        <div className="import-actions">
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => actionRef.current?.reload()}
            >
              刷新
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
            >
              下载模板
            </Button>
            <Upload
              accept={accept}
              maxCount={1}
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              customRequest={handleCustomRequest}
            >
              <Button
                type="primary"
                icon={<UploadOutlined />}
                loading={uploading}
              >
                上传文件
              </Button>
            </Upload>
          </Space>
        </div>

        {/* 导入记录列表 */}
        <div className="import-history">
          <ProTable<ImportRecord>
            columns={columns}
            actionRef={actionRef}
            request={async (params) => {
              const res = await getBatchFileList({
                pageNum: params.current || 1,
                pageSize: params.pageSize || 10,
              });
              return {
                data: res.data,
                total: res.total,
                success: true,
              };
            }}
            rowKey="id"
            search={false}
            options={false}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ImportModal;
