import {useEffect, useRef,useState,useCallback,MutableRefObject} from 'react'
import {sliceUpload as sliceUploadService,mergeSlice,verifyShouldUpload, file} from '../../api'
import {ProgressBar} from '../ProgressBar'
import './index.css'
export type fileChunk = {
  chunk:Blob,
  hash:string
}
type progressInfo = {
  hash:string
  progress:number
}
type changedProgress = {
  index:number
  progress:number
}
type fileInfo = {
  chunks:fileChunk[],
  hash:string,
  fileName:string
  mimeType:string
  isEmpty:boolean
}
export const Upload = ()=>{
  const chunkSize = useRef<number>(10*1024*1024)
  const barSize = useRef<number>(150)
  const [progressInfoArr,setProgressInfoArr] = useState<progressInfo[]>([])
  const changedProgressArr = useRef<changedProgress[]>([])
  const [isProgress,setIsProgress] = useState<boolean>(false) 
  const [progress,setProgress] = useState<number>(0)
  const [hashPercentage,setHashPercentage] = useState<number>(0)
  const ProgressBarsRender = progressInfoArr.map(({hash,progress},index)=><li className='item' key={hash}>
    <div className="pro_container" style={{width:barSize.current}}>
     <p className='progress' style={{width:barSize.current*progress}}></p>
    </div>
    <p>{progress===1?`分片${index}加载完成～！！！`:`分片${index}加载中,进度为${progress}`}</p>
  </li>)
  useEffect(()=>{
    if(isProgress){
      changedProgressArr.current.forEach(({index,progress})=>{
        progressInfoArr[index].progress = progress
      })
      setProgressInfoArr([...progressInfoArr])
      setIsProgress(false)
      changedProgressArr.current = []
      const totalProgress =  Number((progressInfoArr.reduce((sum,cur)=>sum+=cur.progress,0)/progressInfoArr.length).toFixed(2))
      setProgress(totalProgress)
    }
  },[isProgress])
  const fileInfo = useRef<fileInfo>({isEmpty:true} as any)
  const updateFileInfo = async(file:File)=>{
    const {size:maxByte,name:fileName,type:mimeType} = file
    let cur = 0
    const slices:Blob[]= []
    while(cur<maxByte){
      slices.push(file.slice(cur,cur+chunkSize.current))
      cur+=chunkSize.current
    }
    const hash =  await calculateFileHash(slices)
    console.log('file',file)
    fileInfo.current = {
      fileName,
      mimeType,
      chunks:slices.map((slice,index)=>({
        hash:`${hash}-${index}`,
        chunk:slice
      })),
      hash,
      isEmpty:false
    }
    sliceUpload()
  }
  const abortController:MutableRefObject<AbortController> = useRef(null as any)
  useEffect(()=>{
    abortController.current = new AbortController();
    (window as any).fileInfo = fileInfo
  },[])
  const pauseFileUpload = useCallback(()=>{
    abortController.current.abort()
  },[])
  const resumeFileUpload = useCallback(()=>{
    if(fileInfo.current.isEmpty){
      return
    }
    abortController.current = new AbortController()
    sliceUpload()
  },[])
  const sliceUpload = async ()=>{
    let start = Date.now()
    const {fileName,mimeType,hash,chunks:originChunks} = fileInfo.current
    const {data:{data:{shouldUpload,uploadedFilesHash}}} = await verifyShouldUpload({
      fileName,
      mimeType,
      hash
    })
    if(!shouldUpload){
      console.log('当前文件资源服务器已经存在,无需再上传')
      setProgressInfoArr(originChunks.map(chunk=>({
        hash:chunk.hash,
        progress:1
      })))
      setIsProgress(true)
      return 
    }
    // 将已经上传至服务器的切片的progress设置为1,后续跳过这些切片的上传,实现断点续传
    const initialProgressInfo = originChunks.map(origin=>{
      let progress = 0
      if(uploadedFilesHash.includes(origin.hash)){
        progress = 1
      }
      return {
        progress,
        hash:origin.hash,
      }
    })
    setProgressInfoArr(initialProgressInfo)
    setIsProgress(true)
    const chunks = originChunks.map(origin=>({
      ...origin,
      needUpload:!uploadedFilesHash.includes(origin.hash)
    }))
    await Promise.all(chunks.map((chunk,index)=>{
      const formData = new FormData()
      formData.append('file',chunk.chunk)
      formData.append('hash',chunk.hash)
      formData.append('filename',fileName)
      const pro = chunk.needUpload ? sliceUploadService(formData,e=>{
        const {loaded,total = 0} = e
        changedProgressArr.current.push({
          index,
          progress:Number((loaded/total).toFixed(2))
        })
        setIsProgress(true)
    },abortController.current.signal) : Promise.resolve()
    return pro
    }))
    await mergeSlice({
      chunkSize:chunkSize.current,
      fileName,
      hash,
      mimeType
    })
    console.log(`所有分片上传完毕,所花时间为${Date.now()-start}`)
  }
  const fileHashWorker:MutableRefObject<Worker> = useRef(null as any)
  useEffect(()=>{
    fileHashWorker.current = new Worker('../../workers/fileHash.js')
  },[])
  const calculateFileHash = useCallback((chunks:Blob[])=>{
    return new Promise<string>(resolve=>{
      fileHashWorker.current.postMessage({chunks})
      fileHashWorker.current.onmessage = e=>{
        const {percentage,hash} = e.data
        if(hash){
          resolve(hash)
          setHashPercentage(1)
        }
        else{
          setHashPercentage(percentage)
        }
      }
    })
  },[])
  return <div className='upload_wrapper'>
   <h1>大文件上传</h1>
   <input type="file" onChange={(e)=>updateFileInfo(e.target.files![0])} />
   <button onClick={pauseFileUpload}>暂停文件上传</button>
   <button onClick={resumeFileUpload}>继续文件上传</button>
   <p>文件hash生成进度</p>
   <ProgressBar progress={hashPercentage} />
   <p>文件上传总进度如下:</p>
   <div className="total_progress_area" style={{width:400}}>
     <p className='progress' style={{width:400*progress}}></p>
   </div>
   <ul className='progress_area'>
   {ProgressBarsRender}
   </ul>
  </div>
}