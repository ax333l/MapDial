import ProgressLoader from 'rn-progress-loader'
import React from 'react'

export function loader(){
    return(
      <ProgressLoader
      visible={true}
      isModal={true} isHUD={true}
      hudColor={"#000000"}
      color={"#FFFFFF"} />
    )
}
  