var body=document.querySelectorAll("body");

var closeButtonImg=document.querySelectorAll("span.close-operations > img");
var operationMenu=document.querySelectorAll("div.operations");
var operationMenuState=1;

var mainLog=document.querySelectorAll("span.main-log");

var optionButtons=document.querySelectorAll("div.operations button.operation");
var optionInputSpans=document.querySelectorAll("div.operations button.operation span.input");
var optionInputs=document.querySelectorAll("div.operations button.operation span.input input");
var optionSetButtons=document.querySelectorAll("div.operations button.operation span.set");

var exportFormInputs=document.querySelectorAll("form.export input");

var middleText=document.querySelectorAll("div.middle-text");

var scene=document.querySelectorAll("svg.scene");

var animationRatio=100;

var nfa={arrows:[],nodes:[]};
var dfa={arrows:[],nodes:[]};
var tmpGraph={arrows:[],nodes:[]};
var miniDFA={arrows:[],nodes:[]};


var tmpArrowStart;

var doOnClick='';
var selectedElement;

var convertionTable=[];

var graphMode='nfa';

var getEmptyDestsEntire=[];


var minimizeEQU;

var pageLoadCheckerInterval = setInterval(function() {
    if(document.readyState === 'complete') {
        clearInterval(pageLoadCheckerInterval);
        pageOnLoad();
    }
}, 100);

function pageOnLoad()
{
	body[0].setAttribute('class','transition-all');
  taskManager.reset();
	taskManager.push(function(){
		middleTextShower("welcome to NFA | DFA impelementation page");
	},0);	
  taskManager.push(function(){
    middleText[0].style.opacity='0';
  },5000);
	taskManager.push(function(){
		middleText[0].style.display='none';
	},1200);
  taskManager.push(function(){
    addState("S",nfa,true,true,false,100);
  },600);
  taskManager.push(function(){
    setNodeProperties(nfa,nfa.nodes[0],{left:320,top:300});
  },1200);
  taskManager.push(function(){
    optionButtons[0].disabled=false;
    optionButtons[1].disabled=false;
    optionButtons[4].disabled=false;
    optionButtons[8].disabled=false;
  },1000);

	taskManager.handler();
}

function middleTextShower(str,color='gray',fontSize='25px',top='200px',left='420px',width='500px')
{
  middleText[0].style.opacity='0';
  setTimeout(function(){
    middleText[0].innerHTML=str;
    middleText[0].style.color=color;
    middleText[0].style.fontSize=fontSize;
    middleText[0].style.top=top;
    middleText[0].style.left=left;
    middleText[0].style.width=width;
  },11*(animationRatio/100));
  setTimeout(function(){
  	middleText[0].style.display='block';
    setOpacity(middleText[0],1);
  },1000*(animationRatio/100));
}



function setOpacity(element,end)
{
  var start=getComputedStyle(element,null).opacity;
  element.style.opacity=start+(end-start)/2;
  setTimeout(function(){
    element.style.opacity=end;
  },3*(animationRatio/100));
}




function sceneOnclick()
{
  closeAllOperationInputSpans();
}


$(window).click(function()
{
  var e=event.toElement || event.relatedTarget;
  hideMainLog();
  switch(doOnClick)
  {
  	case 'placeState':  	
      if(e==scene[0])
      {
        switch(graphMode)	
        {
          case 'nfa':
            setNodeProperties(nfa,selectedElement,{left:event.clientX,top:event.clientY});
          break;
          case 'dfa':
            setNodeProperties(dfa,selectedElement,{left:event.clientX,top:event.clientY});
          break;
          case 'minidfa':
            setNodeProperties(miniDFA,selectedElement,{left:event.clientX,top:event.clientY});
          break;
        }  					  
  		}  		
  	break;
  	case 'placeArrowStart':  		
		for(var i=0;i<nfa.nodes.length;i++) 		
		{
			var thisNode=nfa.nodes[i];
			if((e==thisNode.circle || e==thisNode.text))
			{
				tmpArrowStart=thisNode;				
				doOnClick='placeArrowEnd';
				break;
			}			
		}
  	break;
  	case 'placeArrowEnd':
  		var thisNode; 
  		var item;
  		var thisArrow; 		
  		for(var i=0;i<nfa.nodes.length;i++) 		
  		{
  			thisNode=nfa.nodes[i];
  			if(e==thisNode.circle || e==thisNode.text)
  			{
  				var exists=false;
  				for(var ii=0;ii<nfa.arrows.length;ii++)
  				{
  					item=nfa.arrows[ii];
  					for(var iii=0;iii<item.data.length;iii++)
  					{
  						thisArrow=item.data[iii];
  						if(thisArrow.start==tmpArrowStart && thisArrow.end==thisNode && thisArrow.label==selectedElement.label)
  						{
  							console.log('repeated');
  							exists=true;
  							break;
  						}
  					}	
            if(exists)
            {   
              break;
            } 				
  				}					
  				if(exists)
  				{
  					tmpArrowStart={};				
  				}else{
  					selectedElement.start=tmpArrowStart;
  					selectedElement.pos.start={x:tmpArrowStart.x,y:tmpArrowStart.y};
  					selectedElement.end=thisNode;
  					selectedElement.pos.end={x:thisNode.x,y:thisNode.y};					
  				}	
  				updateGraph(nfa);			
  				doOnClick='placeArrowStart';
  				break;
  			}			
  		}			
  	break;
  }
});



function showMainLog(log,color='darkred',bgc='rgba(180,130,130,0.95)')
{
   setTimeout(function(){
      mainLog[0].style.top='0px';
      mainLog[0].innerHTML=log;
      mainLog[0].style.backgroundColor=bgc;
      mainLog[0].style.color=color;
   },5*(animationRatio/100));
}

function hideMainLog()
{
  if(getComputedStyle(mainLog[0],null).top.match(/[0-9]+/)=='0')
  {
     mainLog[0].style.top='-50px';
     setTimeout(function(){
       mainLog[0].style.top='-500px';
     },1*(animationRatio/100));
  }
}


