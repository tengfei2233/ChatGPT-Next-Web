import { List, ListItem, Select } from "./ui-lib";
import { InputRange } from "./input-range";
import Locale from "../locales";
import { DrawConfigValidator, DrawConfig, useChatStore } from "../store";
import { DEFAULLT_DRAW_MODEL, DRAW_SIZES, DRAW_QUATITIES } from "../constant";
import { useMemo, useState } from "react";

export function GraphSetting(props: {
  drawConfig: DrawConfig;
  updateDraw: (updater: (config: DrawConfig) => void) => void;
}) {
  // TODO: 防止reactHooks出现错误警告的折中写法，不建议这么写
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const drawConfig = session.mask.drawConfig;

  const allDrawModels = DEFAULLT_DRAW_MODEL;
  let [allDrawSizes, setAlllDrawSizes] = useState(DRAW_SIZES);
  const [allDrawQuatities, setAllDrawQuatities] = useState(DRAW_QUATITIES);
  const [currentDrawModel, setCurrentDrawModel] = useState(drawConfig?.model);
  const [drawNum, setDrawNum] = useState("4");
  useMemo(() => {
    // 更改绘图片尺寸，绘图数量，图片质量
    switch (currentDrawModel) {
      case "DALL-E 2":
      case "dall-e-2":
        setAlllDrawSizes(DRAW_SIZES);
        setAllDrawQuatities([
          {
            name: "默认",
            value: "standard",
          },
        ]);
        setDrawNum("4");
        drawConfig.size = allDrawSizes.includes(drawConfig.size)
          ? drawConfig.size
          : allDrawSizes[0];
        drawConfig.quality = allDrawQuatities[0].value;
        break;
      case "DALL-E 3":
      case "dall-e-3":
        drawConfig.n = 1;
        setAlllDrawSizes(["1024x1024", "1024x1792", "1792x1024"]);
        setAllDrawQuatities(DRAW_QUATITIES);
        setDrawNum("1");
        break;
    }
  }, [currentDrawModel]);
  return (
    <List>
      <ListItem
        title={Locale.AIDraw.ModelSelect}
        subTitle={Locale.AIDraw.ModelSelectTag}
      >
        <Select
          value={props.drawConfig.model}
          onChange={(e) => {
            props.updateDraw((config) => {
              config.model = DrawConfigValidator.model(e.target.value);
              setCurrentDrawModel(DrawConfigValidator.model(e.target.value));
            });
          }}
        >
          {allDrawModels.map((item, i) => (
            <option value={item.value} key={i}>
              {item.name}
            </option>
          ))}
        </Select>
      </ListItem>
      <ListItem title={Locale.AIDraw.PictureSize}>
        <Select
          value={props.drawConfig.size}
          onChange={(e) => {
            props.updateDraw((config) => {
              config.size = DrawConfigValidator.size(e.target.value);
            });
          }}
        >
          {allDrawSizes.map((item, i) => (
            <option value={item} key={i}>
              {item}
            </option>
          ))}
        </Select>
      </ListItem>
      <ListItem
        title={Locale.AIDraw.PictureNum}
        subTitle={Locale.AIDraw.PictureNumTag}
      >
        <InputRange
          value={props.drawConfig.n}
          min="1"
          max={drawNum} // lets limit it to 1-4
          step="1"
          onChange={(e) => {
            props.updateDraw(
              (config) =>
                (config.n = DrawConfigValidator.num(
                  e.currentTarget.valueAsNumber,
                )),
            );
          }}
        ></InputRange>
      </ListItem>
      <ListItem
        title={Locale.AIDraw.PictureQuality}
        subTitle={Locale.AIDraw.PictureQualityTag}
      >
        <Select
          value={props.drawConfig.quality}
          onChange={(e) => {
            props.updateDraw((config) => {
              config.quality = DrawConfigValidator.quatity(e.target.value);
            });
          }}
        >
          {allDrawQuatities.map((item, i) => (
            <option value={item.value} key={i}>
              {item.name}
            </option>
          ))}
        </Select>
      </ListItem>
    </List>
  );
}
