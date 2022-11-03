import React,{useRef} from 'react';
import {createCat,Cat,findAllCat,findAllFiles} from './api'
import {Upload} from './components/Upload'
import axios from 'axios'
import './App.css';
const cat:Cat = {
  id:99,
  name:'修猫',
  age:18,
  breed:'布偶'
}
function App() {
  const innerId = useRef<number>(66)
  const addCat = async ()=>{
    await createCat(Object.assign(cat,{id:innerId.current}))
    innerId.current++
    console.log('创建成功')
  }
  const printf = async()=>{
    const res = await findAllCat()
    console.log('所有的猫为',res.data)
  }
  const uploadFile:React.ChangeEventHandler<HTMLInputElement> =async (e)=>{
    let start = Date.now()
    const {files} = e.target
    const file = files?.[0]
    const formData = new FormData()
    formData.append('file',file!)
    formData.append('name','zzx')
    await axios.post('http://localhost:3000/file/upload',formData,{
      headers:{
      }
    })
    console.log('上传的文件为',files)
    console.log(`单个文件上传所花时间为${Date.now()-start}`)
  }
  const uploadFiles:React.ChangeEventHandler<HTMLInputElement> = e=>{
    const {files}  = e.target
    const formData = new FormData()
    for(const file of Array.from(files!)){
      console.log('file',file)
      formData.append('files',file)
    }
    formData.append('name','zzx');
    axios.post('http://localhost:3000/file/upload-files',formData)
  }
  const fetchFiles = async()=>{
    const res = await findAllFiles()
    console.log('所有文件为',res.data)
  }
  return (
    <div className="App">
      <h1>nest demo </h1>
      <button onClick={addCat}>添加一只猫</button>
      <button onClick={printf}>打印所有猫</button>
      <div>
        <span>单文件上传</span>
        <input type="file" onChange={uploadFile} maxLength={1} />
      </div>
      <div>
        <span>文件批量上传</span>
        <input type="file" max={3} multiple={true} onChange={uploadFiles} />
      </div>
      <div onClick={fetchFiles}>
       <button>获取所有文件</button> 
      </div>
      <video width={200} controls={true} src="http://localhost:3000/assets/videos/采购自采弹框整个流程预览.mov"></video>
      <Upload />
    </div>
  );
}

export default App;