function menuDropper()
{
 if (operationMenuState)
 {
   closeButtonImg[0].style.transform='rotate(180deg)';
   operationMenu[0].style.top='-110%';
   operationMenuState=0;
 }else{
   closeButtonImg[0].style.transform='rotate(0deg)';
   operationMenu[0].style.top='0';
   operationMenuState=1;   
 }
}



function closeAllOperationInputSpans(except)
{
  for(var i=0;i<optionInputSpans.length;i++)
  {
    if(except)
    {
      for(var ii=0;ii<except.length;ii++)
      {
      	if(except[ii]==i)
      	{
      		continue;
      	}
      }      
    }
    optionInputSpans[i].style.left='-400px';
  }
}


function openOperationInputSpan(index)
{
  closeAllOperationInputSpans(index);
  optionInputSpans[index].value='';
  optionInputSpans[index].style.left='81px';
}



var taskManager={
	stack:[],
	currentTask:{},
	timeout:{},
	finished:true,
	push:function(task,wait){	
			taskManager.stack.push({task:task,wait:wait});
		},	
	pause:function(){
			clearTimeout(taskManager.timeout);
			taskManager.stack.splice(0,0,taskManager.currentTask);
		},	
	handler:function(){		    
			if(!taskManager.stack.length)
			{
				taskManager.finished=true;
				return;
			}
			taskManager.finished=false;
					
			taskManager.currentTask=taskManager.stack[0];
			taskManager.stack.splice(0,1);
			taskManager.timeout=setTimeout(function(){		
				taskManager.currentTask.task();
				taskManager.handler();
			},taskManager.currentTask.wait*(animationRatio/100));
		},
	reset:function(){		    
			taskManager.stack=[];
			taskManager.currentTask={};
			taskManager.timeout={};
			taskManager.finished=true;
	}
}


function addState(label,graph,noEdit,isStart,dontDisplay,timeOut)
{
  if(!label)
  {
	   shaker(optionInputs[0]);
	   return;
  }
  if(!isStart)
  {
    isStart=false;
  }

  for(var i=0;i<nfa.nodes;i++)
  {
    if(nfa.nodes[i].label==label)
    {
      return;
    }
  }

  var thisNode={};

  thisNode.label=label;
  thisNode.circle=document.createElementNS("http://www.w3.org/2000/svg","circle");
  thisNode.text=document.createElementNS("http://www.w3.org/2000/svg","text");


  thisNode.circle.setAttribute("stroke-width","2");
  thisNode.circle.setAttribute("class","a");
  thisNode.circle.setAttribute("stroke","black");
  thisNode.circle.setAttribute("r",label.length*4+12);
  thisNode.circle.setAttribute("fill","lightBlue");
  thisNode.text.setAttribute("fill","black");  ;
  thisNode.text.setAttribute("font-size","18");
  thisNode.text.setAttribute("font-family","tahoma");
  thisNode.text.setAttribute("dy","3");
  thisNode.text.setAttribute("y",0);
  thisNode.text.setAttribute("x",0);
  thisNode.text.setAttribute("text-anchor","middle");
  thisNode.text.setAttribute("alignment-baseline","middle");

  thisNode.text.innerHTML=label;

  
  if(!dontDisplay)
  {
    scene[0].appendChild(thisNode.circle);
    scene[0].appendChild(thisNode.text);
  }
  

  thisNode.noEdit=noEdit;
  thisNode.isStart=isStart;
  if(label[0]=='$')
  {
    thisNode.isFinal=true;
  } else{
    thisNode.isFinal=false;
  }
  thisNode.in=[];
  thisNode.out=[];
  thisNode.x=0;
  thisNode.y=0;

  graph.nodes.push(thisNode);

  if(!noEdit)
  {
	  selectElement(thisNode,'placeState');
	  thisNode.circle.onclick=function()
	  {
	  	selectElement(thisNode,'placeState');
	  };
	  thisNode.text.onclick=function()
	  {
	  	selectElement(thisNode,'placeState');
	  };
  }else{
  	thisNode.circle.onclick=function()
	  {
	  	selectStateForMove(thisNode);
	  };
	  thisNode.text.onclick=function()
	  {
	  	selectStateForMove(thisNode);
	  };
  }


  if(timeOut)
  {
    setTimeout(function(){
      setNodeProperties(graph,thisNode,{top:label.length*4+12+5,left:500});
    },timeOut);
  }else{
    setNodeProperties(graph,thisNode,{top:label.length*4+12+5,left:500});
  }

  return thisNode;
}




function setNodeProperties(graph,node,properties)
{
    if(properties.left!==undefined && properties.top!==undefined)
    {      
      node.x=properties.left;
      node.y=properties.top;
    }
    if(properties.bgColor)
    {
      node.circle.setAttribute("fill",properties.bgColor);
    }
    if(properties.radius!==undefined)
    {
      node.circle.setAttribute("r",properties.radius);
    }
    if(properties.tColor)
    {
      node.text.setAttribute("fill",properties.tColor);
    }
    if(properties.stroke!==undefined)
    {
      node.text.setAttribute("stroke",properties.stroke);
    }
    updateGraph(graph);
}





