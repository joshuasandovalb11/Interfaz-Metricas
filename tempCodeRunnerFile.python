class BaseTask:
    def __init__(self, name):
        self.name = name
        self.prerequisites = []

class AdvancedTask(BaseTask):
    def __init__(self, name, difficulty):
        super().__init__(name)
        self.difficulty = difficulty


class TaskManager:
    def __init__(self, tasks):
        """
        tasks: List of BaseTask or AdvancedTask objects
        """
        self.tasks = tasks
        self.in_degree = {}
        self.adjacency = {}
        self.build_graph()

    def build_graph(self):
        for t in self.tasks:
            self.adjacency[t.name] = []
            self.in_degree[t.name] = 0

        for t in self.tasks:
            for prereq in t.prerequisites:
                self.adjacency[prereq.name].append(t.name)
                self.in_degree[t.name] += 1

    def find_task_order(self):
        from collections import deque

        # Queue for tasks with no prerequisites
        queue = deque([name for name in self.in_degree if self.in_degree[name] == 0])
        order = []

        while queue:
            current = queue.popleft()
            order.append(current)
            
            for neighbor in self.adjacency[current]:
                self.in_degree[neighbor] -= 1
                if self.in_degree[neighbor] == 0:
                    queue.append(neighbor)

        if len(order) == len(self.tasks):
            return order
        else:
            return []