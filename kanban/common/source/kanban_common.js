
var Kanban=Kanban || {};

//

Kanban.UNDEFINED=0;

//

Kanban.MODE_DESKTOP=1;
Kanban.MODE_MOBILE=2;

//

Kanban.CLIENT_LOCAL=1;
Kanban.CLIENT_NODE=2;

//

Kanban.STATUS_SUCCESS=1;

//

Kanban.SWITCH_LEFT=-1;
Kanban.SWITCH_RIGHT=1;

//

Kanban.FADE_SPEED=450;

//

Kanban.SERVER_PORT=24128;

//

Kanban.ERROR_SETTINGS='Failed to retrieve application settings!';
Kanban.ERROR_PROJECT_EXISTS='A project with the same name already exists!';
Kanban.ERROR_UNKNOWN_PROJECT='No project with the specified id can be found!';
Kanban.ERROR_PNAME_EMPTY='You must specify a name for the project!';
Kanban.ERROR_CNAME_EMPTY='You must specify a name for the column!';
Kanban.ERROR_TNAME_EMPTY='You must specify a name for the task!';
Kanban.ERROR_COLUMN_EDGE='';
Kanban.ERROR_COLUMN_LIMIT='You already reached this column\'s limit!';
Kanban.ERROR_SOCKET='An unknown socket error occured!';
Kanban.ERROR_AUTHENTICATE='Bad username and password combination!';
Kanban.ERROR_NOT_AUTH='You are not authenticated on the server!';
Kanban.ERROR_UNKNOWN_COLUMN='No column with the specified id can be found!';
Kanban.ERROR_UNKNOWN_TASK='No task with the specified id can be found!';
Kanban.ERROR_MOVE_COLUMN='Failed to move column!';

//

Kanban.PACKET_NOT_AUTH = 1;

Kanban.PACKET_AUTH = 10;
Kanban.PACKET_AUTH_OK = 11;
Kanban.PACKET_AUTH_FAILED = 12;

Kanban.PACKET_LIST_PROJECTS = 20;
Kanban.PACKET_LIST_PROJECTS_OK = 21;

Kanban.PACKET_GET_PROJECT = 30;
Kanban.PACKET_GET_PROJECT_OK = 31;
Kanban.PACKET_GET_PROJECT_FAILED = 32;

Kanban.PACKET_GET_COLUMN = 40;
Kanban.PACKET_GET_COLUMN_OK = 41;
Kanban.PACKET_GET_COLUMN_FAILED = 42;

Kanban.PACKET_GET_TASK = 50;
Kanban.PACKET_GET_TASK_OK = 51;
Kanban.PACKET_GET_TASK_FAILED = 52;

Kanban.PACKET_MOVE_COLUMN = 60;
Kanban.PACKET_MOVE_COLUMN_OK = 61;
Kanban.PACKET_MOVE_COLUMN_FAILED = 62;
Kanban.PACKET_MOVE_COLUMN_EDGE = 63;

Kanban.PACKET_REMOVE_COLUMN = 70;
Kanban.PACKET_REMOVE_COLUMN_OK = 71;
Kanban.PACKET_REMOVE_COLUMN_FAILED = 72;

Kanban.PACKET_REMOVE_TASK = 80;
Kanban.PACKET_REMOVE_TASK_OK = 81;
Kanban.PACKET_REMOVE_TASK_FAILED = 82;

Kanban.PACKET_ADD_TASK = 90;
Kanban.PACKET_ADD_TASK_OK = 91;
Kanban.PACKET_ADD_TASK_FAILED = 92;

Kanban.PACKET_MOVE_TASK = 100;
Kanban.PACKET_MOVE_TASK_OK = 101;
Kanban.PACKET_MOVE_TASK_FAILED = 102;
Kanban.PACKET_MOVE_TASK_LIMIT = 103;

//

Kanban.G_App=null;
Kanban.G_Mode=Kanban.UNDEFINED;

//

Kanban.G_Colors=new Array();