function updateGraph(graph)
{
	var thisArrow;
	var thisNode;
	var arrowsDistinct=[];
	var repeated=false;
	graph.nodes.forEach(function(item){
		    item.circle.setAttribute("cy",item.y);
      	item.circle.setAttribute("cx",item.x);
      	item.text.setAttribute("transform","translate("+item.x+","+item.y+")");
      	item.text.innerHTML=item.label;
      	item.out=[];
      	item.in=[];
        if(item.label[0]=='$')
        {
          item.isFinal=true;
        }
        if(item.isStart)
        {
          item.circle.setAttribute("fill","rgb(182, 155, 76)");
        }else if(item.isFinal)
        {
          item.circle.setAttribute("fill","rgb(77, 168, 59)");
        }else{
          item.circle.setAttribute("fill","lightBlue");
        }
	});
	graph.arrows.forEach(function(item){		
		for (var i=0;i<item.data.length;i++)
		{				
			thisArrow=item.data[i];
			var start=thisArrow.pos.start;
			if(thisArrow.start.circle)
			{
				start=thisArrow.start;
				thisArrow.start.out.push(thisArrow);
			}
			var end=thisArrow.pos.end;
			if(thisArrow.end.circle)
			{
				end=thisArrow.end;
				thisArrow.end.in.push(thisArrow);
			}
			var computedGeometry=getGeometry(start,end,thisArrow.start,thisArrow.end);
			var xs=start.x+computedGeometry.dxs;
			var ys=start.y+computedGeometry.dys;
			var xe=end.x+computedGeometry.dxe;
			var ye=end.y+computedGeometry.dye;
			var distanceX=xe-xs;
			var distanceY=ye-ys;
      if(thisArrow.start.label==thisArrow.end.label)
      {
        thisArrow.path.main.setAttribute("d","M "+(xs+distanceX-14)+" "+(ys+distanceY+7)+" m -15, 0 a 15,15 0 1,0 30,0 a 15,15 0 1,0 -30,0");
        thisArrow.path.main.setAttribute("fill","transparent");
        computedGeometry.angle=45;
      }else{
        thisArrow.path.main.setAttribute("d","m "+xs+" "+ys+" l "+distanceX+" "+distanceY);
      }			
			thisArrow.path.end.setAttribute("d","m "+xe+" "+ye+" l -12 -8 l 12 8 l -12 8");		
			thisArrow.path.end.setAttribute("transform","rotate("+computedGeometry.angle+","+xe+","+ye+")");
			var textLength=thisArrow.text.innerHTML.length;
			thisArrow.text.setAttribute("transform","translate("+(xe-(6*textLength+15)*computedGeometry.coX)+","+(ye-(6*textLength+15)*computedGeometry.coY)+")");
	      	thisArrow.text.innerHTML=thisArrow.label;
	      	if(thisArrow.end.circle && thisArrow.start.circle)
	      	{
	      		thisArrow.path.main.setAttribute("stroke",'rgba(100,170,100,1)');
		      	thisArrow.path.end.setAttribute("stroke",'rgba(100,170,100,1)');
		      	thisArrow.text.setAttribute("fill","rgba(80,80,80,1)");
	      	}else{
	      		thisArrow.path.main.setAttribute("stroke",'rgba(100,170,100,0.35)');
			    thisArrow.path.end.setAttribute("stroke",'rgba(100,170,100,0.35)');
			    thisArrow.text.setAttribute("fill","rgba(80,80,80,0.35)");
	      	}
      	}
	});
	for (var i=0;i<graph.nodes.length;i++)
	{		
		thisNode=graph.nodes[i];
		arrowsDistinct=[];
		for (var ii=0;ii<thisNode.out.length;ii++)
		{
			repeated=false;
			for (var iii=0;iii<arrowsDistinct.length;iii++)
			{	
				if(arrowsDistinct[iii][0].end.circle && thisNode.out[ii].end.circle  && arrowsDistinct[iii][0].end==thisNode.out[ii].end)
				{
					arrowsDistinct[iii].push(thisNode.out[ii]);
					repeated=true;
				}
			}
			if(!repeated)
			{
				arrowsDistinct.push([thisNode.out[ii]]);
			}
		}
		for (var ii=0;ii<arrowsDistinct.length;ii++)
		{	
			arrowsDistinct[ii][0].text.innerHTML=arrowsDistinct[ii][0].label;
			for (var iii=1;iii<arrowsDistinct[ii].length;iii++)
			{	
				arrowsDistinct[ii][0].text.innerHTML+=','+arrowsDistinct[ii][iii].label;
				arrowsDistinct[ii][iii].text.innerHTML='';
			}
		}	
	}	
}

function getGeometry(start,end,startNode,endNode)
{
	var x=end.x-start.x;
	var y=end.y-start.y;
	angle=0;
	if(x)
	{
		var angle=Math.abs(Math.atan(y/x)*180/Math.PI);
	}
	
	if(x>=0 && y>=0)
	{
		angle=angle;
	}

	if(x<0 && y>=0)
	{
		angle=180-angle;
	}

	if(x<0 && y<0)
	{
		angle+=180;
	}

	if(x>=0 && y<0)
	{
		angle=360-angle;
	}

	endPadding=0;
	if(endNode.circle)
	{
		endPadding=parseInt(endNode.circle.getAttribute('r'));
	}
	startPadding=0;
	if(startNode.circle)
	{
		startPadding=parseInt(startNode.circle.getAttribute('r'));
	}

	coefficientX=Math.cos(angle*Math.PI/180);
	coefficientY=Math.sin(angle*Math.PI/180);

	dxs=startPadding*coefficientX;
	dys=startPadding*coefficientY;

	dxe=-endPadding*coefficientX;
	dye=-endPadding*coefficientY;



	return {angle:angle,dxs:dxs,dys:dys,dxe:dxe,dye:dye,coX:coefficientX,coY:coefficientY};
}


function selectStateForMove(node)
{
	if(selectedElement)
	{
		return;
	}
	selectedElement=node;	
	doOnClick='placeState';
	optionButtons[2].disabled=false;
  optionInputs[2].disabled=true;
	setTimeout(function(){
		openOperationInputSpan(2);
		optionInputs[2].value='';		
	},1);
}

function selectElement(element,onClick)
{
	if(selectedElement)
	{
		return;
	}
	selectedElement=element;	
	doOnClick=onClick;
	optionButtons[0].disabled=true;
	optionButtons[1].disabled=true;
	optionButtons[2].disabled=false;
	optionButtons[3].disabled=false;
  optionInputs[2].disabled=false;
	setTimeout(function(){
		openOperationInputSpan(2);
		optionInputs[2].value=element.label;
	},1);
}


function shaker(element,angle)
{
  if(angle==null)
  {
    angle=45;
  }
  setTimeout(function(){element.style.transform='rotate('+angle+'deg)';},300+280);
  setTimeout(function(){element.style.transform='rotate(-'+angle/2+'deg)';},300+2*280);
  setTimeout(function(){element.style.transform='rotate('+angle/3+'deg)';},300+3*280);
  setTimeout(function(){element.style.transform='rotate(-'+angle/4+'deg)';},300+4*280);
  setTimeout(function(){element.style.transform='rotate('+angle/5+'deg)';},300+5*280);
  setTimeout(function(){element.style.transform='rotate(0deg)';},300+6*280);
}

