flash.outputPanel.clear();

var doc = flash.getDocumentDOM();
doc.exitEditMode();

var lib = doc.library;

doc.selectAll();
var list = doc.selection.concat();

var flag = false;
for each(var element in list)
{
	if (element.libraryItem)
	{		
		if (convertToSymbol(element)) flag = true;	
	}
}

doc.exitEditMode();
if (!flag)
{	
	trace("在舞台上没有找到符合要求的位图元件！！");
}

function convertToSymbol(item)
{
	doc.exitEditMode();
	
	var symbol = item.libraryItem;
	if (item.left != item.x || item.top != item.y)
	{		
		trace("[" + symbol.name + "]资源没有左上对齐: offset={x:" + (item.left - item.x).toFixed(2) + ", y:" + (item.top - item.y).toFixed(2) + "}");
		return false;
	}	
	
	var index = 0;	
	var name = item.libraryItem.name.replace(/\.[^\.]+$/, "") + "-clip";
	while (lib.itemExists(name))
	{
		name = name.replace(/\-\d+$/, "") + "-" + (++index);
	}	
	
	doc.selectNone();
	
	var num;
	var center = {x: item.x + item.width / 2, y: item.y + item.height / 2};
	doc.mouseClick(center, false, false);
	
	switch(item.instanceType)
	{
		case "bitmap":
		{
			symbol = doc.convertToSymbol('movie clip', name, 'top left');
			lib.setItemProperty('scalingGrid',  true);
			doc.enterEditMode();
			doc.breakApart();
			break;
		}
		
		case "symbol":
		{
			doc.enterEditMode();
			
			num = 0;
			while (true)
			{
				doc.selectAll();
				if (doc.selection.length != 1) 
				{
					trace("[" + symbol.name + "]子元件个数：" + doc.selection.length);
					return false;
				}
				
				item = doc.selection[0];
				if (item.isGroup) 
				{
					num++;
					doc.breakApart();
				}
				else
				{
					if (num > 0) trace("[" + symbol.name + "]打散" + num + "层分组");
					break;
				}
			}
			
			if (item.elementType == "shape")
			{
				//if (item.isDrawingObject) return false;
			}
			else
			if (item.libraryItem.itemType == "bitmap")
			{
				doc.breakApart();
			}
			else
			{
				return false;
			}
			
			if (!symbol.scalingGrid) 
			{
				lib.selectItem(symbol.name);
				lib.setItemProperty('scalingGrid',  true);				
			}
			
			break;
		}
		
		default:return false;
	}
	
	doc.selectAll();
	item = doc.selection[0];
	
	var grids = symbol.scalingGridRect;
	
	// 第一行
	doc.setSelectionRect({left:0, top:0, right:grids.left, bottom:grids.top}, true, false);
	doc.group();
	
	doc.setSelectionRect({left:grids.left, top:0, right:grids.right, bottom:grids.top}, true, false);
	doc.group();
	
	doc.setSelectionRect({left:grids.right, top:0, right:item.width, bottom:grids.top}, true, false);
	doc.group();
	
	// 第二行
	doc.setSelectionRect({left:0, top:grids.top, right:grids.left, bottom:grids.bottom}, true, false);
	doc.group();
	
	doc.setSelectionRect({left:grids.left, top:grids.top, right:grids.right, bottom:grids.bottom}, true, false);
	doc.group();
	
	doc.setSelectionRect({left:grids.right, top:grids.top, right:item.width, bottom:grids.bottom}, true, false);
	doc.group();
	
	// 第三行
	doc.setSelectionRect({left:0, top:grids.bottom, right:grids.left, bottom:item.height}, true, false);
	doc.group();
	
	doc.setSelectionRect({left:grids.left, top:grids.bottom, right:grids.right, bottom:item.height}, true, false);
	doc.group();
	
	doc.setSelectionRect({left:grids.right, top:grids.bottom, right:item.width, bottom:item.height}, true, false);
	doc.group();	
	
	doc.exitEditMode();
	trace("[" + symbol.name + "]九宫格切片成功");
	return true;
}

function trace()
{
	var list = [];
	for (var i = 0; i < arguments.length; i++) list.push(arguments[i])
	
	flash.trace(list.join(", "));
}
