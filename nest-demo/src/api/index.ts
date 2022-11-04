import axios, { AxiosRequestConfig } from 'axios'
const httpIns = axios.create({
  baseURL:'http://localhost:3000/'
})
type ResWrapper<T> = {
  data:T
  message:string
  success:boolean
  timestamp:Date
}
export type Cat = {
  id?:number
  name?:string
  breed?:string
  age?:number
}
export type file = {
  id:string
  fileName:string
  size:number
  type:string
  url:string
}
export type mergeInfo = {
  chunkSize:number
  fileName:string
  /**
   * 文件内容hash
   */
  hash:string
  mimeType:string
}
export function createCat(cat:Cat){
  return httpIns.post('/cats/createCat',cat)
}
export function findAllCat(){
  return httpIns.get<Cat[]>('/cats/findAll')
}
export function findAllFiles(){
  return httpIns.get<file[]>('/file/findAll')
}
export function sliceUpload(formData:FormData,onProgress:AxiosRequestConfig['onUploadProgress'],signal:AxiosRequestConfig['signal']){
  return httpIns.post('/file/slice-upload',formData,{    
    onUploadProgress:onProgress,
    signal
  })
}
export function mergeSlice(info:mergeInfo,){
  return httpIns.post('/file/slice-merge',info)
}
type verifyReqType= {
  fileName:string
  hash:string
  mimeType:string
}
type verifyResType = {
  shouldUpload:boolean
  uploadedFilesHash:string[]
}
export function verifyShouldUpload(info:verifyReqType){
  return httpIns.post<ResWrapper<verifyResType>>('/file/verify-should-upload',info)
}