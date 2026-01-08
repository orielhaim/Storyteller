import { contextBridge } from 'electron'
import "./bookAPI.js"

contextBridge.exposeInMainWorld('generalAPI', {
  getVersion: () => process.env.npm_package_version,
})