Kanban.G_Colors.push({'r':247,'g':191,'b':191});
Kanban.G_Colors.push({'r':244,'g':233,'b':147});
Kanban.G_Colors.push({'r':198,'g':241,'b':197});
Kanban.G_Colors.push({'r':177,'g':209,'b':228});


var Kanban=Kanban || {};

//

Kanban.ClientLocal=function()
{
	var m_storage=window.localStorage;
	
	//
	
	var f_initialize=function()
	{
		var settings=m_storage.getItem('Settings');
		
		if(settings===null)
		{
			settings={};
			settings.lastUserId=0;
			settings.lastProjectId=0;
			settings.lastColumnId=0;
			settings.lastTaskId=0;
			settings.projects=new Array();
			
			m_storage.setItem('Settings',JSON.stringify(settings));
		}
	};
	
	//
	
	var f_getSettings=function()
	{
		var settings=m_storage.getItem('Settings');
		
		if(settings===null) return null;
		
		return JSON.parse(settings);
	};
	
	//
	
	var f_getProject=function(id)
	{
		var project=m_storage.getItem('P'+id);
		
		if(project===null) return null;
		
		return JSON.parse(project);
	};
	
	//
	
	var f_getColumn=function(id)
	{
		var column=m_storage.getItem('C'+id);
		
		if(column===null) return null;
		
		return JSON.parse(column);
	};
	
	//
	
	var f_getTask=function(id)
	{
		var task=m_storage.getItem('T'+id);
		
		if(task===null) return null;
		
		return JSON.parse(task);
	};
	
	//
	
	var f_getProjects=function(callback)
	{
		var settings=null;
		var project=null;
		var projects=new Array();
		
		settings=f_getSettings();
		
		if(settings===null)
		{
			callback(Kanban.ERROR_SETTINGS,null);
			return;
		}
		
		for(var i=0;i<settings.projects.length;i++)
		{
			project=f_getProject(settings.projects[i]);
			
			if(project===null) continue;
			
			projects.push({id: project.id,name: project.name});
		}
		
		m_storage.setItem('Settings',JSON.stringify(settings));
		
		callback(Kanban.STATUS_SUCCESS,projects);
	};
	
	//
	
	var f_createProject=function(name,callback)
	{
		var settings=null;
		var project=null;
		
		settings=f_getSettings();
		
		if(settings===null)
		{
			callback(Kanban.ERROR_SETTINGS,null);
			return;
		}
		
		if(name==='')
		{
			callback(Kanban.ERROR_PNAME_EMPTY,null);
			return;
		}
		
		for(var i=0;i<settings.projects.length;i++)
		{
			project=f_getProject(settings.projects[i]);
			
			if(project===null) continue;
			
			if(project.name==name)
			{
				callback(Kanban.ERROR_PROJECT_EXISTS,null);
				return;
			}
		}
		
		settings.lastProjectId++;
		settings.projects.push(settings.lastProjectId);
		
		project=new Kanban.Project();
		project.Initialize();
		
		project.SetId(settings.lastProjectId);
		project.SetName(name);
		
		m_storage.setItem('Settings',JSON.stringify(settings));
		m_storage.setItem('P'+project.GetDatas().id,JSON.stringify(project.GetDatas()));
		
		callback(Kanban.STATUS_SUCCESS,project);
	};
	
	//
	
	var f_openProject=function(id,callback)
	{
		var datas=f_getProject(id);
		var project=new Kanban.Project();
		var column=null;
		var task=null;
		
		if(datas===null)
		{
			callback(Kanban.ERROR_UNKNOWN_PROJECT,null);
			return;
		}
		
		project.Initialize();
		project.SetDatas(datas);
		
		for(var i=0;i<project.GetDatas().columns.length;i++)
		{
			datas=f_getColumn(project.GetDatas().columns[i]);
			
			if(datas===null) continue;
			
			column=new Kanban.Column();
			column.Initialize();
			
			column.SetDatas(datas);
			
			project.GetColumns().push(column);
			
			for(var j=0;j<column.GetDatas().tasks.length;j++)
			{
				datas=f_getTask(column.GetDatas().tasks[j]);
				
				if(datas===null) continue;
				
				task=new Kanban.Task();
				task.Initialize();
				
				task.SetDatas(datas);
				
				column.GetTasks().push(task);
			}
		}
		
		callback(Kanban.STATUS_SUCCESS,project);
	};
	
	//
	
	var f_addColumn=function(project,name,limit,callback)
	{
		var settings=null;
		var column=null;
		
		settings=f_getSettings();
		
		if(settings===null)
		{
			callback(Kanban.ERROR_SETTINGS);
			return;
		}
		
		if(name==='')
		{
			callback(Kanban.ERROR_CNAME_EMPTY);
			return;
		}
		
		settings.lastColumnId++;
		project.AddColumn(settings.lastColumnId);
		
		column=new Kanban.Column();
		column.Initialize();
		
		column.SetId(settings.lastColumnId);
		column.SetName(name);
		column.SetLimit(limit);
		
		project.GetColumns().push(column);
		
		m_storage.setItem('Settings',JSON.stringify(settings));
		m_storage.setItem('P'+project.GetDatas().id,JSON.stringify(project.GetDatas()));
		m_storage.setItem('C'+column.GetDatas().id,JSON.stringify(column.GetDatas()));
		
		callback(Kanban.STATUS_SUCCESS);
	};
	
	//
	
	var f_removeColumn=function(project,id,callback)
	{
		var columns=project.GetDatas().columns;
		
		for(var i=0;i<columns.length;i++)
		{
			if(columns[i]==id)
			{
				columns.splice(i,1);
				break;
			}
		}
		
		columns=project.GetColumns();
		
		for(var i=0;i<columns.length;i++)
		{
			if(columns[i].GetDatas().id==id)
			{
				columns.splice(i,1);
				break;
			}
		}
		
		m_storage.removeItem('C'+id);
		m_storage.setItem('P'+project.GetDatas().id,JSON.stringify(project.GetDatas()));
		
		callback(Kanban.STATUS_SUCCESS);
	};
	
	//
	
	var f_moveColumn=function(project,id,dir,callback)
	{
		var columns=project.GetDatas().columns;
		
		for(var i=0;i<columns.length;i++)
		{
			if(columns[i]==id)
			{
				var ni=i+dir;
				
				if(ni>=0 && ni<columns.length)
				{
					var tmp=columns[ni];
					columns[ni]=columns[i];
					columns[i]=tmp;
				}
				else
				{
					callback(Kanban.ERROR_COLUMN_EDGE);
					return;
				}
				
				break;
			}
		}
		
		columns=project.GetColumns();
		
		for(var i=0;i<columns.length;i++)
		{
			if(columns[i].GetDatas().id==id)
			{
				var ni=i+dir;
				
				if(ni>=0 && ni<columns.length)
				{
					var tmp=columns[ni];
					columns[ni]=columns[i];
					columns[i]=tmp;
				}
				else
				{
					callback(Kanban.ERROR_COLUMN_EDGE);
					return;
				}
				
				break;
			}
		}
		
		m_storage.setItem('P'+project.GetDatas().id,JSON.stringify(project.GetDatas()));
		
		callback(Kanban.STATUS_SUCCESS);
	};
	
	//
	
	var f_addTask=function(column,label,desc,color,callback)
	{
		var settings=null;
		var task=null;
		var now=new Date();
		
		settings=f_getSettings();
		
		if(settings===null)
		{
			callback(Kanban.ERROR_SETTINGS);
			return;
		}
		
		if(label==='')
		{
			callback(Kanban.ERROR_TNAME_EMPTY);
			return;
		}
		
		if(column.GetTasksCount()==column.GetDatas().limit && column.GetDatas().limit>0)
		{
			callback(Kanban.ERROR_COLUMN_LIMIT);
			return;
		}
		
		settings.lastTaskId++;
		column.AddTask(settings.lastTaskId);
		
		task=new Kanban.Task();
		task.Initialize();
		
		task.SetId(settings.lastTaskId);
		task.SetLabel(label);
		task.SetDescription(desc);
		task.SetColor(color);
		task.SetAdded(now.toLocaleString());
		task.SetMoved('Never');
		
		column.GetTasks().push(task);
		
		m_storage.setItem('Settings',JSON.stringify(settings));
		m_storage.setItem('C'+column.GetDatas().id,JSON.stringify(column.GetDatas()));
		m_storage.setItem('T'+task.GetDatas().id,JSON.stringify(task.GetDatas()));
		
		callback(Kanban.STATUS_SUCCESS);
	};
	
	//
	
	var f_removeTask=function(column,id,callback)
	{
		var tasks=column.GetDatas().tasks;
		
		for(var i=0;i<tasks.length;i++)
		{
			if(tasks[i]==id)
			{
				tasks.splice(i,1);
				break;
			}
		}
		
		tasks=column.GetTasks();
		
		for(var i=0;i<tasks.length;i++)
		{
			if(tasks[i].GetDatas().id==id)
			{
				tasks.splice(i,1);
				break;
			}
		}
		
		m_storage.removeItem('T'+id);
		m_storage.setItem('C'+column.GetDatas().id,JSON.stringify(column.GetDatas()));
		
		callback(Kanban.STATUS_SUCCESS);
	};
	
	//
	
	var f_moveTask=function(from,to,id,prev,callback)
	{
		var tasks=from.GetDatas().tasks;
		var task=from.GetTaskById(id);
		var now=new Date();
		
		if(to.GetTasksCount()==to.GetDatas().limit && to.GetDatas().limit>0 && from!=to)
		{
			callback(Kanban.ERROR_COLUMN_LIMIT);
			return;
		}
		
		for(var i=0;i<tasks.length;i++)
		{
			if(tasks[i]==id)
			{
				tasks.splice(i,1);
				break;
			}
		}
		
		tasks=from.GetTasks();
		
		for(var i=0;i<tasks.length;i++)
		{
			if(tasks[i].GetDatas().id==id)
			{
				tasks.splice(i,1);
				break;
			}
		}
		
		tasks=to.GetDatas().tasks;
		
		if(prev===-1)
		{
			tasks.unshift(id);
		}
		else
		{
			for(var i=0;i<tasks.length;i++)
			{
				if(tasks[i]==prev)
				{
					if(i+1==tasks.length)
					{
						tasks.push(id);
					}
					else
					{
						tasks.splice(i+1,0,id);
					}
					
					break;
				}
			}
		}
		
		tasks=to.GetTasks();
		
		if(prev===-1)
		{
			tasks.unshift(task);
		}
		else
		{
			for(var i=0;i<tasks.length;i++)
			{
				if(tasks[i].GetDatas().id==prev)
				{
					if(i+1==tasks.length)
					{
						tasks.push(task);
					}
					else
					{
						tasks.splice(i+1,0,task);
					}
					
					break;
				}
			}
		}
		
		task.SetMoved(now.toLocaleString());
		
		m_storage.setItem('C'+from.GetDatas().id,JSON.stringify(from.GetDatas()));
		m_storage.setItem('C'+to.GetDatas().id,JSON.stringify(to.GetDatas()));
		m_storage.setItem('T'+task.GetDatas().id,JSON.stringify(task.GetDatas()));
		
		callback(Kanban.STATUS_SUCCESS);
	};
	
	//
	
	var f_saveTaskUpdate=function(task,callback)
	{
		m_storage.setItem('T'+task.GetDatas().id,JSON.stringify(task.GetDatas()));
		
		callback(Kanban.STATUS_SUCCESS);
	};
	
	//
	
	return {
		
		Initialize: f_initialize,
		GetProjects: f_getProjects,
		CreateProject: f_createProject,
		OpenProject: f_openProject,
		AddColumn: f_addColumn,
		RemoveColumn: f_removeColumn,
		MoveColumn: f_moveColumn,
		AddTask: f_addTask,
		RemoveTask: f_removeTask,
		MoveTask: f_moveTask,
		SaveTaskUpdate: f_saveTaskUpdate
		
	};
};


