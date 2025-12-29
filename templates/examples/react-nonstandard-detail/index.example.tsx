// ⚠️ 生成前必须检查：先查看项目 types/global.d.ts
// 如果 ProjectItem 在 global.d.ts 中已声明，则不要引入！

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, Space, Image, Steps, Table, Tag } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDetailData } from './hooks';
import './index.less';

/**
 * 非标独立详情页
 * 
 * 适用场景：
 * - 复杂详情展示（出差申请单、项目详情等）
 * - 需要单独URL的场景
 * - 包含审批流程/附件预览的场景
 * 
 * 文件生成顺序（必须遵守）：
 * 1. hooks/useDetailData.ts（第一个生成）
 * 2. hooks/index.ts
 * 3. index.tsx（本文件）
 * 4. index.less
 */
const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // ✅ 正确：通过 hooks 获取数据
  const { data, loading, refetch } = useDetailData(id);

  // 流程明细表格列配置
  const processColumns: ColumnsType<any> = [
    {
      title: '审批节点',
      dataIndex: 'nodeName',
      key: 'nodeName',
      width: 120,
    },
    {
      title: '审批人',
      dataIndex: 'approverName',
      key: 'approverName',
      width: 100,
    },
    {
      title: '审批结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          approved: { color: 'success', text: '已通过' },
          rejected: { color: 'error', text: '已拒绝' },
          pending: { color: 'warning', text: '审批中' },
        };
        const status = statusMap[result] || { color: 'default', text: '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '审批意见',
      dataIndex: 'comment',
      key: 'comment',
      width: 200,
      ellipsis: true,
    },
    {
      title: '审批时间',
      dataIndex: 'approvalTime',
      key: 'approvalTime',
      width: 180,
    },
  ];

  // 附件列表渲染
  const renderAttachments = () => {
    if (!data?.attachments || data.attachments.length === 0) {
      return <div className="no-data">暂无附件</div>;
    }

    return (
      <Space size={[16, 16]} wrap>
        {data.attachments.map((file: any, index: number) => (
          <div key={index} className="attachment-item">
            {file.type === 'image' ? (
              <Image
                width={100}
                height={100}
                src={file.url}
                alt={file.name}
                preview={{ mask: '预览' }}
              />
            ) : (
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                {file.name}
              </a>
            )}
          </div>
        ))}
      </Space>
    );
  };

  return (
    <div className="project-detail-page">
      <Spin spinning={loading}>
        {/* 顶部操作栏 */}
        <div className="page-header">
          <Space size="middle">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
            >
              返回
            </Button>
            <div className="page-title">
              <h2>{data?.projectName || '项目详情'}</h2>
              {data?.projectCode && (
                <span className="page-subtitle">单据号：{data.projectCode}</span>
              )}
            </div>
          </Space>
          
          <Space>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => navigate(`/business/project-management/edit/${id}`)}
            >
              编辑
            </Button>
          </Space>
        </div>

        {/* 基础信息 */}
        <Card title="基础信息" className="detail-card">
          <Descriptions column={2}>
            <Descriptions.Item label="项目名称">{data?.projectName}</Descriptions.Item>
            <Descriptions.Item label="项目编号">{data?.projectCode}</Descriptions.Item>
            <Descriptions.Item label="项目负责人">{data?.ownerName}</Descriptions.Item>
            <Descriptions.Item label="所属部门">{data?.department}</Descriptions.Item>
            <Descriptions.Item label="开始日期">{data?.startDate}</Descriptions.Item>
            <Descriptions.Item label="结束日期">{data?.endDate}</Descriptions.Item>
            <Descriptions.Item label="项目状态">
              <Tag color={data?.status === 'active' ? 'success' : 'default'}>
                {data?.statusText}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{data?.createTime}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 业务信息（根据实际业务调整） */}
        <Card title="项目信息" className="detail-card">
          <Descriptions column={2}>
            <Descriptions.Item label="预算金额">{data?.budget}</Descriptions.Item>
            <Descriptions.Item label="实际花费">{data?.actualCost}</Descriptions.Item>
            <Descriptions.Item label="项目成员" span={2}>
              {data?.members?.map((m: any) => (
                <Tag key={m.id}>{m.name}</Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="项目描述" span={2}>
              {data?.description || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 附件预览 */}
        {data?.attachments && data.attachments.length > 0 && (
          <Card title="附件" className="detail-card">
            {renderAttachments()}
          </Card>
        )}

        {/* 审批流程（如果有） */}
        {data?.approvalProcess && (
          <>
            <Card title="审批流程" className="detail-card">
              <Steps current={data.approvalProcess.currentStep}>
                {data.approvalProcess.steps?.map((step: any) => (
                  <Steps.Step
                    key={step.id}
                    title={step.nodeName}
                    description={step.approverName}
                    status={step.status}
                  />
                ))}
              </Steps>
            </Card>

            {/* 流程明细表格 */}
            <Card title="流程明细" className="detail-card">
              <Table
                columns={processColumns}
                dataSource={data.approvalProcess.details}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </>
        )}
      </Spin>
    </div>
  );
};

export default ProjectDetail;
