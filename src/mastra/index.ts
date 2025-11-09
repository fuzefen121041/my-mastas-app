
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { catConsultationWorkflow } from './workflows/cat-consultation-workflow';
import { catConsultantAgent } from './agents/cat-consultant-agent';

export const mastra = new Mastra({
  // workflows: {
  //   catConsultationWorkflow, // 猫咪咨询完整工作流
  // },
  agents: {
    catConsultantAgent, // 猫咪健康咨询专家Agent
  },
  storage: new LibSQLStore({
    // 存储observability、对话历史等数据
    url: "file:../mastra.db",
  }),
  logger: new PinoLogger({
    name: 'Cat Consultation AI',
    level: 'info',
  }),
  telemetry: {
    enabled: false,
  },
  observability: {
    // 启用AI追踪和观测
    default: { enabled: true },
  },
});