var Kanban=Kanban || {};

//

Kanban.ClientNode=function()
{
	var m_socket = null;
	
	var m_connected = false;
	
	var m_callback;
	
	var m_token = '';
	
	//
	
	var f_initialize=function()
	{
		m_callback = function(){};
	};
	
	//
	
	var f_connect = function(address,callback)
	{
		m_socket = new WebSocket('ws://'+address+':'+Kanban.SERVER_PORT);
		
		m_socket.onmessage = f_onMessage;
		
		m_socket.onopen = function()
		{
			callback(Kanban.STATUS_SUCCESS);
		};
	};
	
	//
	
	var f_onError = function()
	{
		Kanban.G_App.ShowErrorDialog(Kanban.ERROR_SOCKET);
	};
	
	//
	
	var f_authenticate = function(username,password,callback)
	{
		var npacket = {'type':Kanban.PACKET_AUTH,'username':username,'password':password};
		
		f_sendPacket(npacket,function(packet)
		{
			switch(packet.type)
			{
				case Kanban.PACKET_AUTH_OK:
				{
					m_token = packet.token;
					callback(Kanban.STATUS_SUCCESS);
				}
				break;
				case Kanban.PACKET_AUTH_FAILED:
				{
					callback(Kanban.ERROR_AUTHENTICATE);
				}
				break;
			}
		});
	};
	
	//
	
	var f_onMessage = function(event)
	{
		var packet = null;
		
		try
		{
			packet = JSON.parse(event.data);
		}
		catch(e)
		{
			return;
		}
		
		switch(packet.type)
		{
			default:
			{
				m_callback(packet);
			}
			break;
		}
	};
	
	//
	
	var f_sendPacket = function(packet,callback)
	{
		m_callback = callback;
		
		m_socket.send(JSON.stringify(packet));
	};
	
	//
	
	var f_getProjects = function(callback)
	{
		var npacket = {'type':Kanban.PACKET_LIST_PROJECTS,'token':m_token};
		
		f_sendPacket(npacket,function(packet)
		{
			switch(packet.type)
			{
				case Kanban.PACKET_LIST_PROJECTS_OK:
				{
					callback(Kanban.STATUS_SUCCESS,packet.projects);
				}
				break;
				case Kanban.PACKET_NOT_AUTH:
				{
					callback(Kanban.ERROR_NOT_AUTH,null);
				}
				break;
			}
		});
	};
	
	//
	
	var f_openProject = function(id,callback)
	{
		var npacket = {'type':Kanban.PACKET_GET_PROJECT,'token':m_token,'id':id};
		var datas = null;
		var column = null;
		var task = null;
		var project = new Kanban.Project();
		
		f_sendPacket(npacket,function(packet)
		{
			switch(packet.type)
			{
				case Kanban.PACKET_GET_PROJECT_OK:
				{
					project.Initialize();
					project.SetDatas(packet.project);
					
					for(var i=0;i<project.GetDatas().columns.length;i++)
					{
						column = new Kanban.Column();
						column.Initialize();
						
						column.SetDatas(f_getDataFromBundle(packet.columns,project.GetDatas().columns[i]));
						
						project.GetColumns().push(column);
						
						for(var j=0;j<column.GetDatas().tasks.length;j++)
						{
							task = new Kanban.Task();
							task.Initialize();
							
							task.SetDatas(f_getDataFromBundle(packet.tasks,column.GetDatas().tasks[j]));
							
							column.GetTasks().push(task);
						}
					}
					
					callback(Kanban.STATUS_SUCCESS,project);
				}
				break;
				case Kanban.PACKET_GET_PROJECT_FAIL:
				{
					callback(Kanban.ERROR_UNKNOWN_PROJECT,null);
				}
				break;
				case Kanban.PACKET_NOT_AUTH:
				{
					callback(Kanban.ERROR_NOT_AUTH,null);
				}
				break;
			}
		});
	};
	
	//
	
	var f_moveColumn = function(project,id,dir,callback)
	{
		var npacket = {'type':Kanban.PACKET_MOVE_COLUMN,'token':m_token,'pid':0,'cid':0,'dir':dir};
		var columns = null;
		
		npacket.pid = project.GetDatas().id;
		npacket.cid = id;
		
		f_sendPacket(npacket,function(packet)
		{
			switch(packet.type)
			{
				case Kanban.PACKET_MOVE_COLUMN_OK:
				{
					columns = project.GetDatas().columns;
					
					for(var i=0;i<columns.length;i++)
					{
						if(columns[i]==id)
						{
							var ni = i+dir;
							
							if(ni>=0 && ni<columns.length)
							{
								var tmp = columns[ni];
								columns[ni] = columns[i];
								columns[i] = tmp;
							}
							else
							{
								callback(Kanban.ERROR_COLUMN_EDGE);
								return;
							}
							
							break;
						}
					}
					
					columns = project.GetColumns();
					
					for(var i=0;i<columns.length;i++)
					{
						if(columns[i].GetDatas().id==id)
						{
							var ni = i+dir;
							
							if(ni>=0 && ni<columns.length)
							{
								var tmp = columns[ni];
								columns[ni] = columns[i];
								columns[i] = tmp;
							}
							else
							{
								callback(Kanban.ERROR_COLUMN_EDGE);
								return;
							}
							
							break;
						}
					}
					
					callback(Kanban.STATUS_SUCCESS);
				}
				break;
				case Kanban.PACKET_MOVE_COLUMN_FAILED:
				{
					callback(Kanban.ERROR_MOVE_COLUMN);
				}
				break;
				case Kanban.PACKET_MOVE_COLUMN_EDGE:
				{
					callback(Kanban.ERROR_COLUMN_EDGE);
				}
				break;
				case Kanban.PACKET_NOT_AUTH:
				{
					callback(Kanban.ERROR_NOT_AUTH);
				}
				break;
			}
		});
	};
	
	//
	
	var f_removeColumn = function(project,id,callback)
	{
		var npacket = {'type':Kanban.PACKET_REMOVE_COLUMN,'token':m_token,'pid':0,'cid':0};
		var columns = null;
		
		npacket.pid = project.GetDatas().id;
		npacket.cid = id;
		
		f_sendPacket(npacket,function(packet)
		{
			switch(packet.type)
			{
				case Kanban.PACKET_REMOVE_COLUMN_OK:
				{
					columns = project.GetDatas().columns;
					
					for(var i=0;i<columns.length;i++)
					{
						if(columns[i]==id)
						{
							columns.splice(i,1);
							break;
						}
					}
					
					columns = project.GetColumns();
					
					for(var i=0;i<columns.length;i++)
					{
						if(columns[i].GetDatas().id==id)
						{
							columns.splice(i,1);
							break;
						}
					}
					
					callback(Kanban.STATUS_SUCCESS);
				}
				break;
				case Kanban.PACKET_NOT_AUTH:
				{
					callback(Kanban.ERROR_NOT_AUTH);
				}
				break;
			}
		});
	};
	
	//
	
	var f_removeTask = function(column,id,callback)
	{
		var npacket = {'type':Kanban.PACKET_REMOVE_TASK,'token':m_token,'cid':0,'tid':0};
		var tasks = null;
		
		npacket.cid = column.GetDatas().id;
		npacket.tid = id;
		
		f_sendPacket(npacket,function(packet)
		{
			switch(packet.type)
			{
				case Kanban.PACKET_REMOVE_TASK_OK:
				{
					tasks = column.GetDatas().tasks;
					
					for(var i=0;i<tasks.length;i++)
					{
						if(tasks[i]==id)
						{
							tasks.splice(i,1);
							break;
						}
					}
					
					tasks = column.GetTasks();
					
					for(var i=0;i<tasks.length;i++)
					{
						if(tasks[i].GetDatas().id==id)
						{
							tasks.splice(i,1);
							break;
						}
					}
					
					callback(Kanban.STATUS_SUCCESS);
				}
				break;
				case Kanban.PACKET_NOT_AUTH:
				{
					callback(Kanban.ERROR_NOT_AUTH);
				}
				break;
			}
		});
	};
	
	//
	
	var f_addTask = function(column,label,desc,color,callback)
	{
		var npacket = {'type':Kanban.PACKET_ADD_TASK,'token':m_token,'cid':0,'lbl':'','desc':'','color':''};
		var task = null;
		
		npacket.cid = column.GetDatas().id;
		npacket.lbl = label;
		npacket.desc = desc;
		npacket.color = color;
		
		f_sendPacket(npacket,function(packet)
		{
			switch(packet.type)
			{
				case Kanban.PACKET_ADD_TASK_OK:
				{
					task = new Kanban.Task();
					task.Initialize();
					
					task.SetDatas(packet.task);
					
					column.GetTasks().push(task);
					
					callback(Kanban.STATUS_SUCCESS);
				}
				break;
				case Kanban.PACKET_NOT_AUTH:
				{
					callback(Kanban.ERROR_NOT_AUTH);
				}
				break;
			}
		});
	};
	
	//
	
	var f_moveTask = function(from,to,id,prev,callback)
	{
		var npacket = {'type':Kanban.PACKET_MOVE_TASK,'token':m_token,'from':0,'to':0,'id':0,'prev':0};
		
		f_sendPacket(npacket,function(packet)
		{
			switch(packet.type)
			{
				case Kanban.PACKET_MOVE_TASK_OK:
				{
					
				}
				break;
				case Kanban.PACKET_MOVE_TASK_LIMIT:
				{
					callback(Kanban.ERROR_COLUMN_LIMIT);
				}
				break;
				case Kanban.PACKET_NOT_AUTH:
				{
					callback(Kanban.ERROR_NOT_AUTH);
				}
				break;
			}
		});
	};
	
	//
	
	var f_getDataFromBundle = function(datas,id)
	{
		for(var i=0;i<datas.length;i++)
		{
			if(datas[i].id==id) return datas[i];
		}
		
		return {};
	};
	
	//
	
	return {
		
		Initialize: f_initialize,
		Connect: f_connect,
		Authenticate: f_authenticate,
		GetProjects: f_getProjects,
		OpenProject: f_openProject,
		MoveColumn: f_moveColumn,
		RemoveColumn: f_removeColumn,
		RemoveTask: f_removeTask,
		AddTask: f_addTask,
		MoveTask: f_moveTask
		
	};
};


