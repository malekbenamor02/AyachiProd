# API Schema & Endpoints
## Aziz Ayachi Gallery Management System

### Base URL
```
Production: https://api.azizayachi.com
Development: http://localhost:3001
```

### Authentication

**Admin Authentication:**
- Uses Supabase Auth (JWT tokens)
- Include token in header: `Authorization: Bearer <token>`

**Client Authentication:**
- Uses custom JWT tokens generated for gallery access
- Include token in header: `Authorization: Bearer <gallery_token>`

---

## API Endpoints

### 1. Admin Authentication

#### POST `/api/auth/admin/login`
Admin login endpoint.

**Request:**
```json
{
  "email": "admin@azizayachi.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@azizayachi.com",
    "full_name": "Aziz Ayachi",
    "role": "admin"
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

#### POST `/api/auth/admin/logout`
Admin logout endpoint.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### GET `/api/auth/admin/me`
Get current admin user info.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "admin@azizayachi.com",
    "full_name": "Aziz Ayachi",
    "role": "admin",
    "last_login": "2026-01-15T10:30:00Z"
  }
}
```

---

### 2. Gallery Management

#### GET `/api/admin/galleries`
Get all galleries (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name/client name
- `sort` (optional): Sort field (default: created_at)
- `order` (optional): asc/desc (default: desc)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Wedding Collection - John & Jane",
      "client_name": "John & Jane",
      "client_email": "john@example.com",
      "event_date": "2026-06-15",
      "file_count": 150,
      "total_size": 5242880000,
      "access_count": 45,
      "last_accessed": "2026-01-20T14:30:00Z",
      "created_at": "2026-01-10T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

#### POST `/api/admin/galleries`
Create a new gallery.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "name": "Wedding Collection - John & Jane",
  "client_name": "John & Jane",
  "client_email": "john@example.com",
  "password": "client123",
  "description": "Beautiful wedding ceremony",
  "event_date": "2026-06-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Wedding Collection - John & Jane",
    "client_name": "John & Jane",
    "client_email": "john@example.com",
    "event_date": "2026-06-15",
    "created_at": "2026-01-15T10:00:00Z"
  }
}
```

---

#### GET `/api/admin/galleries/:id`
Get gallery details by ID.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Wedding Collection - John & Jane",
    "client_name": "John & Jane",
    "client_email": "john@example.com",
    "password_hash": "hashed_password",
    "description": "Beautiful wedding ceremony",
    "event_date": "2026-06-15",
    "file_count": 150,
    "total_size": 5242880000,
    "access_count": 45,
    "created_at": "2026-01-10T09:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z"
  }
}
```

---

#### PUT `/api/admin/galleries/:id`
Update gallery information.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "name": "Updated Gallery Name",
  "client_name": "Updated Client",
  "password": "newpassword123",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Gallery Name",
    "updated_at": "2026-01-15T11:00:00Z"
  }
}
```

---

#### DELETE `/api/admin/galleries/:id`
Delete a gallery (and all associated files).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Gallery deleted successfully"
}
```

---

### 3. File Upload

#### POST `/api/admin/galleries/:galleryId/upload`
Upload a single file or initiate chunked upload.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request (Form Data):**
- `file`: File to upload
- `chunkIndex` (optional): Chunk number (for chunked uploads)
- `totalChunks` (optional): Total number of chunks
- `uploadId` (optional): Upload session ID (for chunked uploads)

**Response (200) - Single file:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "file_name": "IMG_1234.jpg",
    "file_url": "https://cdn.azizayachi.com/galleries/uuid/IMG_1234.jpg",
    "file_size": 5242880,
    "file_type": "image",
    "width": 4000,
    "height": 3000,
    "uploaded_at": "2026-01-15T10:30:00Z"
  }
}
```

**Response (200) - Chunked upload (first chunk):**
```json
{
  "success": true,
  "uploadId": "upload_session_uuid",
  "chunkIndex": 0,
  "totalChunks": 10,
  "message": "Chunk uploaded, continue with next chunk"
}
```

**Response (200) - Chunked upload (last chunk):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "file_name": "video.mp4",
    "file_url": "https://cdn.azizayachi.com/galleries/uuid/video.mp4",
    "uploaded_at": "2026-01-15T10:35:00Z"
  }
}
```

---

#### POST `/api/admin/galleries/:galleryId/upload/chunk`
Upload a chunk for large files.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request (Form Data):**
- `chunk`: Chunk file
- `uploadId`: Upload session ID
- `chunkIndex`: Current chunk index
- `totalChunks`: Total chunks

**Response (200):**
```json
{
  "success": true,
  "chunkIndex": 5,
  "totalChunks": 10,
  "progress": 50
}
```

---

