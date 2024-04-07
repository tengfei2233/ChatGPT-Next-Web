import { ModelProvider, OpenaiPath } from "@/app/constant";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../auth";
import { requestOpenai } from "../../common";
import { OpenAIListModelResponse } from "@/app/client/platforms/openai";
import { DrawImageResponse } from "@/app/client/platforms/dalle";
import { prettyObject } from "@/app/utils/format";
import { cosUpload } from "@/app/utils/cloud/cos";

const ALLOWD_PATH = new Set(Object.values(OpenaiPath));

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[OpenAI Route] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }
  const subpath = params.path.join("/");
  if (!ALLOWD_PATH.has(subpath)) {
    console.log("[OpenAI Route] forbidden path ", subpath);
    return NextResponse.json(
      {
        error: true,
        msg: "you are not allowed to request " + subpath,
      },
      {
        status: 403,
      },
    );
  }

  const authResult = auth(req, ModelProvider.GPT);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  try {
    const response = await requestOpenai(req);
    // list models
    if (subpath === OpenaiPath.ListModelPath && response.status === 200) {
      const resJson = (await response.json()) as OpenAIListModelResponse;
      return NextResponse.json(resJson, {
        status: response.status,
      });
    }
    // ai绘图
    if (subpath === OpenaiPath.DrawImgPath && response.status === 200) {
      const resJson = (await response.json()) as DrawImageResponse;
      await cosUpload(resJson);
      return NextResponse.json(resJson, {
        status: response.status,
      });
    }
    return response;
  } catch (e) {
    console.error("[OpenAI] ", e);
    return NextResponse.json(prettyObject(e));
  }
}

export const GET = handle;
export const POST = handle;

// export const runtime = "edge";