var Kanban=Kanban || {};

//

Kanban.User=function()
{
	var f_initialize=function()
	{
		
	};
	
	//
	
	return {
		
		Initialize: f_initialize
		
	};
};


var Kanban=Kanban || {};

//

Kanban.Project=function()
{
	var m_datas={};
	var m_columns=new Array();
	
	//
	
	var f_initialize=function()
	{
		m_datas.id='';
		m_datas.name='';
		m_datas.columns=new Array();
	};
	
	//
	
	var f_getDatas=function()
	{
		return m_datas;
	};
	
	//
	
	var f_setDatas=function(datas)
	{
		m_datas=datas;
	};
	
	//
	
	var f_setId=function(id)
	{
		m_datas.id=id;
	};
	
	//
	
	var f_setName=function(name)
	{
		m_datas.name=name;
	};
	
	//
	
	var f_addColumn=function(id)
	{
		m_datas.columns.push(id);
	};
	
	//
	
	var f_getColumns=function()
	{
		return m_columns;
	};
	
	//
	
	var f_getColumnById=function(id)
	{
		for(var i=0;i<m_columns.length;i++)
		{
			if(m_columns[i].GetDatas().id===id)
			{
				return m_columns[i];
			}
		}
		
		return null;
	};
	
	//
	
	var f_getColumnByTaskId=function(id)
	{
		var tasks=null;
		
		for(var i=0;i<m_columns.length;i++)
		{
			tasks=m_columns[i].GetDatas().tasks;
			
			for(var j=0;j<tasks.length;j++)
			{
				if(tasks[j]==id)
				{
					return m_columns[i];
				}
			}
		}
		
		return null;
	};
	
	//
	
	return {
		
		Initialize: f_initialize,
		GetDatas: f_getDatas,
		SetDatas: f_setDatas,
		SetId: f_setId,
		SetName: f_setName,
		AddColumn: f_addColumn,
		GetColumns: f_getColumns,
		GetColumnById: f_getColumnById,
		GetColumnByTaskId: f_getColumnByTaskId
		
	};
};


