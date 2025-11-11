/**
 * Cloudflare Workers 入口文件
 *
 * 这个文件处理所有传入的HTTP请求，并将它们路由到适当的处理函数
 */

import { handleConsultationDirect, handleConsultationWithWorkflowDirect } from './api/consultation-direct.js';
import indexHtml from './generated/index.html.js';

export interface Env {
  OPENAI_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    // 路由处理
    try {
      // 首页
      if (path === '/' || path === '/index.html') {
        return new Response(indexHtml, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            ...corsHeaders,
          },
        });
      }

      // API: 简单咨询
      if (path === '/api/consultation' && request.method === 'POST') {
        // 检查 API Key
        if (!env.OPENAI_API_KEY) {
          return new Response(JSON.stringify({
            success: false,
            error: 'OPENAI_API_KEY is not configured'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        const body = await request.json();
        const result = await handleConsultationDirect(body, env.OPENAI_API_KEY);

        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // API: 使用 Workflow 的完整咨询
      if (path === '/api/consultation/workflow' && request.method === 'POST') {
        // 检查 API Key
        if (!env.OPENAI_API_KEY) {
          return new Response(JSON.stringify({
            success: false,
            error: 'OPENAI_API_KEY is not configured'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        const body = await request.json();
        const result = await handleConsultationWithWorkflowDirect(body, env.OPENAI_API_KEY);

        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // API: 健康检查
      if (path === '/api/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString()
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // 404
      return new Response('Not Found', {
        status: 404,
        headers: corsHeaders,
      });

    } catch (error: any) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: error.message || 'Internal Server Error',
        stack: error.stack,
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};
