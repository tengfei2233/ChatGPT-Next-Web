import { ModelConfig } from "../store";
import { type Mask } from "../store/mask";

export type BuiltinMask = Omit<Mask, "id" | "modelConfig" | "drawConfig"> & {
  builtin: Boolean;
  modelConfig: Partial<ModelConfig>;
};