var Kanban=Kanban || {};

//

Kanban.Column=function()
{
	var m_datas={};
	var m_tasks=new Array();
	var m_el=null;
	
	//
	
	var f_initialize=function()
	{
		m_datas.id='';
		m_datas.name='';
		m_datas.limit=0;
		m_datas.tasks=new Array();
	};
	
	//
	
	var f_getDatas=function()
	{
		return m_datas;
	};
	
	//
	
	var f_setDatas=function(datas)
	{
		m_datas=datas;
	};
	
	//
	
	var f_setId=function(id)
	{
		m_datas.id=id;
	};
	
	//
	
	var f_setName=function(name)
	{
		m_datas.name=name;
	};
	
	//
	
	var f_setLimit=function(limit)
	{
		m_datas.limit=(limit>0) ? limit : 0;
	};
	
	//
	
	var f_addTask=function(id)
	{
		m_datas.tasks.push(id);
	};
	
	//
	
	var f_getTasks=function()
	{
		return m_tasks;
	};
	
	//
	
	var f_setDomElement=function(el)
	{
		m_el=el;
	};
	
	//
	
	var f_getDomElement=function()
	{
		return m_el;
	};
	
	//
	
	var f_getTaskById=function(id)
	{
		for(var i=0;i<m_tasks.length;i++)
		{
			if(m_tasks[i].GetDatas().id==id)
			{
				return m_tasks[i];
			}
		}
		
		return null;
	};
	
	//
	
	var f_getTasksCount=function()
	{
		return m_tasks.length;
	};
	
	//
	
	return {
		
		Initialize: f_initialize,
		GetDatas: f_getDatas,
		SetDatas: f_setDatas,
		SetId: f_setId,
		SetName: f_setName,
		SetLimit: f_setLimit,
		AddTask: f_addTask,
		GetTasks: f_getTasks,
		SetDomElement: f_setDomElement,
		GetDomElement: f_getDomElement,
		GetTaskById: f_getTaskById,
		GetTasksCount: f_getTasksCount
		
	};
};


