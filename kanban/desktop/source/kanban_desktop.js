
var Kanban=Kanban || {};

//

Kanban.Application=function()
{
	var m_appWidth=0;
	var m_appHeight=0;
	
	var m_toolbar=null;
	var m_content=null;
	var m_statusBar=null;
	
	var m_client=null;
	var m_clientId='';
	
	var m_dialogBack=null;
	var m_dialogStack=null;
	
	var m_user=null;
	var m_project=null;
	
	var m_taskColumn=null;
	
	var m_dragDown=false;
	var m_dragMove=false;
	var m_dragTask=-1;
	var m_dragEl=null;
	
	var m_editedTask=-1;
	
	var m_selectedColor=Kanban.G_Colors[0];
	
	//
	
	var f_initialize=function()
	{
		m_toolbar=$('#toolbar');
		m_content=$('#content_wrap');
		m_statusBar=$('#status_bar');
		
		$(document).mouseup(function()
		{
			f_cancelDrag();
		});
		
		m_dialogBack=$('#dialog_back');
		m_dialogStack=new Array();
		
		m_user=new Kanban.User();
		m_user.Initialize();
		
		f_onResize();
		f_initSelects();
		
		f_populateColorChoice();
		
		
$(window).resize(f_onResize);

//

$('#button_setClientLocal').click(function()
{
	f_setClient(Kanban.CLIENT_LOCAL);
	f_hideDialog();
});

//

$('#button_setClientNode').click(function()
{
	f_setClient(Kanban.CLIENT_NODE);
	f_hideDialog();
	f_showDialog('dialog_serverAddress');
});

//

$('#button_newProjectDialog').click(function()
{
	f_showDialog('dialog_newProject');
});

//

$('#button_openProjectDialog').click(function()
{
	f_showOpenProjectDialog();
});

//

$('#button_newProject').click(function()
{
	f_hideDialog();
	f_createNewProject();
});

//

$('#button_openProject').click(function()
{
	f_hideDialog();
	f_openProject();
});

//

$('#button_addColumnDialog').click(function()
{
	if(m_project!==null)
	{
		f_showDialog('dialog_addColumn');
	}
	else
	{
		f_showOpenProjectDialog();
	}
});

//

$('#button_addColumn').click(function()
{
	f_hideDialog();
	f_addColumn();
});

//

$('#button_addTask').click(function()
{
	f_hideDialog();
	f_addTask();
});

//

$('#button_editTask').click(function()
{
	f_hideDialog();
	f_updateEditedTask();
});

//

$('#button_connect').click(function()
{
	f_hideDialog();
	f_tryConnection();
});

//

$('#button_authenticate').click(function()
{
	f_hideDialog();
	f_authenticate();
});

//

$('.cancel_button').each(function()
{
	$(this).click(function()
	{
		f_hideDialog();
	});
});

		
		f_showDialog('dialog_setClient');
	};
	
	//
	
	var f_cancelDrag=function()
	{
		if(!m_dragMove) return;
		
		$('.task_drop_area').hide();
		$('.task_drop_area').removeClass('task_drop_area_hover');
		$('body').css('cursor','default');
		m_dragMove=false;
		m_dragDown=false;
	};
	
	//
	
	var f_initSelects=function()
	{
		$('.select').each(function()
		{
			$(this).click(function()
			{
				var items=$(this).next('.select_items');
				
				items.css('left',$(this).position().left+'px');
				items.css('top',($(this).position().top+$(this).outerHeight()+9)+'px');
				items.slideToggle({duration: 100,queue: false});
			});
			
			f_autoSelect($(this));
			f_bindSelect($(this));
		});
	};
	
	//
	
	var f_autoSelect=function(select)
	{
		var firstItem=select.next('.select_items').find('.select_item:first');
		
		if(firstItem.length===0) return;
		
		select.html(firstItem.html());
	};
	
	//
	
	var f_bindSelect=function(select)
	{
		select.next('.select_items').find('.select_item').each(function()
		{
			$(this).click(function()
			{
				var items=$(this).parent('.select_items');
				
				items.prev('.select').html($(this).html());
				items.slideToggle({duration: 100,queue: false});
			});
		});
	};
	
	//
	
	var f_populateSelect=function(id,items)
	{
		var select=$('#'+id);
		var itemsDiv=select.next('.select_items');
		var source='';
		
		for(var i=0;i<items.length;i++)
		{
			source+='<button class="select_item"><span>';
			source+=items[i].id;
			source+='</span>';
			source+=items[i].name;
			source+='</button>';
		}
		
		itemsDiv.html(source);
		
		f_autoSelect(select);
		f_bindSelect(select);
	};
	
	//
	
	var f_populateColorChoice=function()
	{
		var el=$('#task_colorChoice');
		var ct='';
		var color=null;
		
		for(var i=0;i<Kanban.G_Colors.length;i++)
		{
			color=Kanban.G_Colors[i];
			
			ct='';
			ct+='<button class="button_color" onclick="Kanban.G_App.SelectColor('+i+',$(this));" ';
			ct+='style="background-color:rgb('+color.r+','+color.g+','+color.b+');"></button>';
			
			el.append(ct);
		}
	};
	
	//
	
	var f_selectColor=function(id,it)
	{
		if(id>=Kanban.G_Colors.length) return;
		
		m_selectedColor=Kanban.G_Colors[id];
		it.parent().find('.button_color').removeClass('color_selected');
		it.addClass('color_selected');
	};
	
	//
	
	var f_getSelectValue=function(id)
	{
		return ($('#'+id).find('span').html());
	};
	
	//
	
	var f_darkenColor=function(color)
	{
		var c=JSON.parse(JSON.stringify(color));
		
		c.r-=16;
		c.g-=16;
		c.b-=16;
		
		if(c.r<0) c.r=0;
		if(c.g<0) c.g=0;
		if(c.b<0) c.b=0;
		
		return c;
	};
	
	//
	
	var f_onResize=function()
	{
		m_appWidth=$(window).width();
		m_appHeight=$(window).height();
		
		$('#content').height(m_appHeight-66);
		
		if(m_dialogStack.length>0)
		{
			f_centerDialog(f_topDialog());
		}
	};
	
	//
	
	var f_tryConnection=function()
	{
		var address=$('#text_serverAddress').val();
		
		f_showDialog('dialog_waitingServer');
		
		m_client.Connect(address,function(status)
		{
			if(status===Kanban.STATUS_SUCCESS)
			{
				f_hideDialog();
				f_showDialog('dialog_authenticate');
				
				$('#icon_offline').hide();
				$('#icon_online').show();
			}
			else
			{
				f_showErrorDialog(status);
			}
		});
	};
	
	//
	
	var f_authenticate = function()
	{
		var username = $('#text_username').val();
		var password = $('#text_password').val();
		
		f_showDialog('dialog_waitingServer');
		
		m_client.Authenticate(username,password,function(status)
		{
			if(status===Kanban.STATUS_SUCCESS)
			{
				f_hideDialog();
			}
			else
			{
				f_hideDialog();
				f_showDialog('dialog_authenticate');
				f_showErrorDialog(status);
			}
		});
	};
	
	//
	
	var f_showDialog=function(id)
	{
		var dialog=$('#'+id);
		
		if(!dialog) return;
		
		if(m_dialogStack.length==0)
		{
			m_dialogBack.show();
		}
		else
		{
			f_topDialog().hide();
		}
		
		f_centerDialog(dialog);
		dialog.show();
		m_dialogStack.push(dialog);
	};
	
	//
	
	var f_hideDialog=function()
	{
		if(m_dialogStack.length>0)
		{
			f_topDialog().hide();
			m_dialogStack.pop();
		}
		
		if(m_dialogStack.length>0)
		{
			f_centerDialog(f_topDialog());
			f_topDialog().show();
		}
		else
		{
			m_dialogBack.hide();
		}
	};
	
	//
	
	var f_topDialog=function()
	{
		return (m_dialogStack[m_dialogStack.length-1]) || null;
	};
	
	//
	
	var f_centerDialog=function(dialog)
	{
		var x=(m_appWidth/2)-(dialog.outerWidth()/2);
		var y=(m_appHeight/2)-(dialog.outerHeight()/2);
		
		dialog.css('left',x+'px');
		dialog.css('top',y+'px');
	};
	
	//
	
	var f_showErrorDialog=function(message)
	{
		$('#div_errorMessage').html(message);
		
		f_showDialog('dialog_errorMessage');
	};
	
	//
	
	var f_showConfirmRemoveDialog=function(callback)
	{
		$('#button_confirmRemove').unbind('click');
		$('#button_confirmRemove').click(function()
		{
			f_hideDialog();
			callback();
		});
		
		f_showDialog('dialog_confirmRemove');
	};
	
	//
	
	var f_processTemplate=function(id,datas)
	{
		var template=$('#'+id).html();
		
		for(var k in datas)
		{
			template=template.replace(new RegExp('\\'+k,'g'),datas[k]);
		}
		
		return template;
	};
	
	//
	
	var f_setClient=function(type)
	{
		switch(type)
		{
			case Kanban.CLIENT_LOCAL:
			{
				m_client=new Kanban.ClientLocal();
			}
			break;
			case Kanban.CLIENT_NODE:
			{
				m_client=new Kanban.ClientNode();
			}
		}
		
		m_client.Initialize();
	};
	
	//
	
	var f_showOpenProjectDialog=function()
	{
		f_showDialog('dialog_waitingServer');
		
		m_client.GetProjects(function(status,projects)
		{
			f_hideDialog();
			
			if(status===Kanban.STATUS_SUCCESS)
			{
				if(projects.length===0)
				{
					f_showDialog('dialog_newProject');
					return;
				}
				
				f_populateSelect('select_openProject',projects);
				f_showDialog('dialog_openProject');
			}
			else
			{
				f_showErrorDialog(status);
			}
		});
	};
	
	//
	
	var f_createNewProject=function()
	{
		var name=$('#text_newProjectName').val();
		
		$('#text_newProjectName').val('');
		
		f_showDialog('dialog_waitingServer');
		
		m_client.CreateProject(name,function(status,project)
		{
			f_hideDialog();
			
			if(status===Kanban.STATUS_SUCCESS)
			{
				m_project=project;
				f_refreshProject();
			}
			else
			{
				f_showErrorDialog(status);
			}
		});
	};
	
	//
	
	var f_refreshProject=function()
	{
		$('#status_projectName').html(m_project.GetDatas().name);
		
		f_refreshColumns();
	};
	
	//
	
	var f_refreshColumns=function()
	{
		var columns=m_project.GetColumns();
		
		m_content.html('');
		
		for(var i=0;i<columns.length;i++)
		{
			m_content.append(f_processTemplate('template_column',{
				
				'$name': columns[i].GetDatas().name,
				'$limit': columns[i].GetDatas().limit,
				'$id': columns[i].GetDatas().id,
				'$tasks': columns[i].GetTasksCount()
				
			}));
			
			columns[i].SetDomElement($('.column:last').find('.column_content'));
			
			f_refreshTasks(columns[i]);
		}
		
		f_refreshContentWidth();
	};
	
	//
	
	var f_refreshTasks=function(column)
	{
		var tasks=column.GetTasks();
		var last=null;
		var taskEl=null;
		var color=null;
		var darkenedColor=null;
		
		$('.task_header_left').unbind('mousedown');
		$('.task_header_left').unbind('mouseleave');
		$('.task_drop_area').unbind('mouseenter');
		$('.task_drop_area').unbind('mouseleave');
		
		column.GetDomElement().html('<div class="task_drop_area">-1</div>');
		
		for(var i=0;i<tasks.length;i++)
		{
			column.GetDomElement().append(f_processTemplate('template_task',{
				
				'$label': tasks[i].GetDatas().label,
				'$desc': tasks[i].GetDatas().desc,
				'$id': tasks[i].GetDatas().id,
				'$added': tasks[i].GetDatas().added,
				'$moved': tasks[i].GetDatas().moved
				
			}));
			
			taskEl=column.GetDomElement().find('.task:last');
			tasks[i].SetDomElement(taskEl);
			color=tasks[i].GetDatas().color;
			
			taskEl.css('backgroundColor','rgb('+color.r+','+color.g+','+color.b+')');
			
			darkenedColor=f_darkenColor(color);
			
			taskEl.find('.task_content').css('border','1px solid rgb('+darkenedColor.r+','+darkenedColor.g+','+darkenedColor.b+')');
			taskEl.find('.task_content').css('borderTop','none');
			
			column.GetDomElement().append('<div class="task_drop_area">'+tasks[i].GetDatas().id+'</div>');
		}
		
		$('.task_header_left').mousedown(function()
		{
			m_dragDown=true;
			
			return false;
		});
		
		$('.task_header_left').mouseleave(function()
		{
			if(!m_dragDown || m_dragMove) return;
			
			m_dragMove=true;
			
			$('.task_drop_area').show();
			$('body').css('cursor','move');
			
			m_dragTask=parseInt($(this).find('.meta_hidden').html());
			m_dragEl=$(this).parent().parent();
			
			return false;
		});
		
		$('.task_drop_area').mouseenter(function()
		{
			if(m_dragMove)
			{
				$(this).addClass('task_drop_area_hover');
			}
		});
		
		$('.task_drop_area').mouseleave(function()
		{
			if(m_dragMove)
			{
				$(this).removeClass('task_drop_area_hover');
			}
		});
		
		$('.task_drop_area').mouseup(function()
		{
			if(m_dragMove)
			{
				f_cancelDrag();
				f_moveTask(parseInt($(this).html()),m_dragTask,parseInt($(this).parent().parent().find('.column_header_left').find('.meta_hidden').html()),$(this));
			}
		});
	};
	
	//
	
	var f_refreshContentWidth=function()
	{
		var size=m_content.find('.column');
		size=size.length*size.outerWidth(true);
		
		m_content.width(size);
		$('#scroll_margin').width(size+10);
	};
	
	//
	
	var f_openProject=function()
	{
		var id=f_getSelectValue('select_openProject');
		
		f_showDialog('dialog_waitingServer');
		
		m_client.OpenProject(id,function(status,project)
		{
			f_hideDialog();
			
			if(status===Kanban.STATUS_SUCCESS)
			{
				m_project=project;
				f_refreshProject();
			}
			else
			{
				f_showErrorDialog(status);
			}
		});
	};
	
	//
	
	var f_addColumn=function()
	{
		var name=$('#text_newColumnName').val();
		var limit=$('#text_columnLimit').val();
		
		$('#text_newColumnName').val('');
		$('#text_columnLimit').val('');
		
		f_showDialog('dialog_waitingServer');
		
		m_client.AddColumn(m_project,name,limit,function(status)
		{
			f_hideDialog();
			
			if(status===Kanban.STATUS_SUCCESS)
			{
				f_refreshColumns();
			}
			else
			{
				f_showErrorDialog(status);
			}
		});
	};
	
	//
	
	var f_removeColumn=function(id,it)
	{
		f_showConfirmRemoveDialog(function()
		{
			f_showDialog('dialog_waitingServer');
			
			m_client.RemoveColumn(m_project,id,function(status)
			{
				f_hideDialog();
				
				if(status===Kanban.STATUS_SUCCESS)
				{
					it.parent().parent().parent().remove();
					f_refreshContentWidth();
				}
				else
				{
					f_showErrorDialog(status);
				}
			});
		});
	};
	
	//
	
	var f_moveColumn=function(id,dir,it)
	{
		var other=null;
		
		f_showDialog('dialog_waitingServer');
		
		m_client.MoveColumn(m_project,id,dir,function(status)
		{
			f_hideDialog();
			
			if(status===Kanban.STATUS_SUCCESS)
			{
				it=it.parent().parent().parent();
				
				switch(dir)
				{
					case Kanban.SWITCH_LEFT:
					{
						it.prev('.column').before(it);
					}
					break;
					case Kanban.SWITCH_RIGHT:
					{
						it.next('.column').after(it);
					}
					break;
				}
			}
			else
			{
				//f_showErrorDialog(status);
			}
		});
	};
	
	//
	
	var f_openAddTaskDialog=function(id)
	{
		m_taskColumn=m_project.GetColumnById(id);
		
		if(m_taskColumn===null) return;
		
		f_showDialog('dialog_addTask');
	};
	
	//
	
	var f_addTask=function()
	{
		var label=$('#text_newTaskLabel').val();
		var desc=$('#text_newTaskDesc').val();
		var color=m_selectedColor;
		
		$('#text_newTaskLabel').val('');
		$('#text_newTaskDesc').val('');
		
		f_showDialog('dialog_waitingServer');
		
		m_client.AddTask(m_taskColumn,label,desc,color,function(status)
		{
			f_hideDialog();
			
			if(status===Kanban.STATUS_SUCCESS)
			{
				f_refreshTasks(m_taskColumn);
				f_refreshColumnTasksCount(m_taskColumn);
			}
			else
			{
				f_showErrorDialog(status);
			}
		});
	};
	
	//
	
	var f_removeTask=function(id,it)
	{
		var column=null;
		
		f_showConfirmRemoveDialog(function()
		{
			column=m_project.GetColumnByTaskId(id);
			
			if(column===null) return;
			
			f_showDialog('dialog_waitingServer');
			
			m_client.RemoveTask(column,id,function(status)
			{
				f_hideDialog();
				
				if(status===Kanban.STATUS_SUCCESS)
				{
					it=it.parent().parent().parent();
					it.fadeOut(Kanban.FADE_SPEED,function()
					{
						$(this).next('.task_drop_area').remove();
						$(this).remove();
						f_refreshColumnTasksCount(column);
					});
				}
				else
				{
					f_showErrorDialog(status);
				}
			});
		});
	};
	
	//
	
	var f_moveTask=function(prev,id,to,el)
	{
		var from=m_project.GetColumnByTaskId(id);
		var task=from.GetTaskById(id);
		to=m_project.GetColumnById(to);
		
		if(m_dragTask==prev) return;
		
		if(from===null || to===null) return;
		
		f_showDialog('dialog_waitingServer');
		
		m_client.MoveTask(from,to,id,prev,function(status)
		{
			f_hideDialog();
			
			if(status===Kanban.STATUS_SUCCESS)
			{
				el.after(m_dragEl.next('.task_drop_area'));
				el.after(m_dragEl);
				f_refreshColumnTasksCount(from);
				f_refreshColumnTasksCount(to);
				task.GetDomElement().find('.task_moved').html(task.GetDatas().moved);
			}
			else
			{
				f_showErrorDialog(status);
			}
		});
	};
	
	//
	
	var f_refreshColumnTasksCount=function(col)
	{
		col.GetDomElement().parent().find('.column_tasks_count').html(col.GetTasksCount());
	};
	
	//
	
	var f_editTask=function(id,el)
	{
		m_editedTask=m_project.GetColumnByTaskId(id).GetTaskById(id);
		
		$('#text_editTaskDesc').html(m_editedTask.GetDatas().desc);
		
		f_showDialog('dialog_editTask');
	};
	
	//
	
	var f_updateEditedTask=function()
	{
		var desc=$('#text_editTaskDesc').val();
		
		m_editedTask.SetDescription(desc);
		
		f_showDialog('dialog_waitingServer');
		
		m_client.SaveTaskUpdate(m_editedTask,function(status)
		{
			f_hideDialog();
			
			if(status===Kanban.STATUS_SUCCESS)
			{
				m_editedTask.GetDomElement().find('.task_desc').html(desc);
			}
			else
			{
				f_showErrorDialog(status);
			}
		});
	};
	
	//
	
	return {
		
		Initialize: f_initialize,
		RemoveColumn: f_removeColumn,
		MoveColumn: f_moveColumn,
		OpenAddTaskDialog: f_openAddTaskDialog,
		RemoveTask: f_removeTask,
		SelectColor: f_selectColor,
		EditTask: f_editTask,
		ShowErrorDialog: f_showErrorDialog
		
	};
};


$(document).ready(function()
{
	Kanban.G_App=new Kanban.Application();
	
	Kanban.G_Mode=Kanban.MODE_DESKTOP;
	Kanban.G_App.Initialize();
});