function setElementLabel()
{
	if(selectedElement.noEdit)
	{
		selectedElement=null;
		doOnClick='';
		closeAllOperationInputSpans();
		optionButtons[2].disabled=true;
		return;
	}
	var label=optionInputs[2].value.trim();
	if(!label)
	{
		shaker(optionInputs[2]);
		return;
	}	
	if(selectedElement.circle)
	{
		  selectedElement.circle.setAttribute("r",label.length*4+12);
	}else{
		  if(selectedElement.start.circle && selectedElement.end.circle)
		  {
		  	  for(var i=0;i<selectedElement.start.out.length;i++)
			  {
			  	if(selectedElement.start.out[i]!=selectedElement && selectedElement.start.out[i].end==selectedElement.end && selectedElement.start.out[i].label==label)
		  		{	
		  			return;
		  		}
			  }
		  }		  
		  var thisArrow;
		  for(var i=0;i<nfa.arrows.length;i++)
		  {
				thisArrow=nfa.arrows[i];
				if(thisArrow.label==selectedElement.label)
				{				
					thisArrow.data.splice(thisArrow.data.indexOf(selectedElement),1);
					if(!thisArrow.data.length)
					{
						nfa.arrows.splice(nfa.arrows.indexOf(thisArrow),1);
					}	
					break;
				}
		  }			
		  var prevArrow;
		  var exists=false;
		  for(var i=0;i<nfa.arrows.length;i++)
		  {
		  	prevArrow=nfa.arrows[i];
			if(prevArrow.label==label)
			{
				exists=true;
				break;
			}  	
		  }
		  if(exists)
		  {
		  	prevArrow.data.push(selectedElement);
		  }else{
		  	nfa.arrows.push({data:[selectedElement],label:label});
		  }
	}
	selectedElement.label=label;

	selectedElement=null;
	doOnClick='';
	closeAllOperationInputSpans();
	updateGraph(nfa);
	optionButtons[0].disabled=false;
	optionButtons[1].disabled=false;
	optionButtons[2].disabled=true;
	optionButtons[3].disabled=true;
}

function addArrow(label,graph,noEdit,dontDisplay)
{
  if(!label)
  {
	   shaker(optionInputs[1]);
	   return;
  }

  var thisArrow={};
  
  thisArrow.label=label;
  
  thisArrow.path={};

  thisArrow.path.main=document.createElementNS("http://www.w3.org/2000/svg","path");
  thisArrow.path.main.setAttribute("stroke",'rgba(100,170,100,0.35)');
  thisArrow.path.main.setAttribute("stroke-width",'2');
  thisArrow.path.main.setAttribute("d","m 0 0 l 100 0");

  thisArrow.path.end=document.createElementNS("http://www.w3.org/2000/svg","path");
  thisArrow.path.end.setAttribute("stroke",'rgba(100,170,100,0.35)');
  thisArrow.path.end.setAttribute("stroke-width",'2');
  thisArrow.path.end.setAttribute("d","m 0 0 l -12 -8 l 12 8 l -12 8");

  thisArrow.text=document.createElementNS("http://www.w3.org/2000/svg","text");
  thisArrow.text.setAttribute("fill","rgba(80,80,80,0.35)");
  thisArrow.text.setAttribute("font-size","18");
  thisArrow.text.setAttribute("font-family","tahoma");
  thisArrow.text.style.fontWeight="bolder";
  thisArrow.text.setAttribute("dy","3");
  thisArrow.text.setAttribute("y",0);
  thisArrow.text.setAttribute("x",0);
  thisArrow.text.setAttribute("text-anchor","middle");
  thisArrow.text.setAttribute("alignment-baseline","middle");

  thisArrow.text.innerHTML=label;
  
  if(!dontDisplay)
  {
    scene[0].appendChild(thisArrow.path.main);
    scene[0].appendChild(thisArrow.path.end);
    scene[0].appendChild(thisArrow.text);
  } 

  thisArrow.start={};
  thisArrow.end={};

  var prevArrow;
  var exists=false;
  for(var i=0;i<graph.arrows.length;i++)
  {
  	prevArrow=graph.arrows[i];
	if(prevArrow.label==label)
	{
		exists=true;
		break;
	}  	
  }
  if(exists)
  {
  	prevArrow.data.push(thisArrow);
  }else{
  	graph.arrows.push({data:[thisArrow],label:label});
  }
  
  if(!noEdit)
  {
  	selectElement(thisArrow,'placeArrowStart');
	  thisArrow.path.main.onclick=function()
	  {
	  	selectElement(thisArrow,'placeArrowStart');
	  };
	  thisArrow.path.end.onclick=function()
	  {
	  	selectElement(thisArrow,'placeArrowStart');
	  };
	  thisArrow.text.onclick=function()
	  {
	  	selectElement(thisArrow,'placeArrowStart');
	  };  
  }
  


  thisArrow.pos={start:{x:300,y:20},end:{x:400,y:20}};
  thisArrow.path.main.setAttribute("d","m 300 20 l 100 0");
  thisArrow.path.end.setAttribute("d","m 400 20 l -12 -8 l 12 8 l -12 8");

  if(!dontDisplay)
  {
    reDraewGraph(graph);
  }

  return thisArrow;
}


