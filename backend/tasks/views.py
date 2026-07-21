import json
from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.db.models import Count
from .models import Task

def task_to_dict(task):
    return {
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'priority': task.priority,
        'due_date': task.due_date.isoformat() if hasattr(task.due_date, 'isoformat') else task.due_date,
        'created_at': task.created_at.isoformat() if hasattr(task.created_at, 'isoformat') else task.created_at,
        'updated_at': task.updated_at.isoformat() if hasattr(task.updated_at, 'isoformat') else task.updated_at,
    }

@csrf_exempt
def task_list_create(request):
    if request.method == 'GET':
        status_filter = request.GET.get('status')
        priority_filter = request.GET.get('priority')
        
        tasks = Task.objects.all()
        if status_filter:
            tasks = tasks.filter(status=status_filter)
        if priority_filter:
            tasks = tasks.filter(priority=priority_filter)
            
        data = [task_to_dict(t) for t in tasks]
        return JsonResponse(data, safe=False)
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON body'}, status=400)
            
        title = data.get('title')
        if not title:
            return JsonResponse({'error': 'Title is required'}, status=400)
            
        task = Task.objects.create(
            title=title,
            description=data.get('description', ''),
            status=data.get('status', 'todo'),
            priority=data.get('priority', 'medium'),
            due_date=data.get('due_date') or None
        )
        return JsonResponse(task_to_dict(task), status=201)
        
    return HttpResponseNotAllowed(['GET', 'POST'])

@csrf_exempt
def task_detail_update_delete(request, pk):
    task = get_object_or_404(Task, pk=pk)
    
    if request.method == 'GET':
        return JsonResponse(task_to_dict(task))
        
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON body'}, status=400)
            
        if 'title' in data:
            if not data['title']:
                return JsonResponse({'error': 'Title cannot be empty'}, status=400)
            task.title = data['title']
            
        if 'description' in data:
            task.description = data['description']
            
        if 'status' in data:
            task.status = data['status']
            
        if 'priority' in data:
            task.priority = data['priority']
            
        if 'due_date' in data:
            task.due_date = data['due_date'] or None
            
        task.save()
        return JsonResponse(task_to_dict(task))
        
    elif request.method == 'DELETE':
        task.delete()
        return JsonResponse({'message': 'Task deleted successfully'}, status=200)
        
    return HttpResponseNotAllowed(['GET', 'PUT', 'DELETE'])

def task_stats(request):
    if request.method != 'GET':
        return HttpResponseNotAllowed(['GET'])
        
    total_tasks = Task.objects.count()
    
    # Group by status
    status_counts = Task.objects.values('status').annotate(count=Count('status'))
    status_dict = {'todo': 0, 'in_progress': 0, 'done': 0}
    for item in status_counts:
        status_dict[item['status']] = item['count']
        
    # Group by priority
    priority_counts = Task.objects.values('priority').annotate(count=Count('priority'))
    priority_dict = {'low': 0, 'medium': 0, 'high': 0}
    for item in priority_counts:
        priority_dict[item['priority']] = item['count']
        
    data = {
        'total': total_tasks,
        'by_status': status_dict,
        'by_priority': priority_dict,
    }
    return JsonResponse(data)
