import json
from django.test import TestCase, Client
from django.urls import reverse
from .models import Task

class TaskAPITestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.task1 = Task.objects.create(
            title="Task One",
            description="First description",
            status="todo",
            priority="high"
        )
        self.task2 = Task.objects.create(
            title="Task Two",
            description="Second description",
            status="in_progress",
            priority="medium"
        )

    def test_list_tasks(self):
        response = self.client.get('/api/tasks/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['title'], "Task Two") # ordering by -created_at

    def test_filter_tasks_by_status(self):
        response = self.client.get('/api/tasks/?status=in_progress')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], "Task Two")

    def test_create_task(self):
        payload = {
            'title': 'New Task',
            'description': 'New desc',
            'status': 'todo',
            'priority': 'low'
        }
        response = self.client.post(
            '/api/tasks/',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content)
        self.assertEqual(data['title'], 'New Task')
        self.assertEqual(Task.objects.count(), 3)

    def test_create_task_missing_title(self):
        payload = {
            'description': 'No title'
        }
        response = self.client.post(
            '/api/tasks/',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_update_task(self):
        payload = {
            'status': 'done',
            'priority': 'low'
        }
        response = self.client.put(
            f'/api/tasks/{self.task1.id}/',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.task1.refresh_from_db()
        self.assertEqual(self.task1.status, 'done')
        self.assertEqual(self.task1.priority, 'low')

    def test_delete_task(self):
        response = self.client.delete(f'/api/tasks/{self.task1.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Task.objects.count(), 1)

    def test_get_stats(self):
        response = self.client.get('/api/stats/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['total'], 2)
        self.assertEqual(data['by_status']['todo'], 1)
        self.assertEqual(data['by_status']['in_progress'], 1)
        self.assertEqual(data['by_priority']['high'], 1)
        self.assertEqual(data['by_priority']['medium'], 1)
