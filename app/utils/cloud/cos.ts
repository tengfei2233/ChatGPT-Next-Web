import { DrawImageResponse } from "@/app/client/platforms/dalle";
import { getServerSideConfig } from "@/app/config/server";
import { nanoid } from "nanoid";
import COS from "cos-nodejs-sdk-v5";

const applicationConfig = getServerSideConfig();

const cos = new COS({
  SecretId: applicationConfig.cosAppId,
  SecretKey: applicationConfig.cosAppSecret,
});

// TODO: 使用Promise异步编排实现多个请求的并行处理
export async function cosUpload(resJson: DrawImageResponse) {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  let promiseArr: Promise<any>[] = [];
  let urlArr: any = [];
  resJson.data.forEach((item) => {
    item.url = item.url.replaceAll(
      "oaidalleapiprodscus.blob.core.windows.net",
      applicationConfig.dalleImageProxy,
    );
    let promise = new Promise(async (resolve, reject) => {
      // 设置fetch超时时间为 30 秒
      const timeoutDuration = 30000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutDuration);
      let fetchRes = await fetch(item.url, {
        headers: { method: "GET" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      let buffer = await fetchRes.arrayBuffer();
      let arrayBuffer = new Uint8Array(buffer);
      cos.putObject(
        {
          Bucket: applicationConfig.cosBucket,
          Region: applicationConfig.cosRegion,
          Key:
            "/dalle-images/" +
            year +
            "/" +
            month +
            "/" +
            day +
            "/" +
            nanoid(10) +
            ".png",
          Body: Buffer.from(arrayBuffer),
        },
        function (err, data) {
          if (data) {
            urlArr.push({ url: "https://" + data.Location });
            resolve(data.Location);
          } else if (err) {
            urlArr.push({ url: item.url });
            reject(item.url);
          }
        },
      );
    });
    promiseArr.push(promise);
  });
  // 异步编排
  await Promise.allSettled(promiseArr);
  resJson.data = urlArr;
}
