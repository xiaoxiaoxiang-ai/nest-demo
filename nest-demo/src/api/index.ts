import axios, { Axios,AxiosRequestConfig } from 'axios'
import {fileChunk} from '../components/Upload'
const httpIns = axios.create({
  baseURL:'http://localhost:3000/'
})
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
export function sliceUpload(formData:FormData,onProgress:AxiosRequestConfig['onUploadProgress']){
  return httpIns.post('/file/slice-upload',formData,{    
    onUploadProgress:onProgress
  })
}
export function mergeSlice(info:mergeInfo,){
  return httpIns.post('/file/slice-merge',info)
}