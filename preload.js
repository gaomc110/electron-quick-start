/**
 * 所有Node.js API都可以在预加载过程中使用。
 * 它拥有与Chrome扩展一样的沙盒。
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
window.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById("input");
  const ifm = document.getElementById("iframe");
  console.log(input);
  if(input){
   
    input.addEventListener("keydown", function(evt){
      if(evt.key==="Enter"){
        input.blur()
        updateURL(ifm,input.value)
      }
    })
  }
  

  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
/*
window.addEventListener('resize', function(){  
  changeFrameHeight();
})

function changeFrameHeight(){
  var ifm= document.getElementById("iframe");
    ifm.height=document.documentElement.clientHeight-50;
}*/

function updateURL(ifm, url){
  if (url.slice(0, 8).toLowerCase() != 'https://' 
    && url.slice(0, 7).toLowerCase() != 'http://')
    url = 'https://'+ url;
  ifm.src = url
}


/*
window.addEventListener("keydown",keydown);
//键盘监听，注意：在非ie浏览器和非ie内核的浏览器
//参数1：表示事件，keydown:键盘向下按；参数2：表示要触发的事件
function keydown(event){
//表示键盘监听所触发的事件，同时传递传递参数event
    console.log(event.keyCode)
    //document.write(event.keyCode);//keyCode表示键盘编码
}*/

function keyup_submit(e){
    console.log("hello")
  console.log(e)
   var evt = window.event || e; 
   if (evt.keyCode == 13){
    console.log("hello")
  }
}
