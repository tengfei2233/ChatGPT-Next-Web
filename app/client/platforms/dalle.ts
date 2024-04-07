import { useAccessStore } from "@/app/store";
import {
  ChatOptions,
  getHeaders,
  LLMApi,
  LLMModel,
  LLMUsage,
  MultimodalContent,
} from "../api";
import { ApiPath, OpenaiPath, REQUEST_TIMEOUT_MS } from "@/app/constant";
import { DEFAULLT_DRAW_MODEL, DRAW_QUATITIES } from "@/app/constant";

export interface DrawImageResponse {
  created: number;
  data: [{ url: string }];
}

// DALLE AI画图客户端请求接口
export class DalleApi implements LLMApi {
  path(path: string): string {
    const accessStore = useAccessStore.getState();
    let baseUrl = accessStore.dalleUrl;

    if (baseUrl.length === 0) {
      baseUrl = ApiPath.Dalle;
    }

    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, baseUrl.length - 1);
    }

    console.log("[Proxy Endpoint] ", baseUrl, path);

    return [baseUrl, path].join("/");
  }

  async chat(options: ChatOptions): Promise<void> {
    const defaultDrawModel = DEFAULLT_DRAW_MODEL;
    const defaultDrawQuatity = DRAW_QUATITIES;
    try {
      const msgContent = options.messages[options.messages.length - 1].content;
      // 配置参数映射

      let requestPayload = {
        prompt: msgContent,
        ...options.drawConfig,
      };
      requestPayload.model =
        defaultDrawModel.find((item) => item.name === requestPayload.model)
          ?.value ?? requestPayload.model;
      requestPayload.quality =
        defaultDrawQuatity.find((item) => item.name === requestPayload.quality)
          ?.value ?? requestPayload.quality;

      const controller = new AbortController();
      options.onController?.(controller);

      const drawImgPath = this.path(OpenaiPath.DrawImgPath);
      const drawImgPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: getHeaders(),
      };
      // 请求超时停止
      const requestTimeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );

      // 非流式输出
      const res = await fetch(drawImgPath, drawImgPayload);
      clearTimeout(requestTimeoutId);

      const resJson = await res.json();
      // resJson格式转换，转换成MultimodalContent
      const results: MultimodalContent[] = [];
      resJson.data.forEach((item: { url: string }) => {
        results.push({
          type: "image_url",
          image_url: { url: item.url },
        });
      });
      options.onFinish(results);
    } catch (e) {
      console.log("[Request] failed to make a ai draw request", e);
      options.onError?.(e as Error);
    }
  }
  usage(): Promise<LLMUsage> {
    throw new Error("Method not implemented.");
  }
  models(): Promise<LLMModel[]> {
    throw new Error("Method not implemented.");
  }
}
