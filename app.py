from flask import Flask, render_template, request, jsonify
import requests
import os
import json
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 设置Flask应用的字符编码
app.config['JSON_AS_ASCII'] = False
app.config['JSONIFY_MIMETYPE'] = 'application/json; charset=utf-8'

# OpenRouter AI API配置
AI_API_KEY = "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"
AI_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# 数据存储路径
DATA_DIR = 'data'
NOTEBOOKS_FILE = os.path.join(DATA_DIR, 'notebooks.json')
TODOS_FILE = os.path.join(DATA_DIR, 'todos.json')
PROJECTS_FILE = os.path.join(DATA_DIR, 'projects.json')  # 新增项目数据文件

# 确保数据目录存在
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

def load_json_file(filepath, default_data=None):
    """加载JSON文件"""
    if default_data is None:
        default_data = {}
    
    try:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            return default_data
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return default_data

def save_json_file(filepath, data):
    """保存JSON文件"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error saving {filepath}: {e}")
        return False

@app.route('/')
def index():
    return render_template('index.html')

# 笔记本相关API
@app.route('/api/notebooks', methods=['GET'])
def get_notebooks():
    """获取所有笔记本"""
    notebooks = load_json_file(NOTEBOOKS_FILE, [])
    return jsonify({"notebooks": notebooks})

@app.route('/api/notebooks', methods=['POST'])
def create_notebook():
    """创建新笔记本"""
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        
        if not name:
            return jsonify({"error": "笔记本名称不能为空"}), 400
        
        notebooks = load_json_file(NOTEBOOKS_FILE, [])
        
        # 检查名称是否重复
        if any(nb['name'] == name for nb in notebooks):
            return jsonify({"error": "笔记本名称已存在"}), 400
        
        new_notebook = {
            "id": int(datetime.now().timestamp() * 1000),
            "name": name,
            "content": "",
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        notebooks.append(new_notebook)
        
        if save_json_file(NOTEBOOKS_FILE, notebooks):
            return jsonify({"notebook": new_notebook})
        else:
            return jsonify({"error": "保存失败"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/notebooks/<int:notebook_id>', methods=['PUT'])
def update_notebook(notebook_id):
    """更新笔记本"""
    try:
        data = request.get_json()
        notebooks = load_json_file(NOTEBOOKS_FILE, [])
        
        notebook = next((nb for nb in notebooks if nb['id'] == notebook_id), None)
        if not notebook:
            return jsonify({"error": "笔记本不存在"}), 404
        
        # 更新字段
        if 'name' in data:
            name = data['name'].strip()
            if not name:
                return jsonify({"error": "笔记本名称不能为空"}), 400
            
            # 检查名称是否与其他笔记本重复
            if any(nb['name'] == name and nb['id'] != notebook_id for nb in notebooks):
                return jsonify({"error": "笔记本名称已存在"}), 400
            
            notebook['name'] = name
        
        if 'content' in data:
            notebook['content'] = data['content']
        
        notebook['updatedAt'] = datetime.now().isoformat()
        
        if save_json_file(NOTEBOOKS_FILE, notebooks):
            return jsonify({"notebook": notebook})
        else:
            return jsonify({"error": "保存失败"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/notebooks/<int:notebook_id>', methods=['DELETE'])
def delete_notebook(notebook_id):
    """删除笔记本"""
    try:
        notebooks = load_json_file(NOTEBOOKS_FILE, [])
        
        if len(notebooks) <= 1:
            return jsonify({"error": "至少需要保留一个笔记本"}), 400
        
        notebooks = [nb for nb in notebooks if nb['id'] != notebook_id]
        
        if save_json_file(NOTEBOOKS_FILE, notebooks):
            # 同时删除该笔记本的所有待办事项
            todos_by_notebook = load_json_file(TODOS_FILE, {})
            if str(notebook_id) in todos_by_notebook:
                del todos_by_notebook[str(notebook_id)]
                save_json_file(TODOS_FILE, todos_by_notebook)
            
            return jsonify({"success": True})
        else:
            return jsonify({"error": "删除失败"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 待办事项相关API
@app.route('/api/notebooks/<int:notebook_id>/todos', methods=['GET'])
def get_todos(notebook_id):
    """获取指定笔记本的待办事项"""
    todos_by_notebook = load_json_file(TODOS_FILE, {})
    todos = todos_by_notebook.get(str(notebook_id), [])
    return jsonify({"todos": todos})

@app.route('/api/notebooks/<int:notebook_id>/todos', methods=['POST'])
def create_todo(notebook_id):
    """创建新的待办事项"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        deadline = data.get('deadline')
        
        if not text:
            return jsonify({"error": "待办事项内容不能为空"}), 400
        
        todos_by_notebook = load_json_file(TODOS_FILE, {})
        notebook_todos = todos_by_notebook.get(str(notebook_id), [])
        
        new_todo = {
            "id": int(datetime.now().timestamp() * 1000),
            "text": text,
            "completed": False,
            "deadline": deadline,
            "createdAt": datetime.now().isoformat()
        }
        
        notebook_todos.append(new_todo)
        todos_by_notebook[str(notebook_id)] = notebook_todos
        
        if save_json_file(TODOS_FILE, todos_by_notebook):
            return jsonify({"todo": new_todo})
        else:
            return jsonify({"error": "保存失败"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/notebooks/<int:notebook_id>/todos/<int:todo_id>', methods=['PUT'])
def update_todo(notebook_id, todo_id):
    """更新待办事项"""
    try:
        data = request.get_json()
        todos_by_notebook = load_json_file(TODOS_FILE, {})
        notebook_todos = todos_by_notebook.get(str(notebook_id), [])
        
        todo = next((t for t in notebook_todos if t['id'] == todo_id), None)
        if not todo:
            return jsonify({"error": "待办事项不存在"}), 404
        
        # 更新字段
        if 'text' in data:
            todo['text'] = data['text'].strip()
        if 'completed' in data:
            todo['completed'] = data['completed']
        if 'deadline' in data:
            todo['deadline'] = data['deadline']
        
        todos_by_notebook[str(notebook_id)] = notebook_todos
        
        if save_json_file(TODOS_FILE, todos_by_notebook):
            return jsonify({"todo": todo})
        else:
            return jsonify({"error": "保存失败"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/notebooks/<int:notebook_id>/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(notebook_id, todo_id):
    """删除待办事项"""
    try:
        todos_by_notebook = load_json_file(TODOS_FILE, {})
        notebook_todos = todos_by_notebook.get(str(notebook_id), [])
        
        notebook_todos = [t for t in notebook_todos if t['id'] != todo_id]
        todos_by_notebook[str(notebook_id)] = notebook_todos
        
        if save_json_file(TODOS_FILE, todos_by_notebook):
            return jsonify({"success": True})
        else:
            return jsonify({"error": "删除失败"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# AI对话API
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        messages = data.get('messages', [])
        model = data.get('model', 'anthropic/claude-3.5-sonnet')
        
        # 如果没有提供消息历史，使用单条消息
        if not messages:
            user_message = data.get('message', '')
            if user_message:
                messages = [{
                    "role": "user",
                    "content": user_message
                }]
        
        headers = {
            'Authorization': f'Bearer {AI_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "model": model,
            "messages": messages
        }
        
        response = requests.post(AI_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        result = response.json()
        reply = result['choices'][0]['message']['content']
        
        return jsonify({"response": reply})
    
    except Exception as e:
        return jsonify({"response": f"抱歉，AI服务暂时不可用: {str(e)}"}), 500

# 生成话题标题API
@app.route('/api/generate-title', methods=['POST'])
def generate_title():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        headers = {
            'Authorization': f'Bearer {AI_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "model": "anthropic/claude-3.5-sonnet",
            "messages": [
                {
                    "role": "user",
                    "content": f"请根据用户的这句话，为我们的对话生成一个5个字以内的短标题，直接返回标题文本，不要加任何解释或标点符号：\n\n{user_message}"
                }
            ]
        }
        
        response = requests.post(AI_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        result = response.json()
        title = result['choices'][0]['message']['content'].strip()
        
        # 确保标题不超过5个字
        if len(title) > 5:
            title = title[:5]
        
        return jsonify({"title": title})
    
    except Exception as e:
        return jsonify({"title": "新对话", "error": str(e)}), 500

# 数据同步API
@app.route('/api/sync', methods=['POST'])
def sync_data():
    """同步客户端数据到服务器"""
    try:
        data = request.get_json()
        
        # 同步笔记本数据
        if 'notebooks' in data:
            save_json_file(NOTEBOOKS_FILE, data['notebooks'])
        
        # 同步待办事项数据
        if 'todos' in data:
            save_json_file(TODOS_FILE, data['todos'])
        
        return jsonify({"success": True})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sync', methods=['GET'])
def get_sync_data():
    """获取服务器端的所有数据"""
    try:
        notebooks = load_json_file(NOTEBOOKS_FILE, [])
        todos = load_json_file(TODOS_FILE, {})
        
        return jsonify({
            "notebooks": notebooks,
            "todos": todos
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 项目管理相关API
@app.route('/api/projects', methods=['GET'])
def get_projects():
    """获取所有项目"""
    projects = load_json_file(PROJECTS_FILE, [])
    return jsonify({"projects": projects})

@app.route('/api/projects', methods=['POST'])
def create_project():
    """创建新项目"""
    try:
        data = request.get_json()
        title = data.get('title', '').strip()
        status = data.get('status', 'pending')  # pending, in_progress, completed
        
        if not title:
            return jsonify({"error": "项目标题不能为空"}), 400
        
        projects = load_json_file(PROJECTS_FILE, [])
        
        # 检查标题是否重复
        if any(p['title'] == title for p in projects):
            return jsonify({"error": "项目标题已存在"}), 400
        
        new_project = {
            "id": int(datetime.now().timestamp() * 1000),
            "title": title,
            "status": status,
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat(),
            "linkedNotes": [],  # 关联的笔记ID列表
            "linkedTodos": []   # 关联的任务ID列表
        }
        
        projects.append(new_project)
        
        if save_json_file(PROJECTS_FILE, projects):
            return jsonify({"project": new_project})
        else:
            return jsonify({"error": "保存失败"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """获取单个项目详情"""
    try:
        projects = load_json_file(PROJECTS_FILE, [])
        project = next((p for p in projects if p['id'] == project_id), None)
        
        if not project:
            return jsonify({"error": "项目不存在"}), 404
        
        # 获取关联的笔记和任务详情
        notebooks = load_json_file(NOTEBOOKS_FILE, [])
        todos_by_notebook = load_json_file(TODOS_FILE, {})
        
        linked_notes = []
        for note_id in project.get('linkedNotes', []):
            note = next((nb for nb in notebooks if nb['id'] == note_id), None)
            if note:
                linked_notes.append({
                    "id": note['id'],
                    "title": note['name'],
                    "content": note['content'][:100] + '...' if len(note['content']) > 100 else note['content']
                })
        
        linked_todos = []
        for todo_info in project.get('linkedTodos', []):
            notebook_id = str(todo_info['notebookId'])
            todo_id = todo_info['todoId']
            if notebook_id in todos_by_notebook:
                todo = next((t for t in todos_by_notebook[notebook_id] if t['id'] == todo_id), None)
                if todo:
                    linked_todos.append({
                        "id": todo['id'],
                        "notebookId": int(notebook_id),
                        "text": todo['text'],
                        "completed": todo['completed'],
                        "deadline": todo.get('deadline')
                    })
        
        project_detail = project.copy()
        project_detail['linkedNotesDetail'] = linked_notes
        project_detail['linkedTodosDetail'] = linked_todos
        
        return jsonify({"project": project_detail})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """更新项目"""
    try:
        data = request.get_json()
        projects = load_json_file(PROJECTS_FILE, [])
        
        project = next((p for p in projects if p['id'] == project_id), None)
        if not project:
            return jsonify({"error": "项目不存在"}), 404
        
        # 更新字段
        if 'title' in data:
            title = data['title'].strip()
            if not title:
                return jsonify({"error": "项目标题不能为空"}), 400
            
            # 检查标题是否与其他项目重复
            if any(p['title'] == title and p['id'] != project_id for p in projects):
                return jsonify({"error": "项目标题已存在"}), 400
            
            project['title'] = title
        
        if 'status' in data:
            if data['status'] in ['pending', 'in_progress', 'completed']:
                project['status'] = data['status']
            else:
                return jsonify({"error": "无效的项目状态"}), 400
        
        project['updatedAt'] = datetime.now().isoformat()
        
        if save_json_file(PROJECTS_FILE, projects):
            return jsonify({"project": project})
        else:
            return jsonify({"error": "保存失败"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """删除项目（仅解除关联，不删除笔记和任务）"""
    try:
        projects = load_json_file(PROJECTS_FILE, [])
        projects = [p for p in projects if p['id'] != project_id]
        
        if save_json_file(PROJECTS_FILE, projects):
            return jsonify({"success": True})
        else:
            return jsonify({"error": "删除失败"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<int:project_id>/link-note', methods=['POST'])
def link_note_to_project(project_id):
    """将笔记关联到项目"""
    try:
        data = request.get_json()
        note_id = data.get('noteId')
        
        if not note_id:
            return jsonify({"error": "笔记ID不能为空"}), 400
        
        projects = load_json_file(PROJECTS_FILE, [])
        project = next((p for p in projects if p['id'] == project_id), None)
        
        if not project:
            return jsonify({"error": "项目不存在"}), 404
        
        # 检查笔记是否存在
        notebooks = load_json_file(NOTEBOOKS_FILE, [])
        if not any(nb['id'] == note_id for nb in notebooks):
            return jsonify({"error": "笔记不存在"}), 404
        
        # 添加关联（避免重复）
        if 'linkedNotes' not in project:
            project['linkedNotes'] = []
        
        if note_id not in project['linkedNotes']:
            project['linkedNotes'].append(note_id)
            project['updatedAt'] = datetime.now().isoformat()
            
            if save_json_file(PROJECTS_FILE, projects):
                return jsonify({"success": True})
            else:
                return jsonify({"error": "保存失败"}), 500
        else:
            return jsonify({"message": "笔记已关联到该项目"})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<int:project_id>/link-todo', methods=['POST'])
def link_todo_to_project(project_id):
    """将任务关联到项目"""
    try:
        data = request.get_json()
        notebook_id = data.get('notebookId')
        todo_id = data.get('todoId')
        
        if not notebook_id or not todo_id:
            return jsonify({"error": "笔记本ID和任务ID不能为空"}), 400
        
        projects = load_json_file(PROJECTS_FILE, [])
        project = next((p for p in projects if p['id'] == project_id), None)
        
        if not project:
            return jsonify({"error": "项目不存在"}), 404
        
        # 检查任务是否存在
        todos_by_notebook = load_json_file(TODOS_FILE, {})
        notebook_key = str(notebook_id)
        if notebook_key not in todos_by_notebook or not any(t['id'] == todo_id for t in todos_by_notebook[notebook_key]):
            return jsonify({"error": "任务不存在"}), 404
        
        # 添加关联（避免重复）
        if 'linkedTodos' not in project:
            project['linkedTodos'] = []
        
        todo_link = {"notebookId": notebook_id, "todoId": todo_id}
        if not any(t['notebookId'] == notebook_id and t['todoId'] == todo_id for t in project['linkedTodos']):
            project['linkedTodos'].append(todo_link)
            project['updatedAt'] = datetime.now().isoformat()
            
            if save_json_file(PROJECTS_FILE, projects):
                return jsonify({"success": True})
            else:
                return jsonify({"error": "保存失败"}), 500
        else:
            return jsonify({"message": "任务已关联到该项目"})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<int:project_id>/unlink-note', methods=['DELETE'])
def unlink_note_from_project(project_id):
    """取消笔记与项目的关联"""
    try:
        data = request.get_json()
        note_id = data.get('noteId')
        
        if not note_id:
            return jsonify({"error": "笔记ID不能为空"}), 400
        
        projects = load_json_file(PROJECTS_FILE, [])
        project = next((p for p in projects if p['id'] == project_id), None)
        
        if not project:
            return jsonify({"error": "项目不存在"}), 404
        
        # 移除关联
        if 'linkedNotes' in project and note_id in project['linkedNotes']:
            project['linkedNotes'].remove(note_id)
            project['updatedAt'] = datetime.now().isoformat()
            
            if save_json_file(PROJECTS_FILE, projects):
                return jsonify({"success": True})
            else:
                return jsonify({"error": "保存失败"}), 500
        else:
            return jsonify({"message": "笔记未关联到该项目"})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<int:project_id>/unlink-todo', methods=['DELETE'])
def unlink_todo_from_project(project_id):
    """取消任务与项目的关联"""
    try:
        data = request.get_json()
        notebook_id = data.get('notebookId')
        todo_id = data.get('todoId')
        
        if not notebook_id or not todo_id:
            return jsonify({"error": "笔记本ID和任务ID不能为空"}), 400
        
        projects = load_json_file(PROJECTS_FILE, [])
        project = next((p for p in projects if p['id'] == project_id), None)
        
        if not project:
            return jsonify({"error": "项目不存在"}), 404
        
        # 移除关联
        if 'linkedTodos' in project:
            original_length = len(project['linkedTodos'])
            project['linkedTodos'] = [
                t for t in project['linkedTodos'] 
                if not (t['notebookId'] == notebook_id and t['todoId'] == todo_id)
            ]
            
            if len(project['linkedTodos']) < original_length:
                project['updatedAt'] = datetime.now().isoformat()
                
                if save_json_file(PROJECTS_FILE, projects):
                    return jsonify({"success": True})
                else:
                    return jsonify({"error": "保存失败"}), 500
            else:
                return jsonify({"message": "任务未关联到该项目"})
        else:
            return jsonify({"message": "任务未关联到该项目"})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/api/ai/assist', methods=['POST'])
def ai_assist():
    """AI助手接口 - 使用OpenRouter调用google/gemini-2.5-pro-preview"""
    try:
        data = request.get_json()
        user_input = data.get('message', '')
        context = data.get('context', {})
        
        # 确保输入字符串是UTF-8编码
        if isinstance(user_input, str):
            user_input = user_input.encode('utf-8').decode('utf-8')
        
        if not user_input:
            return jsonify({
                'success': False,
                'error': '请输入消息内容'
            }), 400
        
        # 构建上下文感知的提示词
        system_prompt = f"""
你是一个智能工作台助手，专门帮助用户管理项目、笔记和待办事项。

当前工作台状态：
- 当前视图: {context.get('currentView', '未知')}
- 活跃项目数: {len(context.get('projects', []))}
- 待办事项数: {len(context.get('todos', []))}
- 笔记数量: {len(context.get('notebooks', []))}

请根据用户的自然语言指令，生成相应的操作建议。如果用户要求创建内容，请提供具体的JSON格式数据。

用户指令: {user_input}

请以JSON格式回复，包含以下字段：
- action: 建议的操作类型 (create_project, create_note, create_todo, search, info等)
- data: 如果是创建操作，提供具体的数据结构
- message: 给用户的友好回复
- suggestions: 相关建议（可选）

示例回复格式：
{{
  "action": "create_project",
  "data": {{
    "title": "项目名称",
    "description": "项目描述",
    "status": "active"
  }},
  "message": "我帮你创建了一个新项目",
  "suggestions": ["可以添加一些待办事项", "设置项目里程碑"]
}}
"""
        
        # 确保系统提示词也是UTF-8编码
        system_prompt = system_prompt.encode('utf-8').decode('utf-8')
        
        # 使用OpenRouter API调用Gemini 2.5 Pro Preview
        headers = {
            "Authorization": f"Bearer {AI_API_KEY}",
            "Content-Type": "application/json; charset=utf-8",
            "HTTP-Referer": "http://localhost:8080",
            "X-Title": "智能工作台AI助手"
        }
        
        payload = {
            "model": "google/gemini-2.0-flash-exp",
            "messages": [
                {
                    "role": "user",
                    "content": system_prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        # 确保payload中的内容都是UTF-8编码
        payload_json = json.dumps(payload, ensure_ascii=False)
        
        response = requests.post(
            AI_API_URL, 
            headers=headers, 
            data=payload_json.encode('utf-8'), 
            timeout=30
        )
        
        if response.status_code != 200:
            return jsonify({
                'success': False,
                'error': f'API调用失败: {response.status_code} - {response.text}'
            }), 500
        
        # 确保响应内容正确解码
        response.encoding = 'utf-8'
        response_data = response.json()
        ai_response = response_data['choices'][0]['message']['content']
        
        # 确保AI响应是UTF-8编码
        if isinstance(ai_response, str):
            ai_response = ai_response.encode('utf-8').decode('utf-8')
        
        # 尝试解析AI返回的JSON
        try:
            # 清理可能的markdown代码块标记
            clean_response = ai_response.strip()
            if clean_response.startswith('```json'):
                clean_response = clean_response[7:]
            if clean_response.endswith('```'):
                clean_response = clean_response[:-3]
            clean_response = clean_response.strip()
            
            ai_data = json.loads(clean_response)
        except json.JSONDecodeError as e:
            print(f"JSON解析错误: {e}, 原始响应: {ai_response}")
            # 如果不是JSON格式，包装成标准格式
            ai_data = {
                'action': 'info',
                'message': ai_response,
                'data': None
            }
        
        return jsonify({
            'success': True,
            'response': ai_data,
            'timestamp': datetime.now().isoformat(),
            'model_used': 'google/gemini-2.0-flash-exp'
        })
        
    except UnicodeEncodeError as e:
        print(f"编码错误: {e}")
        return jsonify({
            'success': False,
            'error': '输入内容包含无法处理的字符，请检查输入格式'
        }), 400
    except requests.exceptions.Timeout:
        return jsonify({
            'success': False,
            'error': 'AI服务响应超时，请稍后重试'
        }), 504
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'网络请求错误: {str(e)}'
        }), 500
    except Exception as e:
        print(f"AI助手错误: {e}")
        return jsonify({
            'success': False,
            'error': f'AI助手服务暂时不可用: {str(e)}'
        }), 500

@app.route('/api/ai/context', methods=['GET'])
def get_ai_context():
    """获取当前工作台上下文信息"""
    try:
        # 加载所有数据
        projects = load_json_file(PROJECTS_FILE, [])
        notebooks = load_json_file(NOTEBOOKS_FILE, {})
        todos_data = load_json_file(TODOS_FILE, {})
        
        # 统计信息
        context = {
            'projects': projects,
            'notebooks': list(notebooks.values()) if notebooks else [],
            'todos': [todo for notebook_todos in todos_data.values() for todo in notebook_todos] if todos_data else [],
            'stats': {
                'total_projects': len(projects),
                'total_notebooks': len(notebooks) if notebooks else 0,
                'total_todos': sum(len(todos) for todos in todos_data.values()) if todos_data else 0,
                'active_todos': sum(1 for notebook_todos in todos_data.values() for todo in notebook_todos if not todo.get('completed', False)) if todos_data else 0
            }
        }
        
        return jsonify({
            'success': True,
            'context': context
        })
        
    except Exception as e:
        print(f"获取上下文错误: {e}")
        return jsonify({
            'success': False,
            'error': '无法获取工作台上下文'
        }), 500


if __name__ == '__main__':
    import sys
    # 确保标准输出使用UTF-8编码
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')
    
    app.run(debug=True, host='0.0.0.0', port=8080)  # 使用8080端口代替默认的5000端口