function deleteElement()
{
	if(!selectedElement)
	{
		return;
	}

	if(selectedElement.path)
	{
		var thisArrow;
		for(var i=0;i<nfa.arrows.length;i++)
		{
			thisArrow=nfa.arrows[i];
			console.log(thisArrow.data.indexOf(selectedElement));
			if(thisArrow.label==selectedElement.label)
			{				
				console.log(thisArrow.data.splice(thisArrow.data.indexOf(selectedElement),1));
				if(!thisArrow.data.length)
				{
					nfa.arrows.splice(nfa.arrows.indexOf(thisArrow),1);
				}	
				break;
			}
		}			
		if(selectedElement.start.out)
		{
			selectedElement.start.out.splice(selectedElement.start.out.indexOf(selectedElement),1);
		}		
		if(selectedElement.end.in)
		{
			selectedElement.end.in.splice(selectedElement.end.in.indexOf(selectedElement),1);
		}		
		scene[0].removeChild(selectedElement.path.end);
		scene[0].removeChild(selectedElement.path.main);
		scene[0].removeChild(selectedElement.text);
	}else{
		nfa.nodes.splice(nfa.nodes.indexOf(selectedElement),1);
		for(var i=0;i<selectedElement.in.length;i++)
		{
			var item=selectedElement.in[i];
			item.end={};
		}
		for(var i=0;i<selectedElement.out.length;i++)
		{
			var item=selectedElement.out[i];
			item.start={};
		}
		scene[0].removeChild(selectedElement.circle);
		scene[0].removeChild(selectedElement.text);
	}	

	selectedElement=null;
	doOnClick='';
	optionButtons[2].disabled=true;
	closeAllOperationInputSpans();
	updateGraph(nfa);
	optionButtons[0].disabled=false;
	optionButtons[1].disabled=false;
	optionButtons[2].disabled=true;
	optionButtons[3].disabled=true;
}




function createDFAfromNFA(dontDisplay)
{	
  if(!dontDisplay)
  {
  	graphMode='dfa';
  	optionButtons.forEach(function(item){
  		item.disabled=true;
  	});
  	optionButtons[4].disabled=true;
  	optionButtons[5].disabled=false;
    optionButtons[6].disabled=false;
  	selectedElement=null;
  	doOnClick='';
  	closeAllOperationInputSpans();
  	disAppearGraph(nfa);
  }

	dfa={arrows:[],nodes:[]};
	convertionTable=[];
	setTmpGraph();
	var tmp={};	
	var pointer=-1;
	var exists=false;
	convertionTable.push({state:[tmpGraph.nodes[0]],dest:null});
	while(1)
	{
		pointer++;
		if(pointer==convertionTable.length)
		{
			break;
		}		
		tmp=pushConvertionTable(convertionTable[pointer].state);
		convertionTable[pointer].dest=tmp;console.log('state:');console.log(convertionTable[pointer].state);		
		for(var i=0;i<tmpGraph.arrows.length;i++)
		{
			thisDest=tmp[tmpGraph.arrows[i].label];
			exists=false;console.log('dest:');
			for(var ii=0;ii<convertionTable.length;ii++)
			{
				if(setEqualsSet(convertionTable[ii].state,thisDest))
				{
					exists=true;
					break;
				}
			}
			if(!exists)
			{	console.log(thisDest);
				convertionTable.push({state:thisDest,dest:null});
			}
		}	
	}

  standardizeConvertionTable();

	var thisState;
	var prevState;
	var aboveState;
	var x;
	var y;
	for(var i=0;i<convertionTable.length;i++)
	{
    var isStart=false;
    if(i==0)
    {
      isStart=true;
    }
    var isFinal=false;
    for(var ii=0;ii<convertionTable[i].state.length;ii++)
    {
      if(convertionTable[i].state[ii].isFinal)
      {
        isFinal=true;
        break;
      }
    }
		addState(createStateLableFromStateSet(convertionTable[i].state),dfa,true,isStart,dontDisplay);	
		thisState=dfa.nodes[i];
    thisState.isFinal=isFinal;
		prevState=dfa.nodes[i-1];
		aboveState=dfa.nodes[i-4];
		if(prevState && i%4!=0)
		{
			x=prevState.x+parseInt(prevState.circle.getAttribute('r'))+parseInt(thisState.circle.getAttribute('r'))+100;console.log(prevState.x);
		}else{
			x=300;
		}
		if(aboveState)
		{
			y=aboveState.y+parseInt(aboveState.circle.getAttribute('r'))+parseInt(thisState.circle.getAttribute('r'))+100;console.log(aboveState.y);
		}else{
			y=150;
		}
		if(i%2==0)
		{
			y+=20;
		}else{
			y-=20;
		}
		setNodeProperties(dfa,thisState,{top:y,left:x});	
	}

	var thisArrow;
	var startState;
	var endState;
	for(var i=0;i<convertionTable.length;i++)
	{			
		for(var ii=0;ii<tmpGraph.arrows.length;ii++)
		{
			for(var iii=0;iii<dfa.nodes.length;iii++)
			{
				console.log(dfa.nodes[iii].label+'\n'+createStateLableFromStateSet(convertionTable[i].state,','));
				if(dfa.nodes[iii].label==createStateLableFromStateSet(convertionTable[i].state,','))
				{ 
					startState=dfa.nodes[iii];
				}
				if(dfa.nodes[iii].label==createStateLableFromStateSet(convertionTable[i].dest[tmpGraph.arrows[ii].label],','))
				{
					endState=dfa.nodes[iii];
				}
			}
			thisArrow=addArrow(tmpGraph.arrows[ii].label,dfa,true,dontDisplay);
			thisArrow.start=startState;
			thisArrow.pos.start={x:startState.x,y:startState.y};
			thisArrow.end=endState;
			thisArrow.pos.end={x:endState.x,y:endState.y};								
		}			
	}

	if(!dontDisplay)
  {
    updateGraph(dfa);
  }

}


function standardizeConvertionTable()
{
  var dest;
  for(var i=0;i<convertionTable.length;i++)
  {
    for(var ii=0;ii<convertionTable.length;ii++)
    {
      for(var iii=0;iii<tmpGraph.arrows.length;iii++)
      {
        dest=convertionTable[ii].dest[tmpGraph.arrows[iii].label];
        if(setEqualsSet(dest,convertionTable[i].state))
        {
          convertionTable[ii].dest[tmpGraph.arrows[iii].label]=convertionTable[i].state;
        }
      }
    }
  }
}

function createStateLableFromStateSet(array)
{	
	var str='';
	str+='{';
	for(var i=0;i<array.length;i++)
	{
		if(i>0)
		{
			str+=',';
		}
    if(array[i].label)
    {
      str+=array[i].label;  
    }else{
      str+=array[i];
    }			
	}
	str+='}';
	return str;
}