var Kanban=Kanban || {};

//

Kanban.Task=function()
{
	var m_datas={};
	var m_el=null;
	
	//
	
	var f_initialize=function()
	{
		m_datas.id=0;
		m_datas.label='';
		m_datas.desc='';
		m_datas.color=Kanban.G_Colors[0];
		m_datas.added='';
		m_datas.moved='';
	};
	
	//
	
	var f_getDatas=function()
	{
		return m_datas;
	};
	
	//
	
	var f_setDatas=function(datas)
	{
		m_datas=datas;
	};
	
	//
	
	var f_setId=function(id)
	{
		m_datas.id=id;
	};
	
	//
	
	var f_setLabel=function(label)
	{
		m_datas.label=label;
	};
	
	//
	
	var f_setDescription=function(desc)
	{
		m_datas.desc=desc;
	};
	
	//
	
	var f_setColor=function(color)
	{
		m_datas.color=color;
	};
	
	//
	
	var f_setAdded=function(added)
	{
		m_datas.added=added;
	};
	
	//
	
	var f_setMoved=function(moved)
	{
		m_datas.moved=moved;
	};
	
	//
	
	var f_setDomElement=function(el)
	{
		m_el=el;
	};
	
	//
	
	var f_getDomElement=function()
	{
		return m_el;
	};
	
	//
	
	return {
		
		Initialize: f_initialize,
		GetDatas: f_getDatas,
		SetDatas: f_setDatas,
		SetId: f_setId,
		SetLabel: f_setLabel,
		SetDescription: f_setDescription,
		SetColor: f_setColor,
		SetAdded: f_setAdded,
		SetMoved: f_setMoved,
		SetDomElement: f_setDomElement,
		GetDomElement: f_getDomElement
		
	};
};
