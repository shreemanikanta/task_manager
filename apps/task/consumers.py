import json
from channels.generic.websocket import AsyncWebsocketConsumer

class TaskStatusConsumer(AsyncWebsocketConsumer):
    """
    TaskStatusConsumer is an asynchronous WebSocket consumer that manages real-time task status updates for a specific user.

    Methods:
        async connect():
            Handles the WebSocket connection event. Retrieves the user ID from the URL route and adds the user to a group
            for task updates. Accepts the WebSocket connection if the user ID is valid; otherwise, closes the connection.

        async disconnect(close_code):
            Handles the WebSocket disconnection event. Removes the user from the task update group based on the user ID.

        async send_task_update(event):
            Sends a task update message to the WebSocket client. The message includes the task UUID and its status,
            serialized as JSON.
    """
    async def connect(self):
        user_id = self.scope['url_route']['kwargs']['user_id']
        if user_id:
            self.group_name = f"tasks_user_{user_id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        user_id = self.scope['url_route']['kwargs']['user_id']
        await self.channel_layer.group_discard(
            f"tasks_user_{user_id}",
            self.channel_name
        )

    async def send_task_update(self, event):
        await self.send(text_data=json.dumps({
            "uuid": event["uuid"],
            "status": event["status"],
        }))