function checkIfLabelIncludesLabel(heystack,needle)
{ 
  if(heystack.includes(needle))
  {
    return true;
  }
  return false;
}


function pushConvertionTable(stateSet)
{
	var thisArrow;
	var thisState;
	var thisSetMember;
	var thisSet;
	var set={};
	for(var i=0;i<tmpGraph.arrows.length;i++)
	{
		thisArrow=tmpGraph.arrows[i];
		set[thisArrow.label]=[];
	}
	set.length=i;
	if(set==[])
	{
		return set;
	}
	for(var i=0;i<stateSet.length;i++)
	{
		thisState=stateSet[i];
		thisSet=getDestination(thisState);
		for(var ii=0;ii<tmpGraph.arrows.length;ii++)
		{
			thisArrow=tmpGraph.arrows[ii];
			thisSetMember=thisSet[thisArrow.label];
			addSetToSet(thisSetMember,set[thisArrow.label]);
		}	
	}
	return set;
}

function getDestination(state)
{
	var set={};
	var thisArrow;
	for(var i=0;i<tmpGraph.arrows.length;i++)
	{
		thisArrow=tmpGraph.arrows[i];
		set[thisArrow.label]=getDestinationByArrow(state,thisArrow);
	}
	set.length=i;
	return set;
}


function getDestinationByArrow(state,arrow)
{
	var set=[];
	var thisArrow;
	var thisData;
	for(var i=0;i<tmpGraph.arrows.length;i++)
	{
		thisArrow=tmpGraph.arrows[i];
		if(thisArrow.label==arrow.label)
		{
			for(var ii=0;ii<thisArrow.data.length;ii++)
			{
				thisData=thisArrow.data[ii];
			 	if(thisData.start.label==state.label)
			 	{
			 		if(thisData.end.label)
					{
						getEmptyDestsEntire=[];	
						getEmptyDests(thisData.end);
						addSetToSet(getEmptyDestsEntire,set);											
					}
			 	}
			}
			
		}
	}
	return set;
}




function getEmptyDests(state)
{
	if(isMemberInSet(state,getEmptyDestsEntire))
	{
		return;
	}	
	addMemberToSet(state,getEmptyDestsEntire);	
	for(var i=0;i<state.out.length;i++)
	{
		if(state.out[i].label=='%')
		{		
			getEmptyDests(state.out[i].end);				
		}
	}	
}




function addMemberToSet(member,toSet)
{
	var repeated=false;
	toSet.forEach(function(token){
		if(token===member)
		{
			repeated=true;
		}
	});	
	if(repeated)
	{
		return toSet;
	}
	toSet.push(member);
	return toSet;
}


function setEqualsSet(set1,set2)
{
	if(set1.length==set2.length && isSetInSet(set1,set2))
	{
		return true;
	}

	return false;
}


function isMemberInSet(member,inSet)
{
	var found=false;
	inSet.forEach(function(setMember){
		if(setMember==member)
		{
			found=true;
		}
	});

	return found;
}


function isSetInSet(set,inSet)
{
	var match=true;
	set.forEach(function(setMember){
		if(!isMemberInSet(setMember,inSet))
		{
			match=false;
		}
	});

	return match;
}



function addSetToSet(set,toSet)
{
	set.forEach(function(token){
		toSet=addMemberToSet(token,toSet);
	});
	return toSet;
}



function reDraewGraph(graph)
{
  for(var i=0;i<graph.nodes.length;i++)
  {
     scene[0].removeChild(graph.nodes[i].circle);
     scene[0].removeChild(graph.nodes[i].text);
     scene[0].appendChild(graph.nodes[i].circle);
     scene[0].appendChild(graph.nodes[i].text);
  }
  for(var i=0;i<graph.arrows.length;i++)
  {
  	 for(var ii=0;ii<graph.arrows[i].data.length;ii++)
  	 {
	     scene[0].removeChild(graph.arrows[i].data[ii].text);
	     scene[0].appendChild(graph.arrows[i].data[ii].text);
  	 }
  }
}



function appearGraph(graph)
{
  for(var i=0;i<graph.arrows.length;i++)
  {
  	 for(var ii=0;ii<graph.arrows[i].data.length;ii++)
  	 {
	     scene[0].appendChild(graph.arrows[i].data[ii].path.main);
  	 }
  	 for(var ii=0;ii<graph.arrows[i].data.length;ii++)
  	 {
	     scene[0].appendChild(graph.arrows[i].data[ii].path.end);
  	 }
  }
  for(var i=0;i<graph.nodes.length;i++)
  {
     scene[0].appendChild(graph.nodes[i].circle);
     scene[0].appendChild(graph.nodes[i].text);
  }
  for(var i=0;i<graph.arrows.length;i++)
  {
  	 for(var ii=0;ii<graph.arrows[i].data.length;ii++)
  	 {
	     scene[0].appendChild(graph.arrows[i].data[ii].text);
  	 }
  }
}

function disAppearGraph(graph)
{
  try
  {
   	scene[0].removeChild(graph.nodes[0].circle);
   	scene[0].removeChild(graph.nodes[0].text);
  }catch(e){
 	  return false;
  } 
  for(var i=1;i<graph.nodes.length;i++)
  {
  	 scene[0].removeChild(graph.nodes[i].circle);
     scene[0].removeChild(graph.nodes[i].text);
  }
  for(var i=0;i<graph.arrows.length;i++)
  {
  	 for(var ii=0;ii<graph.arrows[i].data.length;ii++)
  	 {
  	 	 scene[0].removeChild(graph.arrows[i].data[ii].path.main);
  	 	 scene[0].removeChild(graph.arrows[i].data[ii].path.end);
	     scene[0].removeChild(graph.arrows[i].data[ii].text);
  	 }
  }
}


