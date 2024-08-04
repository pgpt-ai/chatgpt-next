import type { ChatRequest, ImageGenerationRequest, ImageGenerationResponse, ModelsResponse } from './constants';
import { HttpHeaderJson, HttpMethod, PgptImageModel, PgptImageModels } from './constants';
import { ResError } from './error';
import { stream2string } from './stream';

/**
 * 请求 /api/chat 接口
 * 参数和 OpenAI 官方的接口参数一致，apiKey 在服务端自动添加
 * 可以传入 onMessage 来流式的获取响应
 */
export const fetchApiChat = async ({
  onMessage,
  ...chatRequest
}: {
  /**
   * 接受 stream 消息的回调函数
   */
  onMessage?: (content: string) => void;
} & Partial<ChatRequest>) => {
  const fetchResult = await fetch('/api/chat', {
    method: HttpMethod.POST,
    headers: HttpHeaderJson,
    body: JSON.stringify(chatRequest),
  });

  // 如果返回错误，则直接抛出错误
  if (!fetchResult.ok) {
    throw await getError(fetchResult);
  }

  // 使用 stream2string 来读取内容
  return await stream2string(fetchResult.body, onMessage);
};

/**
 * 请求 /api/models 接口
 * 获取可用的模型列表
 */
export const fetchApiModels = async (): Promise<ModelsResponse> => {
  const fetchResult = await fetch('/api/models', {
    method: HttpMethod.GET,
    headers: HttpHeaderJson,
  });

  // 如果返回错误，则直接抛出错误
  if (!fetchResult.ok) {
    throw await getError(fetchResult);
  }

  return await fetchResult.json();
};

/**
 * 图片生成请求
 */
export const fetchApiChatImages = async ({
  onMessage,
  ...chatRequest
}: {
  /**
   * 接受 stream 消息的回调函数
   */
  onMessage?: (content: string) => void;
} & {
  pgptApiKey: string;
  pgptImageBaseUrl: string;
  pgptModels: string;
  pgptImageCount: number;
  pgptImageSize: string;
  message: string;
} & Partial<ImageGenerationRequest>) => {
  const fetchResult = await fetch(`${chatRequest.pgptImageBaseUrl}/v1/images/generations`, {
    method: HttpMethod.POST,
    headers: {
      ...HttpHeaderJson,
      Authorization: `Bearer ${chatRequest.pgptApiKey}`,
    },
    body: JSON.stringify({
      model: chatRequest.pgptModels,
      prompt: chatRequest.message,
      n: chatRequest.pgptModels === PgptImageModel['dall-e-2'] ? chatRequest.pgptImageCount : 1,
      size: chatRequest.pgptImageSize ?? '1024x1024',
    }),
  });
  return await stream2string(fetchResult.body, onMessage);
};
/**
 * 处理 fetchResult 的错误
 */
async function getError(fetchResult: Response) {
  const error = new ResError({
    code: fetchResult.status,
    message: fetchResult.statusText,
  });

  try {
    let fetchResultJson = await fetchResult.json();
    // 使用 resJson.error 覆盖 error
    Object.assign(error, fetchResultJson, fetchResultJson.error);
  } catch (e) {}

  return error;
}
