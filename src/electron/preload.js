import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("api", {
  hello: () => "Hello",
});