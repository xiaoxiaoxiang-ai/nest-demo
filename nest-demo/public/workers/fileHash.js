/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-undef
importScripts('/spark-md5.min.js')
self.onmessage = e=>{
  const {chunks} = e.data
  const spark = new self.SparkMD5.ArrayBuffer()
  let count = 0
  const fileReader = new FileReader()
  fileReader.onload = e=>{
    count++
    spark.append(e.target.result)
    self.postMessage({
      hash:'',
      percentage:+(count/chunks.length).toFixed(2)
    })
    loadNext()
  }
  const loadNext = ()=>{
    if(count===chunks.length){
      self.postMessage({
        hash:spark.end(),
        percentage:1
      })
      self.close()
    }
    else{
      fileReader.readAsArrayBuffer(chunks[count])
    }
  }
  loadNext()
}