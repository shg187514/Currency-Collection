# TreeSpace API Documentation

This document describes the REST API endpoints provided by the TreeSpace backend.

## Base URL
`/api`

---

## Nodes

### Get Full Tree
- **URL**: `/nodes/tree`
- **Method**: `GET`
- **Description**: Retrieves the entire hierarchical tree of active nodes (excluding archived and deleted).
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "title": "Root Node",
        "children": [ ... ]
      }
    ]
  }
  ```

### Create Node
- **URL**: `/nodes`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "title": "New Note",
    "parentId": "uuid-or-null"
  }
  ```
- **Response**: `201 Created`

### Update Node
- **URL**: `/nodes/:id`
- **Method**: `PUT`
- **Body**: (All fields optional)
  ```json
  {
    "title": "Updated Title",
    "description": "Short summary",
    "content": "# Markdown content",
    "tagIds": ["uuid1", "uuid2"]
  }
  ```
- **Response**: `200 OK`

### Delete Node (Soft Delete)
- **URL**: `/nodes/:id`
- **Method**: `DELETE`
- **Description**: Moves the node to the trash.
- **Response**: `204 No Content`

### Move Node
- **URL**: `/nodes/:id/move`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "newParentId": "uuid-or-null",
    "siblingIds": ["uuid1", "uuid2"]
  }
  ```
- **Response**: `200 OK`

### Duplicate Node
- **URL**: `/nodes/:id/duplicate`
- **Method**: `POST`
- **Description**: Deep clones a node and all its children.
- **Response**: `201 Created`

### Toggle Favorite
- **URL**: `/nodes/:id/favorite` (or `/unfavorite`)
- **Method**: `POST`
- **Response**: `200 OK`

### Get Node History
- **URL**: `/nodes/:id/history`
- **Method**: `GET`
- **Response**: `200 OK`

---

## Trash

### Get Trash
- **URL**: `/nodes/trash`
- **Method**: `GET`
- **Response**: `200 OK`

### Restore from Trash
- **URL**: `/nodes/:id/restore-trash`
- **Method**: `POST`
- **Response**: `200 OK`

### Permanent Delete
- **URL**: `/nodes/:id/permanent`
- **Method**: `DELETE`
- **Response**: `204 No Content`

### Empty Trash
- **URL**: `/nodes/trash`
- **Method**: `DELETE`
- **Response**: `204 No Content`

---

## Attachments

### Upload Attachment
- **URL**: `/nodes/:nodeId/attachments`
- **Method**: `POST`
- **Headers**: `Content-Type: multipart/form-data`
- **Body**: FormData containing a `file` field.
- **Response**: `201 Created`

### Delete Attachment
- **URL**: `/attachments/:id`
- **Method**: `DELETE`
- **Response**: `204 No Content`

---

## Tags

### Get All Tags
- **URL**: `/tags`
- **Method**: `GET`
- **Response**: `200 OK`

### Create Tag
- **URL**: `/tags`
- **Method**: `POST`
- **Body**: `{ "name": "Work", "color": "#ff0000" }`
- **Response**: `201 Created`

---

## Stats

### Get Dashboard Stats
- **URL**: `/stats`
- **Method**: `GET`
- **Description**: Retrieves workspace aggregations (node counts, media breakdowns, total storage, global activity).
- **Response**: `200 OK`