#### GET `/api/admin/galleries/:galleryId/files`
Get all files in a gallery.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `file_type` (optional): Filter by 'image' or 'video'
- `sort` (optional): Sort field (default: display_order)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "file_name": "IMG_1234.jpg",
      "original_name": "Wedding Photo 1.jpg",
      "file_url": "https://cdn.azizayachi.com/galleries/uuid/IMG_1234.jpg",
      "thumbnail_url": "https://cdn.azizayachi.com/galleries/uuid/thumb_IMG_1234.jpg",
      "file_type": "image",
      "mime_type": "image/jpeg",
      "file_size": 5242880,
      "width": 4000,
      "height": 3000,
      "display_order": 0,
      "uploaded_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

---

#### DELETE `/api/admin/galleries/:galleryId/files/:fileId`
Delete a file from gallery.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

#### PUT `/api/admin/galleries/:galleryId/files/:fileId/reorder`
Update file display order.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "display_order": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "display_order": 5
  }
}
```

---

### 4. QR Code Generation

#### POST `/api/admin/galleries/:id/generate-qr`
Generate QR code for a gallery.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request (optional):**
```json
{
  "expires_in_days": 365
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "gallery_jwt_token",
    "qr_code_url": "https://cdn.azizayachi.com/qr-codes/uuid.png",
    "qr_code_data": "data:image/png;base64,iVBORw0KGgo...",
    "gallery_url": "https://azizayachi.com/gallery/token",
    "expires_at": "2027-01-15T10:00:00Z"
  }
}
```

---

#### GET `/api/admin/galleries/:id/qr-code`
Get existing QR code for a gallery.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "gallery_jwt_token",
    "qr_code_url": "https://cdn.azizayachi.com/qr-codes/uuid.png",
    "qr_code_data": "data:image/png;base64,iVBORw0KGgo...",
    "expires_at": "2027-01-15T10:00:00Z"
  }
}
```

---

### 5. Statistics

#### GET `/api/admin/statistics`
Get dashboard statistics.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_galleries": 50,
    "total_files": 5000,
    "total_storage_bytes": 107374182400,
    "total_storage_gb": 100,
    "total_access_count": 1250,
    "recent_uploads": [
      {
        "gallery_name": "Wedding Collection",
        "file_count": 10,
        "uploaded_at": "2026-01-15T10:00:00Z"
      }
    ],
    "recent_access": [
      {
        "gallery_name": "Wedding Collection",
        "accessed_at": "2026-01-15T09:30:00Z"
      }
    ]
  }
}
```

---

### 6. Client Gallery Access

#### POST `/api/client/authenticate`
Authenticate client with gallery token and password.

**Request:**
```json
{
  "token": "gallery_jwt_token",
  "password": "client123"
}
```

**Response (200):**
```json
{
  "success": true,
  "access_token": "new_jwt_token_for_session",
  "gallery": {
    "id": "uuid",
    "name": "Wedding Collection - John & Jane",
    "client_name": "John & Jane",
    "event_date": "2026-06-15"
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "Invalid password"
}
```

---

#### GET `/api/client/gallery`
Get gallery files (client access).

**Headers:**
```
Authorization: Bearer <client_access_token>
```

**Response (200):**
```json
{
  "success": true,
  "gallery": {
    "id": "uuid",
    "name": "Wedding Collection - John & Jane",
    "client_name": "John & Jane",
    "event_date": "2026-06-15"
  },
  "files": [
    {
      "id": "uuid",
      "file_name": "IMG_1234.jpg",
      "file_url": "https://cdn.azizayachi.com/galleries/uuid/IMG_1234.jpg",
      "thumbnail_url": "https://cdn.azizayachi.com/galleries/uuid/thumb_IMG_1234.jpg",
      "file_type": "image",
      "file_size": 5242880,
      "width": 4000,
      "height": 3000
    }
  ]
}
```

---

#### GET `/api/client/download/:fileId`
Get download URL for a file.

**Headers:**
```
Authorization: Bearer <client_access_token>
```

**Response (200):**
```json
{
  "success": true,
  "download_url": "https://cdn.azizayachi.com/galleries/uuid/IMG_1234.jpg?download=true",
  "expires_in": 3600
}
```

---

#### POST `/api/client/download/batch`
Get download URLs for multiple files (zip).

**Headers:**
```
Authorization: Bearer <client_access_token>
```

**Request:**
```json
{
  "file_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response (200):**
```json
{
  "success": true,
  "zip_url": "https://cdn.azizayachi.com/downloads/uuid.zip",
  "expires_in": 3600
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Invalid or missing authentication token
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `FILE_TOO_LARGE` (413): File exceeds size limit
- `UPLOAD_FAILED` (500): File upload failed
- `RATE_LIMIT_EXCEEDED` (429): Too many requests

---

## Rate Limiting

- **Admin endpoints**: 100 requests/minute
- **Client endpoints**: 30 requests/minute
- **File upload**: 10 uploads/minute

---

## Webhooks (Optional)

### POST `/api/webhooks/gallery-accessed`
Triggered when a client accesses a gallery.

**Payload:**
```json
{
  "event": "gallery.accessed",
  "gallery_id": "uuid",
  "timestamp": "2026-01-15T10:00:00Z"
}
```

---

**Last Updated:** 2026  
**Version:** 1.0
