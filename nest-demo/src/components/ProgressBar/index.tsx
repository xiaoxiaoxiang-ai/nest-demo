import {CSSProperties} from 'react'
import './index.css'
type ProgressBarProps = {
  progress:number,
  width?:number
  height?:number
  backgroundColor?:CSSProperties['color']
  highLightColor?:CSSProperties['color']
}

export const ProgressBar:React.FC<ProgressBarProps> = props=>{
  const {progress = 0,width = 150,height = 15,backgroundColor = 'gray',highLightColor = 'lightpink'} = props
  return <div className='progress_bar_container' style={{width, backgroundColor,height}}>
    <p className='inner_progress' style={{width:progress*width,backgroundColor:highLightColor,height}}></p>
  </div>
}