function setTmpGraph()
{
	  tmpGraph={arrows:[],nodes:[]};

	  tmpGraph.nodes=nfa.nodes;
	  
	  var prevArrow;
	  var exists;
	  var thisArrow;
	  for(var i=0;i<nfa.arrows.length;i++)
	  {	  	  
	  	  for(var ii=0;ii<nfa.arrows[i].data.length;ii++)
	  	  {
	  	  	  thisArrow=nfa.arrows[i].data[ii];
	  	  	  if(thisArrow.label=='%' || !thisArrow.start.circle || !thisArrow.end.circle)
	  	  	  {
	  	  	  	continue;
	  	  	  }
	  	  	  
	  	  	  prevArrow;
	  	  	  exists=false;
			  for(var iii=0;iii<tmpGraph.arrows.length;iii++)
			  {
			  	prevArrow=tmpGraph.arrows[iii];
				if(prevArrow.label==thisArrow.label)
				{
					exists=true;
					break;
				}  	
			  }
			  if(exists)
			  {
			  	prevArrow.data.push(thisArrow);
			  }else{
			  	tmpGraph.arrows.push({data:[thisArrow],label:thisArrow.label});
			  }
		  }
	  }

}

function backToNFA()
{
	closeAllOperationInputSpans();
	disAppearGraph(dfa);
	appearGraph(nfa);
	optionButtons.forEach(function(item){
		item.disabled=true;
	});
	optionButtons[0].disabled=false;
 	optionButtons[1].disabled=false;
 	optionButtons[4].disabled=false;
  optionButtons[8].disabled=false;
 	optionButtons[5].disabled=true; 	
 	selectedElement=null;
  doOnClick='';
 	graphMode='nfa';
}




function minimizeDFA(dontDisplay)
{
  if(!dontDisplay)
  {
    graphMode='minidfa';
    optionButtons.forEach(function(item){
      item.disabled=true;
    });
    optionButtons[7].disabled=false;
    selectedElement=null;
    doOnClick='';
    closeAllOperationInputSpans();
    disAppearGraph(dfa);
  }
  miniDFA={arrows:[],nodes:[]};
  var equ=[[[],[]]];
  var currentEqu;
  var found;
  var prevEqu=[];
  for(var i=0;i<dfa.nodes.length;i++)
  {
    if(!dfa.nodes[i].isFinal)
    {
      equ[0][0].push(dfa.nodes[i].label);
    }else{
      equ[0][1].push(dfa.nodes[i].label);
    }
  }
  ixxx=0;
  var pointer=-1;
  while(1 && ixxx<100)
  {
    ixxx++;
    pointer++;
    prevEqu=equ[pointer];    
    currentEqu=[];
    for(var i=0;i<prevEqu.length;i++)
    {        
        for(var ii=0;ii<prevEqu[i].length;ii++)
        {   
            found=false;
            for(var iii=0;iii<currentEqu.length;iii++)
            {
              if(getGroupInEqu(currentEqu[iii][0],prevEqu)!=i)
              {
                continue;
              }
              if(checkEquivalence(currentEqu[iii][0],prevEqu[i][ii],prevEqu))
              {
                found=iii;
                break;
              }
            }    
            if(found!==false)
            {
              currentEqu[iii].push(prevEqu[i][ii]);
            }else{              
              currentEqu.push([prevEqu[i][ii]]);
            }
        }               
    }        
    if(equEqualsEqu(prevEqu,currentEqu))
    {
      break;
    }
    console.log('currentEqu=>');
    console.log(currentEqu); 
    equ.push(currentEqu);
  }
  console.log(ixxx);
  console.log('equ=>');
  console.log(equ);

  minimizeEQU=equ;
  
  setMiniDFANodes(dontDisplay);
  setMiniDFAArrows(dontDisplay);
  if(!dontDisplay)
  {
    updateGraph(miniDFA);
  }
}


function setMiniDFAArrows(dontDisplay)
{
  var thisArrow;
  var startState;
  var endState;
  var exists;
  for(var i=0;i<convertionTable.length;i++)
  {     
    for(var ii=0;ii<tmpGraph.arrows.length;ii++)
    {
      startState=miniDFA.nodes[getNodeIndexInMiniDFA(createStateLableFromStateSet(convertionTable[i].state,','))];      
      endState=miniDFA.nodes[getNodeIndexInMiniDFA(createStateLableFromStateSet(convertionTable[i].dest[tmpGraph.arrows[ii].label],','))];      
      exists=false;
      for(var iii=0;iii<miniDFA.arrows.length;iii++)
      {
        for(var iiii=0;iiii<miniDFA.arrows[iii].data.length;iiii++)
        {
          thisArrow=miniDFA.arrows[iii].data[iiii];
          if(thisArrow.start==startState && thisArrow.end==endState && thisArrow.label==tmpGraph.arrows[ii].label)
          {
            console.log(thisArrow.start.label+' '+thisArrow.end.label);
            exists=true;
            break;
          }
        }    
        if(exists)
        {   
          break;
        }  
      }         
      if(exists)
      {
        continue;    
      } 
      thisArrow=addArrow(tmpGraph.arrows[ii].label,miniDFA,true,dontDisplay);
      thisArrow.start=startState;
      thisArrow.pos.start={x:startState.x,y:startState.y};
      thisArrow.end=endState;
      thisArrow.pos.end={x:endState.x,y:endState.y};                
    }     
  }
}


function setMiniDFANodes(dontDisplay)
{  
  var equ=minimizeEQU[minimizeEQU.length-1];

  var thisState;
  var prevState;
  var aboveState;
  var x;
  var y;
  for(var i=0;i<equ.length;i++)
  {
    var isStart=hasSpecialState(equ[i],'start');

    addState(createStateLableFromStateSet(equ[i]),miniDFA,true,isStart,dontDisplay);  
    thisState=miniDFA.nodes[i];
    thisState.isFinal=hasSpecialState(equ[i],'final');
    prevState=miniDFA.nodes[i-1];
    aboveState=miniDFA.nodes[i-4];
    if(prevState && i%4!=0)
    {
      x=prevState.x+parseInt(prevState.circle.getAttribute('r'))+parseInt(thisState.circle.getAttribute('r'))+100;console.log(prevState.x);
    }else{
      x=300;
    }
    if(aboveState)
    {
      y=aboveState.y+parseInt(aboveState.circle.getAttribute('r'))+parseInt(thisState.circle.getAttribute('r'))+100;console.log(aboveState.y);
    }else{
      y=150;
    }
    if(i%2==0)
    {
      y+=20;
    }else{
      y-=20;
    }console.log(x+' '+y);
    setNodeProperties(miniDFA,thisState,{top:y,left:x});  
  }
}


function equEqualsEqu(equ1,equ2)
{
  if(equ1.length!=equ2.length)
  {
    return false;
  }
  var found;
  for(var i=0;i<equ1.length;i++)
  {
      found=false
      for(var ii=0;ii<equ2.length;ii++)
      {
        if(setEqualsSet(equ1[i],equ2[ii]))
        {
          found=true;
        }
      }
      if(!found)
      {
        return false;
      }
  }
  return true;
}

function checkEquivalence(stateLabel1,stateLabel2,prevEqu)
{
  var row1;
  var row2;
  for(var i=0;i<convertionTable.length;i++)
  {
    if(createStateLableFromStateSet(convertionTable[i].state)==stateLabel1)
    {
      row1=convertionTable[i];
    }
    if(createStateLableFromStateSet(convertionTable[i].state)==stateLabel2)
    {
      row2=convertionTable[i];
    }
  }  
console.log(createStateLableFromStateSet(row1.state)+' , '+createStateLableFromStateSet(row2.state));
  for(var i=0;i<tmpGraph.arrows.length;i++)
  {
    console.log(createStateLableFromStateSet(row1.dest[tmpGraph.arrows[i].label])+'->'+getGroupInEqu(createStateLableFromStateSet(row1.dest[tmpGraph.arrows[i].label]),prevEqu)+'\n'+createStateLableFromStateSet(row2.dest[tmpGraph.arrows[i].label])+'->'+getGroupInEqu(createStateLableFromStateSet(row2.dest[tmpGraph.arrows[i].label]),prevEqu));
    if(getGroupInEqu(createStateLableFromStateSet(row1.dest[tmpGraph.arrows[i].label]),prevEqu)!=getGroupInEqu(createStateLableFromStateSet(row2.dest[tmpGraph.arrows[i].label]),prevEqu))
    {
      return false;
    }
  }
  return true;
}

function getGroupInEqu(state,equ)
{
  for(var i=0;i<equ.length;i++)
  {
    for(var ii=0;ii<equ[i].length;ii++)
    {
      if(equ[i][ii]==state)
      {
        return i;
      }
    } 
  }
  console.log('getGroupInEqu->not found');
}

function getNodeIndexInMiniDFA(state)
{
  for(var i=0;i<miniDFA.nodes.length;i++)
  {
    if(checkIfLabelIncludesLabel(miniDFA.nodes[i].label,state))
    {
      return i;
    }
  }
  console.log('getNodeIndexInMiniDFA->not found');
  return -1;
}





function backToDFA()
{
  closeAllOperationInputSpans();
  disAppearGraph(miniDFA);
  appearGraph(dfa);
  optionButtons.forEach(function(item){
    item.disabled=true;
  });
  optionButtons[5].disabled=false;
  optionButtons[6].disabled=false;
  selectedElement=null;
  doOnClick='';
  graphMode='dfa';
}


function hasSpecialState(equ,mode)
{
  if(mode=='start')
  {
    for(var i=0;i<equ.length;i++)
    {
      for(var ii=0;ii<dfa.nodes.length;ii++)
      {
        if(dfa.nodes[ii].label==equ[i] && dfa.nodes[ii].isStart)
        {
          return true;
        }
      }
    }
  }else{
    for(var i=0;i<equ.length;i++)
    {
      for(var ii=0;ii<dfa.nodes.length;ii++)
      {
        if(dfa.nodes[ii].label==equ[i] && dfa.nodes[ii].isFinal)
        {
          return true;
        }
      }
    }
  }
  return false;
}



function exportJSON()
{
  var tmp;
  createDFAfromNFA(true);
  minimizeDFA(true);
  var data={};
  data.nfa=[];
  for(var i=0;i<nfa.nodes.length;i++)
  {
    tmp={label:nfa.nodes[i].label,isStart:nfa.nodes[i].isStart,isFinal:nfa.nodes[i].isFinal,in:[],out:[]};
    for(var ii=0;ii<nfa.nodes[i].in.length;ii++)
    {
      tmp.in.push(nfa.nodes[i].in[ii].label);
    }
    for(var ii=0;ii<nfa.nodes[i].out.length;ii++)
    {
      tmp.out.push(nfa.nodes[i].out[ii].label);
    }
    data.nfa.push(tmp);
  }
  data.dfa=[];
  for(var i=0;i<dfa.nodes.length;i++)
  {
    tmp={label:dfa.nodes[i].label,isStart:dfa.nodes[i].isStart,isFinal:dfa.nodes[i].isFinal,in:[],out:[]};
    for(var ii=0;ii<dfa.nodes[i].in.length;ii++)
    {
      tmp.in.push(dfa.nodes[i].in[ii].label);
    }
    for(var ii=0;ii<dfa.nodes[i].out.length;ii++)
    {
      tmp.out.push(dfa.nodes[i].out[ii].label);
    }
    data.dfa.push(tmp);
  }
  data.miniDFA=[];
  for(var i=0;i<miniDFA.nodes.length;i++)
  {
    tmp={label:miniDFA.nodes[i].label,isStart:miniDFA.nodes[i].isStart,isFinal:miniDFA.nodes[i].isFinal,in:[],out:[]};
    for(var ii=0;ii<miniDFA.nodes[i].in.length;ii++)
    {
      tmp.in.push(miniDFA.nodes[i].in[ii].label);
    }
    for(var ii=0;ii<miniDFA.nodes[i].out.length;ii++)
    {
      tmp.out.push(miniDFA.nodes[i].out[ii].label);
    }
    data.miniDFA.push(tmp);
  }
  var jsonStrinified=JSON.stringify(data);
  exportFormInputs[0].value=jsonStrinified;
  return data;
}


